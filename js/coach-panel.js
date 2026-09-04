function renderClientList(elId, rows) {
  var el = document.getElementById(elId);
  if (!el) return;

  if (!rows || !rows.length) {
    el.innerHTML = '<p class="coach-client-empty">Sin clientes todavía.</p>';
    return;
  }

  el.innerHTML = '';
  rows.forEach(function (row) {
    var item = document.createElement('a');
    item.className = 'coach-client-item warp-link';
    item.href = 'panel-coach-cliente.html?id=' + encodeURIComponent(row.id);
    item.textContent = row.full_name || 'Sin nombre';
    el.appendChild(item);
  });
}

function loadColumn(tier, elId) {
  var el = document.getElementById(elId);
  if (!el) return;

  supabaseClient.from('profiles').select('id, full_name').eq('membership', tier).order('full_name').then(function (result) {
    if (result.error) {
      el.innerHTML = '<p class="coach-client-empty">Error al cargar.</p>';
      return;
    }
    renderClientList(elId, result.data);
  });
}

function initCoachPanel() {
  var basicList = document.getElementById('basicList');
  if (!basicList) return;

  supabaseClient.auth.getSession().then(function (result) {
    var session = result.data && result.data.session;
    if (!session) {
      window.location.href = 'entrenador.html';
      return;
    }

    supabaseClient.from('profiles').select('role').eq('id', session.user.id).single().then(function (profileResult) {
      var profile = profileResult.data;
      if (!profile || profile.role !== 'coach') {
        window.location.href = 'entrenador.html';
        return;
      }

      loadColumn('basic', 'basicList');
      loadColumn('coaching', 'coachingList');
      loadColumn('full', 'fullList');
    });
  });
}

document.addEventListener('DOMContentLoaded', initCoachPanel);
