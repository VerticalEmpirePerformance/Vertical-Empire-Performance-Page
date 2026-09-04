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

      var fullCallSchedule = document.getElementById('fullCallSchedule');
      var fullCallExtra = document.getElementById('fullCallExtra');
      if (profile.membership !== 'full') {
        if (fullCallSchedule) fullCallSchedule.style.display = 'none';
        if (fullCallExtra) fullCallExtra.style.display = 'none';
      }

      var coachRoutineDisplay = document.getElementById('coachRoutineDisplay');
      if (coachRoutineDisplay) {
        if (profile.coach_routine) {
          coachRoutineDisplay.textContent = profile.coach_routine;
        } else {
          coachRoutineDisplay.innerHTML = '<p class="dashboard-subcard-placeholder">Tu coach todavía no te ha asignado una rutina.</p>';
        }
      }

      var coachTipsDisplay = document.getElementById('coachTipsDisplay');
      if (coachTipsDisplay) {
        if (profile.coach_tips) {
          coachTipsDisplay.textContent = profile.coach_tips;
        } else {
          coachTipsDisplay.innerHTML = '<p class="dashboard-subcard-placeholder">Tu coach todavía no te ha dejado consejos.</p>';
        }
      }

      var requestFeedbackBtn = document.getElementById('requestFeedbackBtn');
      if (requestFeedbackBtn) {
        requestFeedbackBtn.addEventListener('click', function () {
          requestFeedbackBtn.disabled = true;
          requestFeedbackBtn.textContent = 'Solicitando...';

          supabaseClient.from('profiles').update({
            feedback_requested_at: new Date().toISOString(),
            feedback_status: 'pending'
          }).eq('id', user.id).then(function (updateResult) {
            requestFeedbackBtn.disabled = false;
            requestFeedbackBtn.textContent = updateResult.error ? 'Error, intenta de nuevo' : 'Solicitada';
            setTimeout(function () {
              requestFeedbackBtn.textContent = 'Solicitar';
            }, 1500);
          });
        });
      }
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
