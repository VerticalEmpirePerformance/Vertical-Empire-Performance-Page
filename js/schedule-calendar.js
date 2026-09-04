function formatSlotTime(hour, minute) {
  var period = hour < 12 ? 'a.m.' : 'p.m.';
  var displayHour = hour % 12;
  if (displayHour === 0) displayHour = 12;
  var displayMinute = minute < 10 ? '0' + minute : String(minute);
  return displayHour + ':' + displayMinute + ' ' + period;
}

function buildSlots(startHour, startMinute, endHour, endMinute, stepMinutes) {
  var slots = [];
  var cursor = startHour * 60 + startMinute;
  var end = endHour * 60 + endMinute;
  while (cursor <= end) {
    slots.push(formatSlotTime(Math.floor(cursor / 60), cursor % 60));
    cursor += stepMinutes;
  }
  return slots;
}

function initDayCalendar() {
  var root = document.getElementById('dayCalendar');
  var timeSlotsEl = document.getElementById('timeSlots');
  if (!root) return;

  var monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  var dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  var weekdayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var selectedSlot = null;

  var today = new Date();
  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth();
  var selectedDate = null;

  var header = document.createElement('div');
  header.className = 'calendar-header';

  var prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'calendar-nav';
  prevBtn.setAttribute('aria-label', 'Mes anterior');
  prevBtn.textContent = '‹';

  var label = document.createElement('span');
  label.className = 'calendar-label';

  var nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'calendar-nav';
  nextBtn.setAttribute('aria-label', 'Mes siguiente');
  nextBtn.textContent = '›';

  header.appendChild(prevBtn);
  header.appendChild(label);
  header.appendChild(nextBtn);

  var weekdaysRow = document.createElement('div');
  weekdaysRow.className = 'calendar-weekdays';
  dayLabels.forEach(function (d) {
    var el = document.createElement('span');
    el.textContent = d;
    weekdaysRow.appendChild(el);
  });

  var daysGrid = document.createElement('div');
  daysGrid.className = 'calendar-days';

  root.appendChild(header);
  root.appendChild(weekdaysRow);
  root.appendChild(daysGrid);

  function render() {
    label.textContent = monthNames[viewMonth] + ' ' + viewYear;
    daysGrid.innerHTML = '';

    var firstOfMonth = new Date(viewYear, viewMonth, 1);
    var startOffset = (firstOfMonth.getDay() + 6) % 7;
    var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (var i = 0; i < startOffset; i++) {
      var blank = document.createElement('span');
      blank.className = 'calendar-day calendar-day-empty';
      daysGrid.appendChild(blank);
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var cellDate = new Date(viewYear, viewMonth, day);
      var weekday = cellDate.getDay();
      var isUnavailable = weekday !== 1 && weekday !== 2 && weekday !== 3;

      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'calendar-day';
      cell.textContent = String(day);

      if (isUnavailable) {
        cell.classList.add('calendar-day-unavailable');
        cell.disabled = true;
      } else {
        cell.classList.add('calendar-day-available');
        if (selectedDate && selectedDate.getTime() === cellDate.getTime()) {
          cell.classList.add('calendar-day-selected');
        }
        cell.addEventListener('click', function (clickedDate) {
          return function () {
            selectedDate = clickedDate;
            selectedSlot = null;
            render();
            renderTimeSlots();
          };
        }(cellDate));
      }

      daysGrid.appendChild(cell);
    }
  }

  function renderTimeSlots() {
    if (!timeSlotsEl) return;
    timeSlotsEl.innerHTML = '';

    if (!selectedDate) {
      var hint = document.createElement('p');
      hint.className = 'time-slots-hint';
      hint.textContent = 'Primero selecciona un día.';
      timeSlotsEl.appendChild(hint);
      return;
    }

    var morningSlots = buildSlots(8, 0, 11, 30, 30);
    var eveningSlots = buildSlots(18, 0, 21, 30, 30);
    var weekday = selectedDate.getDay();
    var showMorning = weekday === 1 || weekday === 2 || weekday === 3;
    var showEvening = weekday === 1 || weekday === 2 || weekday === 3;

    var dateLabel = document.createElement('p');
    dateLabel.className = 'time-slots-date';
    dateLabel.textContent = weekdayNames[selectedDate.getDay()] + ' ' + selectedDate.getDate() + ' de ' + monthNames[selectedDate.getMonth()] + ' (hora CDMX)';
    timeSlotsEl.appendChild(dateLabel);

    function addGroup(title, slots) {
      var groupTitle = document.createElement('p');
      groupTitle.className = 'time-slots-group-title';
      groupTitle.textContent = title;
      timeSlotsEl.appendChild(groupTitle);

      var group = document.createElement('div');
      group.className = 'time-slots-group';
      slots.forEach(function (slot) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'time-slot';
        btn.textContent = slot;
        if (selectedSlot === slot) btn.classList.add('time-slot-selected');
        btn.addEventListener('click', function () {
          selectedSlot = slot;
          renderTimeSlots();
        });
        group.appendChild(btn);
      });
      timeSlotsEl.appendChild(group);
    }

    if (showMorning) addGroup('Mañana', morningSlots);
    if (showEvening) addGroup('Tarde', eveningSlots);
  }

  prevBtn.addEventListener('click', function () {
    viewMonth -= 1;
    if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
    render();
  });

  nextBtn.addEventListener('click', function () {
    viewMonth += 1;
    if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
    render();
  });

  var scheduleCallBtn = document.getElementById('scheduleCallBtn');
  if (scheduleCallBtn) {
    scheduleCallBtn.addEventListener('click', function () {
      if (!selectedDate || !selectedSlot) {
        scheduleCallBtn.textContent = 'Elige día y hora';
        setTimeout(function () { scheduleCallBtn.textContent = 'Agendar'; }, 1500);
        return;
      }

      var month = String(selectedDate.getMonth() + 1);
      var day = String(selectedDate.getDate());
      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
      var isoDate = selectedDate.getFullYear() + '-' + month + '-' + day;

      scheduleCallBtn.disabled = true;
      scheduleCallBtn.textContent = 'Agendando...';

      supabaseClient.auth.getSession().then(function (result) {
        var session = result.data && result.data.session;
        if (!session) return;

        supabaseClient.from('profiles').update({
          call_date: isoDate,
          call_time: selectedSlot,
          call_status: 'pending'
        }).eq('id', session.user.id).then(function (updateResult) {
          scheduleCallBtn.disabled = false;
          scheduleCallBtn.textContent = updateResult.error ? 'Error, intenta de nuevo' : 'Agendado';
          setTimeout(function () { scheduleCallBtn.textContent = 'Agendar'; }, 1500);
        });
      });
    });
  }

  render();
}

function initProblemDescriptionCounter() {
  var textarea = document.getElementById('problemDescription');
  var counter = document.getElementById('problemDescriptionCounter');
  if (!textarea || !counter) return;

  var max = textarea.getAttribute('maxlength') || 1000;

  function updateCounter() {
    counter.textContent = textarea.value.length + ' / ' + max;
  }

  textarea.addEventListener('input', updateCounter);
  updateCounter();
}

document.addEventListener('DOMContentLoaded', initDayCalendar);
document.addEventListener('DOMContentLoaded', initProblemDescriptionCounter);
