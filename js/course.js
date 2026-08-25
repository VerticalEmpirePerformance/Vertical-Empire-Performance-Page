var COURSES = {
  '0a100': {
    title: 'De 0 a 100 en Salto Vertical',
    modules: [
      { name: 'Diagnóstico y técnica de salto vertical', desc: '', videos: ['Introducción', 'Diagnóstico', 'Técnica de salto'] },
      { name: 'Fuerza Muscular', desc: '', videos: ['¿Para qué nos sirve la fuerza muscular?', '¿Cómo entrenar fuerza muscular?', 'Tips para fuerza muscular'] },
      { name: 'Fuerza Explosiva', desc: '', videos: ['¿Para que nos sirve la fuerza explosiva?', '¿Cómo entrenar fuerza explosiva?', 'Tips para fuerza muscular'] },
      { name: 'Isométricos', desc: '', videos: ['¿Para qué nos sirven los isométricos?', '¿Cómo hacer isométricos?', 'Tips para isométricos'] },
      { name: 'Pliométricos', desc: '', videos: ['¿Para qué nos sirven los pliométricos?', '¿Cómo hacer pliométricos?', 'Tips para pliométricos'] }
    ]
  },
  rodillas: {
    title: 'Fuera Dolor de Rodillas y Tendinitis',
    modules: [
      { name: 'Introducción y diagnóstico', desc: '', videos: ['Problemas comunes', 'Diagnóstico'] },
      { name: 'Dolor de Rodillas', desc: '', videos: ['¿Qué es el dolor de rodillas?', '¿Cómo solucionar el dolor de rodillas?', 'Ejercicios iniciales para dolor de rodilla'] },
      { name: 'Tendinitis', desc: '', videos: ['¿Qué es la tendinitis?', '¿Cómo solucionar la tendinitis?', 'Ejercicios iniciales para tendinitis'] }
    ]
  },
  estiramientos: {
    title: 'Estiramientos y Recuperación',
    modules: [
      { name: 'Introducción y diagnóstico', desc: '', videos: ['Introducción', 'Diagnóstico'] },
      { name: 'Estiramientos', desc: '', videos: ['¿Para que no sirven los estiramientos?', '¿Cómo estirarnos?', 'Tips para estiramientos'] },
      { name: 'Recuperación', desc: '', videos: ['¿Para qué recuperarnos?', '¿Cómo recuperarnos?', 'Recuperamiento en lesiones', 'Tips para dormir'] }
    ]
  },
  biologia: {
    title: 'Biología y Alimentación',
    modules: [
      { name: 'Biotipos', desc: '', videos: ['Los 4 biotipos hipocráticos', 'Biotipo Colérico', 'Biotipo Sanguíneo', 'Biotipo Flemático', 'Biotipo Melancólico'] },
      { name: '¿Qué comer y cuánto comer?', desc: '', videos: ['¿Cómo y cuanto comer según tu biotipo?', '¿Cómo y cuanto comer según tu edad?'] },
      { name: 'Hidratación', desc: '', videos: ['La importancia de la hidratación con electrolitos', 'Agua con sal y sus beneficios', '¿Cómo tomar agua con sal?'] },
      { name: 'Suplementos', desc: '', videos: ['Creatina', 'Proteína'] }
    ]
  },
  libreria: {
    title: 'Librería de Ejercicios',
    modules: [
      { name: 'Fuerza Muscular', desc: '', videos: ['Sentadillas', 'ATG Split squat', 'Hip trust', 'Peso muerto', 'Nordic Curl Hamstring', 'Prensa', 'Maquina de isquitobiales', 'Maquina de cuádriceps', 'Seated calf raises'] },
      { name: 'Fuerza Explosiva', desc: '', videos: ['Sentadilla explosivas', 'Salto con mancuernas', 'Maquina de isquitobiales rápida', 'Seated Calf Raises fast', 'hip trust rápido', 'ATG Split squat rápido'] },
      { name: 'Isométricos', desc: '', videos: ['Sentadilla estática', 'Nordic Curl Hamstring estático', 'Isométrico de soleo', 'Hip trust estático'] },
      { name: 'Pliométricos', desc: '', videos: ['Depth jumps', 'Pogo jumps', '1 foot jumps', '2 foot jumps', 'Sprints', 'Reactive jumps'] },
      { name: 'Dolor de rodilla', desc: '', videos: [] },
      { name: 'Tendinitis', desc: '', videos: [] },
      { name: 'Estiramientos', desc: '', videos: [] },
      { name: 'Recuperación', desc: '', videos: [] }
    ]
  }
};

function initCourse() {
  var logoutBtn = document.getElementById('logoutBtn');
  var params = new URLSearchParams(window.location.search);
  var courseId = window.COURSE_ID || params.get('curso');
  var course = COURSES[courseId] || { title: 'Tu curso', modules: [] };

  document.title = 'Vertical Empire Performance — ' + course.title;
  document.getElementById('cursoTitle').textContent = course.title;

  var grid = document.getElementById('moduleGrid');
  course.modules.forEach(function (mod, i) {
    var item = document.createElement('div');
    item.className = 'module-item reveal';
    item.style.transitionDelay = (i * 0.06) + 's';

    var question = document.createElement('button');
    question.type = 'button';
    question.className = 'module-question';

    var left = document.createElement('span');
    left.className = 'module-question-left';

    var number = document.createElement('span');
    number.className = 'module-box-number';
    number.textContent = String(i + 1).padStart(2, '0');

    var label = document.createElement('span');
    label.className = 'module-box-name';
    label.textContent = mod.name;

    left.appendChild(number);
    left.appendChild(label);

    var icon = document.createElement('span');
    icon.className = 'module-icon';
    icon.textContent = '+';

    question.appendChild(left);
    question.appendChild(icon);

    var answerWrap = document.createElement('div');
    answerWrap.className = 'module-answer-wrap';

    var answer = document.createElement('div');
    answer.className = 'module-answer';

    if (mod.desc) {
      var answerText = document.createElement('p');
      answerText.textContent = mod.desc;
      answer.appendChild(answerText);
    }

    var videoList = document.createElement('div');
    videoList.className = 'video-list';

    (mod.videos || []).forEach(function (videoTitle) {
      var videoItem = document.createElement('button');
      videoItem.type = 'button';
      videoItem.className = 'video-item';

      var playIcon = document.createElement('span');
      playIcon.className = 'video-item-icon';
      playIcon.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M8 5v14l11-7z"></path></svg>';

      var videoName = document.createElement('span');
      videoName.className = 'video-item-name';
      videoName.textContent = videoTitle;

      videoItem.appendChild(playIcon);
      videoItem.appendChild(videoName);
      videoList.appendChild(videoItem);
    });

    answer.appendChild(videoList);
    answerWrap.appendChild(answer);

    question.addEventListener('click', function () {
      item.classList.toggle('open');
    });

    item.appendChild(question);
    item.appendChild(answerWrap);
    grid.appendChild(item);
  });

  supabaseClient.auth.getSession().then(function (result) {
    var session = result.data && result.data.session;
    if (!session) {
      window.location.href = 'cuenta.html';
      return;
    }

    supabaseClient.from('profiles').select('membership').eq('id', session.user.id).single().then(function (profileResult) {
      var profile = profileResult.data || {};
      if (!profile.membership) {
        window.location.href = 'membresias.html';
      }
    });
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      supabaseClient.auth.signOut().then(function () {
        window.location.href = 'cuenta.html';
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', initCourse);
