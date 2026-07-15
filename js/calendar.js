/*
 * Calendario de reservas — Tye Parque
 *
 * No existe backend ni base de datos: este calendario genera horarios
 * disponibles dinámicamente dentro del horario de operación configurado
 * abajo. Es un calendario de SOLICITUD, no de disponibilidad en tiempo real;
 * cada solicitud queda sujeta a confirmación manual por parte del negocio.
 */
(function () {
  'use strict';

  var DURATIONS = {
    cumple_2h: { label: 'Cumpleaños — 2 horas', minutes: 120 },
    cumple_3h: { label: 'Cumpleaños — 3 horas', minutes: 180 },
    entrada_30m: { label: 'Entrada — 30 minutos', minutes: 30 },
    entrada_1h: { label: 'Entrada — 1 hora', minutes: 60 },
    bono_6h: { label: 'Bono — 6 horas', minutes: 360 },
    bono_10h: { label: 'Bono — 10 horas', minutes: 600 },
  };

  // Horario de operación de ejemplo — ajustar según los horarios reales.
  var OPEN_HOUR = 10; // 10:00
  var CLOSE_HOUR = 20; // 20:00
  var SLOT_STEP_MINUTES = 30;

  // Días de la semana cerrados (0 = domingo ... 6 = sábado). Ejemplo: lunes cerrado.
  var CLOSED_WEEKDAYS = [1];

  // Fechas específicas ya no disponibles (formato 'YYYY-MM-DD'), editable a mano.
  var BLOCKED_DATES = [];

  var MONTH_NAMES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];

  var state = {
    viewYear: null,
    viewMonth: null, // 0-11
    selectedDate: null, // 'YYYY-MM-DD'
    selectedTime: null, // 'HH:MM'
  };

  var els = {};

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function toISODate(y, m, d) {
    return y + '-' + pad(m + 1) + '-' + pad(d);
  }

  function isPastDate(y, m, d) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var cell = new Date(y, m, d);
    return cell < today;
  }

  function minutesToLabel(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    return pad(h) + ':' + pad(m);
  }

  function currentPackageKey() {
    var select = document.getElementById('paquete');
    return select ? select.value : '';
  }

  function renderMonthLabel() {
    els.monthLabel.textContent = MONTH_NAMES[state.viewMonth] + ' ' + state.viewYear;
  }

  function renderGrid() {
    var grid = els.calendarGrid;
    grid.innerHTML = '';

    var firstWeekday = new Date(state.viewYear, state.viewMonth, 1).getDay();
    var daysInMonth = new Date(state.viewYear, state.viewMonth + 1, 0).getDate();

    for (var i = 0; i < firstWeekday; i++) {
      var empty = document.createElement('span');
      empty.className = 'day-btn is-empty';
      grid.appendChild(empty);
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var iso = toISODate(state.viewYear, state.viewMonth, day);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'day-btn';
      btn.textContent = String(day);
      btn.dataset.date = iso;

      var weekday = new Date(state.viewYear, state.viewMonth, day).getDay();
      var disabled =
        isPastDate(state.viewYear, state.viewMonth, day) ||
        CLOSED_WEEKDAYS.indexOf(weekday) !== -1 ||
        BLOCKED_DATES.indexOf(iso) !== -1;

      if (disabled) {
        btn.disabled = true;
      } else {
        btn.addEventListener('click', function () {
          selectDate(this.dataset.date);
        });
      }

      if (iso === state.selectedDate) {
        btn.classList.add('is-selected');
      }

      grid.appendChild(btn);
    }
  }

  function selectDate(iso) {
    state.selectedDate = iso;
    state.selectedTime = null;
    renderGrid();
    renderTimeSlots();
    updateSummary();
  }

  function renderTimeSlots() {
    var wrap = els.timeslotGrid;
    var hint = els.timeslotsHint;
    wrap.innerHTML = '';

    var packageKey = currentPackageKey();

    if (!state.selectedDate) {
      hint.textContent = 'Elige primero un paquete y un día para ver los horarios.';
      hint.style.display = 'block';
      return;
    }
    if (!packageKey || !DURATIONS[packageKey]) {
      hint.textContent = 'Selecciona un paquete o entrada para ver los horarios disponibles ese día.';
      hint.style.display = 'block';
      return;
    }

    var duration = DURATIONS[packageKey].minutes;
    var lastStart = CLOSE_HOUR * 60 - duration;
    var startMinutes = OPEN_HOUR * 60;
    var slots = [];

    while (startMinutes <= lastStart) {
      slots.push(startMinutes);
      startMinutes += SLOT_STEP_MINUTES;
    }

    if (slots.length === 0) {
      hint.textContent = 'Este paquete no tiene horarios disponibles en el horario de operación actual.';
      hint.style.display = 'block';
      return;
    }

    hint.style.display = 'none';

    slots.forEach(function (mins) {
      var label = minutesToLabel(mins);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot-btn';
      btn.textContent = label;
      if (label === state.selectedTime) {
        btn.classList.add('is-selected');
      }
      btn.addEventListener('click', function () {
        selectTime(label);
      });
      wrap.appendChild(btn);
    });
  }

  function selectTime(label) {
    state.selectedTime = label;
    renderTimeSlots();
    updateSummary();
    fillFormFields();
  }

  function formatReadableDate(iso) {
    var parts = iso.split('-').map(Number);
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    var weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return weekdays[d.getDay()] + ' ' + d.getDate() + ' de ' + MONTH_NAMES[d.getMonth()] + ' de ' + d.getFullYear();
  }

  function updateSummary() {
    var summaryEl = els.selectionSummary;
    var packageKey = currentPackageKey();

    if (state.selectedDate && state.selectedTime && DURATIONS[packageKey]) {
      summaryEl.textContent =
        'Has seleccionado: ' + DURATIONS[packageKey].label + ' — ' +
        formatReadableDate(state.selectedDate) + ', ' + state.selectedTime + ' hrs.';
    } else if (state.selectedDate) {
      summaryEl.textContent = 'Día elegido: ' + formatReadableDate(state.selectedDate) + '. Ahora elige un horario.';
    } else {
      summaryEl.textContent = '';
    }
  }

  function fillFormFields() {
    var fechaInput = document.getElementById('fecha');
    var horaInput = document.getElementById('hora');
    if (fechaInput && state.selectedDate) {
      fechaInput.value = formatReadableDate(state.selectedDate);
      fechaInput.dataset.iso = state.selectedDate;
    }
    if (horaInput && state.selectedTime) {
      horaInput.value = state.selectedTime + ' hrs';
    }
  }

  function changeMonth(delta) {
    var d = new Date(state.viewYear, state.viewMonth + delta, 1);
    state.viewYear = d.getFullYear();
    state.viewMonth = d.getMonth();
    renderMonthLabel();
    renderGrid();
  }

  function selectPackage(key) {
    var select = document.getElementById('paquete');
    if (select) {
      select.value = key;
    }
    renderTimeSlots();
    updateSummary();
    var reserveSection = document.getElementById('reservar');
    if (reserveSection) {
      reserveSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function init() {
    els.monthLabel = document.getElementById('calendar-month-label');
    els.calendarGrid = document.getElementById('calendar-grid');
    els.timeslotGrid = document.getElementById('timeslot-grid');
    els.timeslotsHint = document.getElementById('timeslots-hint');
    els.selectionSummary = document.getElementById('selection-summary');

    var today = new Date();
    state.viewYear = today.getFullYear();
    state.viewMonth = today.getMonth();

    renderMonthLabel();
    renderGrid();
    renderTimeSlots();

    document.getElementById('cal-prev').addEventListener('click', function () {
      changeMonth(-1);
    });
    document.getElementById('cal-next').addEventListener('click', function () {
      changeMonth(1);
    });

    var packageSelect = document.getElementById('paquete');
    if (packageSelect) {
      packageSelect.addEventListener('change', function () {
        renderTimeSlots();
        updateSummary();
      });
    }

    var packageButtons = document.querySelectorAll('.reservar-paquete');
    packageButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectPackage(this.dataset.package);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
