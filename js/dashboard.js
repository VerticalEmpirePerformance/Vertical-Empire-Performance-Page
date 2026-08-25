function formatBirthdate(value) {
  if (!value) return '—';
  var parts = value.split('-');
  if (parts.length !== 3) return value;
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

function initDashboard() {
  var logoutBtn = document.getElementById('logoutBtn');

  supabaseClient.auth.getSession().then(function (result) {
    var session = result.data && result.data.session;
    if (!session) {
      window.location.href = 'cuenta.html';
      return;
    }

    var user = session.user;
    var justCheckedOut = new URLSearchParams(window.location.search).get('checkout') === 'success';

    loadProfile(user, justCheckedOut ? 5 : 0);

    function loadProfile(user, retriesLeft) {
      supabaseClient.from('profiles').select('*').eq('id', user.id).single().then(function (profileResult) {
        var profile = profileResult.data || {};

        if (profile.role && profile.role !== 'user') {
          window.location.href = 'cuenta.html';
          return;
        }

        if (!profile.membership) {
          if (retriesLeft > 0) {
            setTimeout(function () { loadProfile(user, retriesLeft - 1); }, 1000);
            return;
          }
          window.location.href = 'membresias.html';
          return;
        }

        renderProfile(user, profile);
      });
    }

    function renderProfile(user, profile) {
      var fullName = profile.full_name || user.email;

      document.getElementById('dashboardTitle').textContent = 'Bienvenido, ' + fullName + '.';
      document.getElementById('dashboardEmail').textContent = user.email;

      document.getElementById('infoName').textContent = profile.full_name || '—';
      document.getElementById('infoEmail').textContent = user.email || '—';
      document.getElementById('infoBirthdate').textContent = formatBirthdate(profile.birthdate);
      document.getElementById('infoCountry').textContent = profile.country || '—';

      var phoneCode = profile.phone_code || '';
      var phone = profile.phone || '';
      document.getElementById('infoPhone').textContent = (phoneCode || phone) ? (phoneCode + ' ' + phone).trim() : '—';
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

document.addEventListener('DOMContentLoaded', initDashboard);
