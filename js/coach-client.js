function initCoachClient() {
  var titleEl = document.getElementById('clientTitle');
  if (!titleEl) return;

  var clientId = new URLSearchParams(window.location.search).get('id');
  if (!clientId) {
    window.location.href = 'panel-coach.html';
    return;
  }

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

      supabaseClient.from('profiles').select('*').eq('id', clientId).single().then(function (clientResult) {
        var client = clientResult.data;
        if (!client) {
          titleEl.textContent = 'Cliente no encontrado.';
          return;
        }

        var fullName = client.full_name || 'Cliente';
        titleEl.textContent = fullName + '.';

        document.getElementById('infoName').textContent = client.full_name || '—';
        document.getElementById('infoEmail').textContent = client.email || '—';

        var phoneCode = client.phone_code || '';
        var phone = client.phone || '';
        document.getElementById('infoPhone').textContent = (phoneCode || phone) ? (phoneCode + ' ' + phone).trim() : '—';

        document.getElementById('infoCountry').textContent = client.country || '—';

        if (client.membership === 'basic') {
          var coachRoutineCard = document.getElementById('coachRoutineCard');
          var callCoachBox = document.getElementById('callCoachBox');
          if (coachRoutineCard) coachRoutineCard.style.display = 'none';
          if (callCoachBox) callCoachBox.style.display = 'none';
        }

        function wireSaveField(textareaId, btnId, column) {
          var textarea = document.getElementById(textareaId);
          var btn = document.getElementById(btnId);
          if (!textarea || !btn) return;

          textarea.value = client[column] || '';

          btn.addEventListener('click', function () {
            btn.disabled = true;
            btn.textContent = 'Guardando...';

            var payload = {};
            payload[column] = textarea.value;

            supabaseClient.from('profiles').update(payload).eq('id', clientId).then(function (updateResult) {
              btn.disabled = false;
              btn.textContent = updateResult.error ? 'Error, intenta de nuevo' : 'Guardado';
              setTimeout(function () {
                btn.textContent = 'Guardar';
              }, 1500);
            });
          });
        }

        wireSaveField('coachRoutineText', 'saveCoachRoutineBtn', 'coach_routine');
        wireSaveField('coachTipsText', 'saveCoachTipsBtn', 'coach_tips');

        var callInfoText = document.getElementById('callInfoText');
        var callStatusButtons = document.getElementById('callStatusButtons');
        var statusBtns = document.querySelectorAll('#callStatusButtons .call-status-btn');
        var weekdayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        var monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

        function renderCallState(callDate, callTime, status) {
          var callDateObj = null;
          if (callDate) {
            var parts = callDate.split('-');
            callDateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          }

          var hasCall = !!(callDateObj && callTime);

          if (callInfoText) {
            if (hasCall) {
              var dateLabel = weekdayNames[callDateObj.getDay()] + ' ' + callDateObj.getDate() + ' de ' + monthNames[callDateObj.getMonth()];
              callInfoText.textContent = 'Revisión semanal: ' + dateLabel + ', ' + callTime;
            } else {
              callInfoText.textContent = 'Ninguna revisión semanal agendada.';
            }
          }

          if (callStatusButtons) callStatusButtons.style.display = hasCall ? 'flex' : 'none';

          if (!hasCall) return;

          var effectiveStatus = status || 'pending';

          var today = new Date();
          today.setHours(0, 0, 0, 0);

          if (callDateObj && effectiveStatus === 'pending' && callDateObj < today) {
            effectiveStatus = 'missed';
            supabaseClient.from('profiles').update({ call_status: 'missed' }).eq('id', clientId).then(function () {});
          }

          statusBtns.forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-status') === effectiveStatus);
          });
        }

        renderCallState(client.call_date, client.call_time, client.call_status);

        statusBtns.forEach(function (btn) {
          btn.addEventListener('click', function () {
            var status = btn.getAttribute('data-status');

            if (status === 'completed') {
              supabaseClient.from('profiles').update({ call_date: null, call_time: null, call_status: 'pending' }).eq('id', clientId).then(function () {
                renderCallState(null, null, 'pending');
              });
            } else {
              statusBtns.forEach(function (b) {
                b.classList.toggle('active', b === btn);
              });
              supabaseClient.from('profiles').update({ call_status: status }).eq('id', clientId).then(function () {});
            }
          });
        });

        var feedbackCoachBox = document.getElementById('feedbackCoachBox');
        if (feedbackCoachBox) {
          if (client.membership !== 'full') {
            feedbackCoachBox.style.display = 'none';
          } else {
            var feedbackInfoText = document.getElementById('feedbackInfoText');
            var feedbackStatusButtons = document.getElementById('feedbackStatusButtons');
            var feedbackBtns = feedbackStatusButtons.querySelectorAll('.call-status-btn');

            function renderFeedbackState(requestedAt, status) {
              if (!requestedAt) {
                feedbackInfoText.textContent = 'No ha sido solicitada.';
                feedbackStatusButtons.style.display = 'none';
                return;
              }

              feedbackInfoText.textContent = 'Retroalimentación solicitada.';
              feedbackStatusButtons.style.display = 'flex';

              var effectiveStatus = status || 'pending';
              var hoursPassed = (Date.now() - new Date(requestedAt).getTime()) / (1000 * 60 * 60);

              if (effectiveStatus === 'pending' && hoursPassed > 24) {
                effectiveStatus = 'missed';
                supabaseClient.from('profiles').update({ feedback_status: 'missed' }).eq('id', clientId).then(function () {});
              }

              feedbackBtns.forEach(function (btn) {
                btn.classList.toggle('active', btn.getAttribute('data-status') === effectiveStatus);
              });
            }

            renderFeedbackState(client.feedback_requested_at, client.feedback_status);

            feedbackBtns.forEach(function (btn) {
              btn.addEventListener('click', function () {
                var status = btn.getAttribute('data-status');

                if (status === 'completed') {
                  supabaseClient.from('profiles').update({ feedback_requested_at: null, feedback_status: 'pending' }).eq('id', clientId).then(function () {
                    renderFeedbackState(null, 'pending');
                  });
                } else {
                  feedbackBtns.forEach(function (b) {
                    b.classList.toggle('active', b === btn);
                  });
                  supabaseClient.from('profiles').update({ feedback_status: status }).eq('id', clientId).then(function () {});
                }
              });
            });
          }
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', initCoachClient);
