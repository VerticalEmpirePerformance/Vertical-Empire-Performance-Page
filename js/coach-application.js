function initCoachApplication() {
  var form = document.getElementById('applicationForm');
  if (!form) return;

  var messageEl = document.getElementById('applicationMessage');
  var submitBtn = document.getElementById('applicationSubmit');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    messageEl.textContent = '';
    messageEl.className = 'account-message';

    var fullName = document.getElementById('applicantName').value.trim();
    var age = Number(document.getElementById('applicantAge').value);
    var email = document.getElementById('applicantEmail').value.trim();
    var country = document.getElementById('applicantCountry').value;
    var phone = document.getElementById('applicantPhone').value.trim();
    var yearsExperience = document.getElementById('applicantYearsExperience').value;
    var days = Array.prototype.slice.call(document.querySelectorAll('input[name="applicantDays"]:checked')).map(function (el) {
      return el.value;
    });

    if (!days.length) {
      messageEl.textContent = 'Selecciona al menos un día disponible.';
      messageEl.className = 'account-message visible error';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    supabaseClient.from('coach_applications').insert({
      full_name: fullName,
      age: age,
      email: email,
      country: country,
      phone: phone,
      years_experience: yearsExperience,
      available_days: days
    }).then(function (result) {
      if (result.error) {
        messageEl.textContent = 'Ocurrió un error al enviar tu aplicación. Intenta de nuevo.';
        messageEl.className = 'account-message visible error';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar aplicación';
        return;
      }

      messageEl.textContent = '¡Aplicación enviada! Nos pondremos en contacto contigo pronto.';
      messageEl.className = 'account-message visible success';
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar aplicación';
    });
  });
}

document.addEventListener('DOMContentLoaded', initCoachApplication);
