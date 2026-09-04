(function () {
  var COACH_PANEL_PAGES = ['panel-coach.html', 'panel-coach-cliente.html', 'panel-coach-llamadas.html'];
  var navigatingWithinPanel = false;

  function isCoachPanelPage(href) {
    var path = href.split('?')[0].split('#')[0];
    path = path.split('/').pop();
    return COACH_PANEL_PAGES.indexOf(path) !== -1;
  }

  function signOutNow() {
    if (window.supabaseClient) {
      supabaseClient.auth.signOut();
    }
  }

  if (window.VertexWarp) {
    var originalNavigate = window.VertexWarp.navigate;
    window.VertexWarp.navigate = function (href) {
      if (isCoachPanelPage(href)) {
        navigatingWithinPanel = true;
      } else {
        signOutNow();
      }
      return originalNavigate(href);
    };
  }

  window.addEventListener('pagehide', function () {
    if (!navigatingWithinPanel) {
      signOutNow();
    }
  });
})();
