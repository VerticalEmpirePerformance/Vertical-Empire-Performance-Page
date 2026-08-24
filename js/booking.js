const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const AVAILABLE_WEEKDAYS = [2, 3, 5]; // Martes, Miércoles, Viernes
const TIME_SLOTS = [
  '9:00 a.m.', '9:30 a.m.', '10:00 a.m.', '10:30 a.m.', '11:00 a.m.',
  '11:30 a.m.', '12:00 p.m.', '12:30 p.m.', '1:00 p.m.', '1:30 p.m.'
];

function initBooking() {
  const calDays = document.getElementById('calDays');
  const calMonthLabel = document.getElementById('calMonthLabel');
  const calPrev = document.getElementById('calPrev');
  const calNext = document.getElementById('calNext');
  const timeSlots = document.getElementById('timeSlots');
  const timeSlotsHeading = document.getElementById('timeSlotsHeading');
  const submitBtn = document.getElementById('bookingSubmit');

  if (!calDays) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selectedDate = null;
  let selectedTime = null;

  function isPast(date) {
    return date.getTime() < today.getTime();
  }

  function renderCalendar() {
    calMonthLabel.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
    calDays.innerHTML = '';

    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    let leadingBlanks = firstOfMonth.getDay() - 1;
    if (leadingBlanks < 0) leadingBlanks = 6;

    for (let i = 0; i < leadingBlanks; i++) {
      const blank = document.createElement('span');
      blank.className = 'cal-day empty';
      calDays.appendChild(blank);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day';
      btn.textContent = d;

      const available = AVAILABLE_WEEKDAYS.includes(date.getDay()) && !isPast(date);

      if (!available) {
        btn.classList.add('disabled');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', () => selectDate(date, btn));
      }

      if (selectedDate && date.getTime() === selectedDate.getTime()) {
        btn.classList.add('selected');
      }

      calDays.appendChild(btn);
    }

    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
    calPrev.disabled = isCurrentMonth;
  }

  function selectDate(date, btn) {
    selectedDate = date;
    selectedTime = null;
    calDays.querySelectorAll('.cal-day').forEach((el) => el.classList.remove('selected'));
    btn.classList.add('selected');
    renderTimeSlots();
    updateSubmitState();
  }

  function renderTimeSlots() {
    timeSlotsHeading.textContent = selectedDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
    timeSlotsHeading.classList.add('visible');

    const placeholder = timeSlots.querySelector('.time-slots-placeholder');
    if (placeholder) placeholder.remove();

    let grid = timeSlots.querySelector('.time-slots-grid');
    if (!grid) {
      grid = document.createElement('div');
      grid.className = 'time-slots-grid';
      timeSlots.appendChild(grid);
    } else {
      grid.innerHTML = '';
    }

    TIME_SLOTS.forEach((time) => {
      const slotBtn = document.createElement('button');
      slotBtn.type = 'button';
      slotBtn.className = 'time-slot';
      slotBtn.textContent = time;
      slotBtn.addEventListener('click', () => {
        selectedTime = time;
        grid.querySelectorAll('.time-slot').forEach((el) => el.classList.remove('selected'));
        slotBtn.classList.add('selected');
        updateSubmitState();
      });
      grid.appendChild(slotBtn);
    });
  }

  function updateSubmitState() {
    if (selectedDate && selectedTime) {
      submitBtn.disabled = false;
      const dayLabel = selectedDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
      submitBtn.textContent = `Confirmar: ${dayLabel} a las ${selectedTime}`;
    } else {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Selecciona día y hora para confirmar';
    }
  }

  calPrev.addEventListener('click', () => {
    viewMonth -= 1;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    }
    renderCalendar();
  });

  calNext.addEventListener('click', () => {
    viewMonth += 1;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    }
    renderCalendar();
  });

  renderCalendar();
}

document.addEventListener('DOMContentLoaded', initBooking);
