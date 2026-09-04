function parseCallTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  var match = timeStr.match(/(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)/i);
  if (!match) return 0;
  var hour = Number(match[1]);
  var minute = Number(match[2]);
  var period = match[3].toLowerCase();
  if (period === 'p.m.' && hour !== 12) hour += 12;
  if (period === 'a.m.' && hour === 12) hour = 0;
  return hour * 60 + minute;
}

function initCoachCalls() {
  var listEl = document.getElementById('callsList');
  if (!listEl) return;

  var weekdayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  supabaseClient.auth.getSession().then(function (result) {
    var session = result.data && result.data.session;
    if (!session) {
      window.location.href = 'entrenador.html';
      return;
    }

    supabaseClient.from('profiles').select('role').eq('id', session.user.id).single().then(function (coachResult) {
      var coachProfile = coachResult.data;
      if (!coachProfile || coachProfile.role !== 'coach') {
        window.location.href = 'entrenador.html';
        return;
      }

      supabaseClient.from('profiles')
        .select('id, full_name, call_date, call_time, call_status')
        .not('call_date', 'is', null)
        .then(function (result) {
          var rows = result.data || [];

          if (!rows.length) {
            listEl.innerHTML = '<p class="coach-client-empty">No hay llamadas ni revisiones semanales agendadas por el momento.</p>';
            return;
          }

          rows.sort(function (a, b) {
            if (a.call_date !== b.call_date) return a.call_date < b.call_date ? -1 : 1;
            return parseCallTimeToMinutes(a.call_time) - parseCallTimeToMinutes(b.call_time);
          });

          var groups = [];
          var groupsByDate = {};
          rows.forEach(function (row) {
            if (!groupsByDate[row.call_date]) {
              var group = { date: row.call_date, rows: [] };
              groupsByDate[row.call_date] = group;
              groups.push(group);
            }
            groupsByDate[row.call_date].rows.push(row);
          });

          listEl.innerHTML = '';

          groups.forEach(function (group) {
            var parts = group.date.split('-');
            var dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            var dateLabel = weekdayNames[dateObj.getDay()] + ' ' + dateObj.getDate() + ' de ' + monthNames[dateObj.getMonth()];

            var dayHeading = document.createElement('p');
            dayHeading.className = 'coach-calls-day-heading';
            dayHeading.textContent = dateLabel;
            listEl.appendChild(dayHeading);

            group.rows.forEach(function (row) {
              var item = document.createElement('a');
              item.className = 'coach-call-item warp-link';
              item.href = 'panel-coach-cliente.html?id=' + encodeURIComponent(row.id);

              var info = document.createElement('span');
              info.className = 'coach-call-item-info';
              info.textContent = (row.call_time || '—') + ' — ' + (row.full_name || 'Cliente');
              item.appendChild(info);

              var dot = document.createElement('span');
              dot.className = 'coach-call-item-dot call-status-' + (row.call_status === 'missed' ? 'red' : row.call_status === 'completed' ? 'green' : 'purple');
              item.appendChild(dot);

              listEl.appendChild(item);
            });
          });
        });
    });
  });
}

document.addEventListener('DOMContentLoaded', initCoachCalls);
