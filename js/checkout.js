var currentMembership = null;

function initCheckout() {
  var buttons = document.querySelectorAll('.checkout-btn');
  if (!buttons.length) return;

  var messageEl = document.getElementById('checkoutMessage');
  var params = new URLSearchParams(window.location.search);

  if (messageEl && params.get('checkout') === 'cancelled') {
    messageEl.textContent = 'Pago cancelado. Puedes intentarlo de nuevo cuando quieras.';
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.dataset.owned === 'true') {
        if (window.VertexWarp) {
          window.VertexWarp.navigate('plataforma.html');
        } else {
          window.location.href = 'plataforma.html';
        }
        return;
      }

      var tier = btn.getAttribute('data-tier');

      if (currentMembership && currentMembership !== tier) {
        var currentName = (window.MEMBERSHIP_NAMES && MEMBERSHIP_NAMES[currentMembership]) || currentMembership;
        var newName = (window.MEMBERSHIP_NAMES && MEMBERSHIP_NAMES[tier]) || tier;
        showConfirmModal(
          '¿Cambiar de membresía?',
          'Actualmente tienes ' + currentName + '. ¿Quieres cambiar a ' + newName + '?'
        ).then(function (confirmed) {
          if (confirmed) startCheckout(tier, btn, messageEl);
        });
        return;
      }

      startCheckout(tier, btn, messageEl);
    });
  });

  applyOwnedMembershipState(buttons);
}

function applyOwnedMembershipState(buttons) {
  if (!window.supabaseClient) return;

  supabaseClient.auth.getSession().then(function (result) {
    var session = result.data && result.data.session;
    if (!session) return;

    supabaseClient.from('profiles').select('membership').eq('id', session.user.id).single().then(function (profileResult) {
      var profile = profileResult.data || {};
      if (!profile.membership) return;

      currentMembership = profile.membership;

      buttons.forEach(function (btn) {
        var card = btn.closest('.pricing-card');
        if (btn.getAttribute('data-tier') === profile.membership) {
          btn.textContent = 'Ir a la plataforma';
          btn.dataset.owned = 'true';
          if (card) card.classList.add('owned');
        } else if (window.LOCK_UNOWNED_TIERS) {
          btn.textContent = 'Bloqueada';
          btn.disabled = true;
          if (card) card.classList.add('locked');
        }
      });
    });
  });
}

function showConfirmModal(title, text) {
  return new Promise(function (resolve) {
    var overlay = document.createElement('div');
    overlay.className = 'confirm-modal-overlay';
    overlay.innerHTML =
      '<div class="confirm-modal">' +
        '<p class="confirm-modal-title"></p>' +
        '<p class="confirm-modal-text"></p>' +
        '<div class="confirm-modal-actions">' +
          '<button type="button" class="btn-secondary confirm-modal-no">No</button>' +
          '<button type="button" class="btn-primary confirm-modal-yes">Sí, cambiar</button>' +
        '</div>' +
      '</div>';
    overlay.querySelector('.confirm-modal-title').textContent = title;
    overlay.querySelector('.confirm-modal-text').textContent = text;
    document.body.appendChild(overlay);
    void overlay.offsetHeight;
    overlay.classList.add('open');

    function close(result) {
      overlay.classList.remove('open');
      setTimeout(function () { overlay.remove(); }, 200);
      resolve(result);
    }

    overlay.querySelector('.confirm-modal-yes').addEventListener('click', function () { close(true); });
    overlay.querySelector('.confirm-modal-no').addEventListener('click', function () { close(false); });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close(false);
    });
  });
}

function startCheckout(tier, btn, messageEl) {
  if (messageEl) messageEl.textContent = '';

  supabaseClient.auth.getSession().then(function (result) {
    var session = result.data && result.data.session;
    if (!session) {
      window.location.href = 'cuenta.html';
      return;
    }

    var originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Cargando...';

    fetch(SUPABASE_URL + '/functions/v1/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + session.access_token
      },
      body: JSON.stringify({ tier: tier, origin: window.location.origin })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'No se pudo iniciar el pago.');
        }
      })
      .catch(function (err) {
        btn.disabled = false;
        btn.textContent = originalText;
        if (messageEl) messageEl.textContent = 'Error: ' + err.message;
      });
  });
}

document.addEventListener('DOMContentLoaded', initCheckout);
