function translateAuthError(message) {
  var map = {
    'Invalid login credentials': 'Correo o contraseña incorrectos.',
    'Email not confirmed': 'Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.',
    'User already registered': 'Ya existe una cuenta con ese correo. Intenta iniciar sesión.',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
    'Unable to validate email address: invalid format': 'El correo electrónico no es válido.'
  };
  return map[message] || message;
}

function showMessage(el, text, type) {
  el.textContent = text;
  el.className = 'account-message visible ' + type;
}

function clearMessage(el) {
  el.textContent = '';
  el.className = 'account-message';
}

function initAccount() {
  var config = window.ACCOUNT_CONFIG || { role: 'user', redirectTo: 'membresias.html' };
  var tabLogin = document.getElementById('tabLogin');
  var tabSignup = document.getElementById('tabSignup');
  var loginForm = document.getElementById('loginForm');
  var signupForm = document.getElementById('signupForm');
  var goSignup = document.getElementById('goSignup');
  var goLogin = document.getElementById('goLogin');
  var loginMessage = document.getElementById('loginMessage');
  var signupMessage = document.getElementById('signupMessage');
  var loginSubmit = document.getElementById('loginSubmit');
  var signupSubmit = document.getElementById('signupSubmit');

  if (!loginForm) return;

  function showLogin() {
    if (tabLogin) tabLogin.classList.add('active');
    if (tabSignup) tabSignup.classList.remove('active');
    loginForm.classList.remove('hidden');
    if (signupForm) signupForm.classList.add('hidden');
    clearMessage(loginMessage);
    if (signupMessage) clearMessage(signupMessage);
  }

  function showSignup() {
    if (tabSignup) tabSignup.classList.add('active');
    if (tabLogin) tabLogin.classList.remove('active');
    if (signupForm) signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    clearMessage(loginMessage);
    if (signupMessage) clearMessage(signupMessage);
  }

  if (tabLogin) tabLogin.addEventListener('click', showLogin);
  if (tabSignup) tabSignup.addEventListener('click', showSignup);
  if (goSignup) goSignup.addEventListener('click', showSignup);
  if (goLogin) goLogin.addEventListener('click', showLogin);

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearMessage(loginMessage);

    var email = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value;

    loginSubmit.disabled = true;
    loginSubmit.textContent = 'Iniciando sesión...';

    supabaseClient.auth.signInWithPassword({ email: email, password: password })
      .then(function (result) {
        if (result.error) {
          showMessage(loginMessage, translateAuthError(result.error.message), 'error');
          loginSubmit.disabled = false;
          loginSubmit.textContent = 'Iniciar sesión';
          return;
        }

        var userId = result.data.user.id;
        supabaseClient.from('profiles').select('role, is_approved').eq('id', userId).single()
          .then(function (profileResult) {
            var profile = profileResult.data;

            if (!profile) {
              showMessage(loginMessage, 'No encontramos tu perfil. Contacta a soporte.', 'error');
              supabaseClient.auth.signOut();
              loginSubmit.disabled = false;
              loginSubmit.textContent = 'Iniciar sesión';
              return;
            }

            if (profile.role !== config.role) {
              var wrongRoleText = config.role === 'coach'
                ? 'Esta cuenta no es de coach. Usa el acceso de usuarios.'
                : 'Esta cuenta es de coach. Usa el acceso de entrenadores.';
              showMessage(loginMessage, wrongRoleText, 'error');
              supabaseClient.auth.signOut();
              loginSubmit.disabled = false;
              loginSubmit.textContent = 'Iniciar sesión';
              return;
            }

            if (config.role === 'coach' && !profile.is_approved) {
              showMessage(loginMessage, 'Tu cuenta de coach todavía no ha sido aprobada.', 'error');
              supabaseClient.auth.signOut();
              loginSubmit.disabled = false;
              loginSubmit.textContent = 'Iniciar sesión';
              return;
            }

            showMessage(loginMessage, '¡Bienvenido! Redirigiendo...', 'success');
            setTimeout(function () {
              if (window.VertexWarp) {
                window.VertexWarp.navigate(config.redirectTo);
              } else {
                window.location.href = config.redirectTo;
              }
            }, 600);
          });
      })
      .catch(function () {
        showMessage(loginMessage, 'Ocurrió un error de conexión. Intenta de nuevo.', 'error');
        loginSubmit.disabled = false;
        loginSubmit.textContent = 'Iniciar sesión';
      });
  });

  if (signupForm) signupForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearMessage(signupMessage);

    var name = document.getElementById('signupName').value.trim();
    var email = document.getElementById('signupEmail').value.trim();
    var birthdate = document.getElementById('signupBirthdate').value;
    var country = document.getElementById('signupCountry').value;
    var phoneCode = document.getElementById('signupPhoneCode').value;
    var phone = document.getElementById('signupPhone').value.trim();
    var password = document.getElementById('signupPassword').value;
    var passwordConfirm = document.getElementById('signupPasswordConfirm').value;

    if (!birthdate || !country || !phone) {
      showMessage(signupMessage, 'Completa tu fecha de nacimiento, país y teléfono.', 'error');
      return;
    }

    if (password !== passwordConfirm) {
      showMessage(signupMessage, 'Las contraseñas no coinciden.', 'error');
      return;
    }

    signupSubmit.disabled = true;
    signupSubmit.textContent = 'Creando cuenta...';

    supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          role: config.role,
          full_name: name,
          birthdate: birthdate,
          country: country,
          phone_code: phoneCode,
          phone: phone
        }
      }
    }).then(function (result) {
      if (result.error) {
        showMessage(signupMessage, translateAuthError(result.error.message), 'error');
        signupSubmit.disabled = false;
        signupSubmit.textContent = 'Crear cuenta';
        return;
      }

      var session = result.data && result.data.session;
      if (session) {
        var afterSignupText = config.role === 'coach'
          ? 'Cuenta creada. Un administrador debe aprobarla antes de que puedas acceder. Redirigiendo...'
          : '¡Cuenta creada! Redirigiendo...';
        showMessage(signupMessage, afterSignupText, 'success');
        setTimeout(function () {
          if (window.VertexWarp) {
            window.VertexWarp.navigate(config.redirectTo);
          } else {
            window.location.href = config.redirectTo;
          }
        }, 900);
      } else {
        showMessage(signupMessage, 'Cuenta creada. Revisa tu correo para confirmarla antes de iniciar sesión.', 'success');
        signupSubmit.disabled = false;
        signupSubmit.textContent = 'Crear cuenta';
      }
    }).catch(function () {
      showMessage(signupMessage, 'Ocurrió un error de conexión. Intenta de nuevo.', 'error');
      signupSubmit.disabled = false;
      signupSubmit.textContent = 'Crear cuenta';
    });
  });
}

document.addEventListener('DOMContentLoaded', initAccount);
