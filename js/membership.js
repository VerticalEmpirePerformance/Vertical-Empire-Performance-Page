function initMembership() {
  var welcomeTitle = document.getElementById('welcomeTitle');
  var logoutBtn = document.getElementById('logoutBtn');

  supabaseClient.auth.getSession().then(function (result) {
    var session = result.data && result.data.session;
    if (!session) {
      window.location.href = 'cuenta.html';
      return;
    }
    var user = session.user;
    var name = (user.user_metadata && user.user_metadata.full_name) || null;
    var firstName = name ? name.split(' ')[0] : null;
    if (welcomeTitle) {
      welcomeTitle.textContent = firstName
        ? 'Hola ' + firstName + ', elige tu membresía.'
        : 'Elige tu membresía.';
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      supabaseClient.auth.signOut().then(function () {
        window.location.href = 'cuenta.html';
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', initMembership);
