(function () {
  var link = document.getElementById('navAccountLink');
  if (!link) return;

  var menu = document.getElementById('navAccountMenu');
  var logoutBtn = document.getElementById('navLogoutBtn');
  var hasSession = false;

  function closeMenu() {
    menu.classList.remove('open');
  }

  function toggleMenu() {
    menu.classList.toggle('open');
  }

  link.addEventListener('click', function (e) {
    if (hasSession) {
      e.preventDefault();
      e.stopImmediatePropagation();
      toggleMenu();
    }
  });

  document.addEventListener('click', function (e) {
    if (!menu.contains(e.target) && !link.contains(e.target)) {
      closeMenu();
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      supabaseClient.auth.signOut().then(function () {
        window.location.href = 'index.html';
      });
    });
  }

  if (window.supabaseClient) {
    supabaseClient.auth.getSession().then(function (result) {
      var session = result.data && result.data.session;
      if (!session) return;

      hasSession = true;

      supabaseClient.from('profiles').select('full_name').eq('id', session.user.id).single().then(function (profileResult) {
        var profile = profileResult.data || {};
        var name = profile.full_name || session.user.email || '';

        if (window.NAV_SHOW_FULL_NAME) {
          link.textContent = name;
          link.classList.add('has-session', 'nav-account-name');
        } else {
          link.textContent = name.trim().charAt(0).toUpperCase() || '?';
          link.classList.add('has-session');
        }

        link.setAttribute('aria-label', 'Menú de cuenta');
      });
    });
  }
})();
