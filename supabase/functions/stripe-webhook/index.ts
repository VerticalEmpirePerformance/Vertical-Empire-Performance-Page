import Stripe from "npm:stripe@17.4.0";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-11-20.acacia",
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

async function getProfile(userId: string) {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("stripe_subscription_id")
    .eq("id", userId)
    .single();
  return data;
}

async function cancelSubscription(subscriptionId: string) {
  try {
    await stripe.subscriptions.cancel(subscriptionId);
  } catch (err) {
    console.error("Failed to cancel previous subscription", subscriptionId, (err as Error).message);
  }
}

Deno.serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${(err as Error).message}`, {
      status: 400,
    });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id || session.client_reference_id;
      const tier = session.metadata?.tier;
      const newSubscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

      if (userId && tier && newSubscriptionId) {
        const profile = await getProfile(userId);
        const previousSubscriptionId = profile?.stripe_subscription_id;

        // Update the DB with the new subscription first so a delayed
        // "subscription.deleted" webhook for the old plan (triggered by the
        // cancellation below) can never race past this and clobber it.
        await supabaseAdmin
          .from("profiles")
          .update({
            membership: tier,
            stripe_customer_id: customerId || null,
            stripe_subscription_id: newSubscriptionId,
          })
          .eq("id", userId);

        if (previousSubscriptionId && previousSubscriptionId !== newSubscriptionId) {
          await cancelSubscription(previousSubscriptionId);
        }
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      const tier = subscription.metadata?.tier;
      if (userId) {
        const isActive = subscription.status === "active" || subscription.status === "trialing";
        // Conditioned on stripe_subscription_id still matching this subscription,
        // atomically, so a stale event for a since-replaced plan is a no-op.
        await supabaseAdmin
          .from("profiles")
          .update({ membership: isActive ? tier || null : null })
          .eq("id", userId)
          .eq("stripe_subscription_id", subscription.id);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({ membership: null, stripe_subscription_id: null })
          .eq("id", userId)
          .eq("stripe_subscription_id", subscription.id);
      }
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
