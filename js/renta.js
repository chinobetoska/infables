/*
 * Página de renta de inflables.
 *
 * Carga contenido desde JSON y genera el catálogo, calendario y formulario.
 */
(function () {
  'use strict';

  var CONTENT_URL = 'data/contenido.json';
  var MONTH_NAMES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  var WEEKDAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var state = {
    content: null,
    viewYear: null,
    viewMonth: null,
    selectedDate: '',
  };

  function $(id) {
    return document.getElementById(id);
  }

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function toISODate(year, month, day) {
    return year + '-' + pad(month + 1) + '-' + pad(day);
  }

  function todayAtMidnight() {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  function isPastDate(year, month, day) {
    return new Date(year, month, day) < todayAtMidnight();
  }

  function formatDateReadable(iso) {
    var parts = iso.split('-').map(Number);
    var date = new Date(parts[0], parts[1] - 1, parts[2]);
    return WEEKDAY_NAMES[date.getDay()] + ' ' + date.getDate() + ' de ' + MONTH_NAMES[date.getMonth()] + ' de ' + date.getFullYear();
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function buildCatalogMessage(name) {
    return 'Hola, vi su página y quiero apartar el ' + name + '. ¿Me confirma disponibilidad?';
  }

  function createWhatsAppUrl(number, message) {
    return 'https://wa.me/' + encodeURIComponent(number) + '?text=' + encodeURIComponent(message);
  }

  function formatBrandMarkup(name) {
    var parts = name.split(' ');
    if (parts.length < 2) {
      return name;
    }
    return parts[0] + ' <span>' + parts.slice(1).join(' ') + '</span>';
  }

  function setPageMeta(content) {
    document.title = content.negocio.nombre + ' | Renta de inflables';
    var description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = content.hero.subtitulo;
    }
  }

  function renderBrand(content) {
    $('brand-name').innerHTML = formatBrandMarkup(content.negocio.nombre);
    $('footer-brand').innerHTML = formatBrandMarkup(content.negocio.nombre);
    $('footer-copy').innerHTML =
      '© <span id="footer-year"></span> ' + content.negocio.nombre + ' · ' +
      '<a href="mailto:' + content.negocio.correo + '">' + content.negocio.correo + '</a>';
    $('footer-year').textContent = new Date().getFullYear();
  }

  function renderNav(content) {
    var links = content.navegacion.map(function (item) {
      return '<a href="#' + item.id + '">' + item.label + '</a>';
    });
    if (content.enlaceVersionRelacionada) {
      links.push('<a href="' + content.enlaceVersionRelacionada.href + '">' + content.enlaceVersionRelacionada.label + '</a>');
    }
    $('main-nav').innerHTML = links.join('');
  }

  function renderHero(content) {
    var catalogo = content.catalogo.slice(0, 2);
    $('hero-content').innerHTML =
      '<div class="hero-copy renta-hero-copy reveal">' +
        '<span class="hero-eyebrow">' + content.negocio.nombre + '</span>' +
        '<h1>' + content.hero.titulo + '</h1>' +
        '<p>' + content.hero.subtitulo + '</p>' +
        '<div class="hero-actions">' +
          '<a class="btn btn-outline" href="#catalogo">' + content.hero.botones.catalogo + '</a>' +
          '<a class="btn btn-on-hero" href="#solicitud">' + content.hero.botones.formulario + '</a>' +
        '</div>' +
        '<div class="trust-badges">' +
          content.hero.insignias.map(function (badge) {
            return '<span class="trust-badge">' + badge + '</span>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="hero-art renta-hero-art">' +
        catalogo.map(function (item, index) {
          return (
            '<div class="hero-mini-card reveal">' +
              '<h3>' + item.nombre + '</h3>' +
              '<p>' + item.descripcion + '</p>' +
              '<span class="price-example">' + formatCurrency(item.precio) + '</span>' +
              '<ul>' +
                '<li>' + item.medidas + '</li>' +
                '<li>' + item.capacidad + '</li>' +
              '</ul>' +
            '</div>'
          );
        }).join('') +
      '</div>';
  }

  function iconMarkup(iconId) {
    return '<svg aria-hidden="true"><use href="#' + iconId + '"></use></svg>';
  }

  function renderCatalog(content) {
    $('catalogo-head').innerHTML =
      '<h2>' + content.catalogoInfo.titulo + '</h2>' +
      '<p class="section-lead">' + content.catalogoInfo.descripcion + '</p>';

    $('catalogo-grid').innerHTML = content.catalogo.map(function (item) {
      var message = buildCatalogMessage(item.nombre);
      return (
        '<article class="card rental-card reveal">' +
          '<div class="rental-media" style="--fallback-color: ' + item.colorFondo + ';">' +
            '<img src="' + item.imagen + '" alt="' + item.nombre + '" loading="lazy" />' +
          '</div>' +
          '<div class="rental-card-body">' +
            '<h3>' + item.nombre + '</h3>' +
            '<p>' + item.descripcion + '</p>' +
            '<div class="rental-meta">' +
              '<div class="rental-meta-item">' + iconMarkup('i-location') + '<span>' + item.medidas + '</span></div>' +
              '<div class="rental-meta-item">' + iconMarkup('i-shield') + '<span>' + item.capacidad + '</span></div>' +
            '</div>' +
            '<div class="price-row">' +
              '<span class="rental-price-label">' + content.catalogoInfo.precioLabel + '</span>' +
              '<span class="price-example">' + formatCurrency(item.precio) + '</span>' +
            '</div>' +
            '<a class="btn btn-primary btn-block apartar-item" href="' + createWhatsAppUrl(content.negocio.whatsapp, message) + '" target="_blank" rel="noopener" data-item-id="' + item.id + '">' +
              content.catalogoInfo.boton +
            '</a>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    bindImageFallbacks();
    bindCatalogButtons();
  }

  function bindImageFallbacks() {
    var images = document.querySelectorAll('.rental-media img');
    images.forEach(function (img) {
      function activateFallback() {
        var wrapper = img.parentElement;
        if (wrapper) {
          wrapper.classList.add('is-fallback');
        }
      }

      img.addEventListener('error', activateFallback);
      if (img.complete && img.naturalWidth === 0) {
        activateFallback();
      }
    });
  }

  function bindCatalogButtons() {
    var buttons = document.querySelectorAll('.apartar-item');
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var select = $('inflable');
        if (select) {
          select.value = this.dataset.itemId;
        }
      });
    });
  }

  function renderSteps(content) {
    $('como-funciona-head').innerHTML =
      '<h2>' + content.comoFuncionaInfo.titulo + '</h2>' +
      '<p class="section-lead">' + content.comoFuncionaInfo.descripcion + '</p>';

    $('steps-grid').innerHTML = content.comoFunciona.map(function (step, index) {
      return (
        '<article class="card step-card reveal">' +
          '<span class="step-badge">' + (index + 1) + '</span>' +
          '<div class="card-icon card-icon--cumple">' + iconMarkup(step.icono) + '</div>' +
          '<h3>' + step.titulo + '</h3>' +
          '<p>' + step.descripcion + '</p>' +
        '</article>'
      );
    }).join('');
  }

  function renderCalendarSection(content) {
    $('fechas-head').innerHTML =
      '<h2>' + content.fechasInfo.titulo + '</h2>' +
      '<p class="section-lead">' + content.fechasInfo.descripcion + '</p>';
    $('fechas-note').textContent = content.fechasInfo.nota;
    $('calendar-legend').innerHTML =
      '<span class="calendar-legend-item"><span class="calendar-legend-swatch is-free"></span>Libre</span>' +
      '<span class="calendar-legend-item"><span class="calendar-legend-swatch is-blocked"></span>Apartado</span>' +
      '<span class="calendar-legend-item"><span class="calendar-legend-swatch is-selected"></span>Seleccionado</span>';

    $('form-head').innerHTML =
      '<h3>' + content.formulario.titulo + '</h3>' +
      '<p class="muted-hint">' + content.formulario.descripcion + '</p>';

    renderForm(content);
    initCalendar(content);
  }

  function renderForm(content) {
    var labels = content.formulario.campos;
    $('rental-form').innerHTML =
      '<div class="form-field">' +
        '<label for="inflable">' + labels.inflable + ' <span class="required-mark">*</span></label>' +
        '<select id="inflable" name="inflable" required>' +
          '<option value="">Selecciona una opción</option>' +
          content.catalogo.map(function (item) {
            return '<option value="' + item.id + '">' + item.nombre + '</option>';
          }).join('') +
        '</select>' +
        '<span class="field-error">' + content.formulario.errores.inflable + '</span>' +
      '</div>' +
      '<div class="form-field">' +
        '<label for="fecha">' + labels.fecha + ' <span class="required-mark">*</span></label>' +
        '<input type="text" id="fecha" name="fecha" readonly required />' +
        '<span class="field-error">' + content.formulario.errores.fecha + '</span>' +
      '</div>' +
      '<div class="form-field">' +
        '<label for="hora">' + labels.hora + ' <span class="required-mark">*</span></label>' +
        '<input type="time" id="hora" name="hora" required />' +
        '<span class="field-error">' + content.formulario.errores.hora + '</span>' +
      '</div>' +
      '<div class="form-field">' +
        '<label for="nombre">' + labels.nombre + ' <span class="required-mark">*</span></label>' +
        '<input type="text" id="nombre" name="nombre" required />' +
        '<span class="field-error">' + content.formulario.errores.nombre + '</span>' +
      '</div>' +
      '<div class="form-field">' +
        '<label for="telefono">' + labels.telefono + ' <span class="required-mark">*</span></label>' +
        '<input type="tel" id="telefono" name="telefono" required />' +
        '<span class="field-error">' + content.formulario.errores.telefono + '</span>' +
      '</div>' +
      '<div class="form-field">' +
        '<label for="direccion">' + labels.direccion + ' <span class="required-mark">*</span></label>' +
        '<textarea id="direccion" name="direccion" rows="3" required></textarea>' +
        '<span class="field-error">' + content.formulario.errores.direccion + '</span>' +
      '</div>' +
      '<div class="form-field">' +
        '<label for="mensaje">' + labels.mensaje + '</label>' +
        '<textarea id="mensaje" name="mensaje" rows="3"></textarea>' +
      '</div>' +
      '<button type="submit" class="btn btn-primary btn-block">' + content.formulario.boton + '</button>' +
      '<div class="form-status" id="form-status" role="status"></div>';

    $('rental-form').addEventListener('submit', function (event) {
      event.preventDefault();
      handleFormSubmit(content);
    });
  }

  function initCalendar(content) {
    var initialDate = getInitialCalendarDate();
    state.viewYear = initialDate.getFullYear();
    state.viewMonth = initialDate.getMonth();

    $('cal-prev').addEventListener('click', function () {
      changeMonth(-1, content);
    });
    $('cal-next').addEventListener('click', function () {
      changeMonth(1, content);
    });

    renderCalendar(content);
  }

  function getInitialCalendarDate() {
    var today = new Date();
    var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    var daysRemaining = lastDayOfMonth - today.getDate();
    if (daysRemaining < 7) {
      return new Date(today.getFullYear(), today.getMonth() + 1, 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }

  function changeMonth(delta, content) {
    var date = new Date(state.viewYear, state.viewMonth + delta, 1);
    state.viewYear = date.getFullYear();
    state.viewMonth = date.getMonth();
    renderCalendar(content);
  }

  function renderCalendar(content) {
    $('calendar-month-label').textContent = MONTH_NAMES[state.viewMonth] + ' ' + state.viewYear;
    var grid = $('calendar-grid');
    grid.innerHTML = '';

    var firstWeekday = new Date(state.viewYear, state.viewMonth, 1).getDay();
    var daysInMonth = new Date(state.viewYear, state.viewMonth + 1, 0).getDate();
    var blockedDates = content.fechasApartadas;

    for (var i = 0; i < firstWeekday; i++) {
      var empty = document.createElement('span');
      empty.className = 'day-btn is-empty';
      grid.appendChild(empty);
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var iso = toISODate(state.viewYear, state.viewMonth, day);
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'day-btn';
      button.textContent = String(day);
      button.dataset.date = iso;

      var isBlocked = blockedDates.indexOf(iso) !== -1;
      var disabled = isPastDate(state.viewYear, state.viewMonth, day) || isBlocked;

      if (isBlocked) {
        button.classList.add('is-blocked');
      }
      if (iso === state.selectedDate) {
        button.classList.add('is-selected');
      }
      if (disabled) {
        button.disabled = true;
      } else {
        button.addEventListener('click', function () {
          selectDate(this.dataset.date);
        });
      }

      grid.appendChild(button);
    }

    updateSelectionSummary(content);
  }

  function selectDate(iso) {
    state.selectedDate = iso;
    $('fecha').value = formatDateReadable(iso);
    $('fecha').dataset.iso = iso;
    renderCalendar(state.content);
  }

  function updateSelectionSummary(content) {
    var summary = $('selection-summary');
    if (!state.selectedDate) {
      summary.textContent = content.fechasInfo.resumenVacio;
      return;
    }
    summary.textContent = content.fechasInfo.resumenSeleccion + ' ' + formatDateReadable(state.selectedDate) + '.';
  }

  function setFieldError(fieldId, hasError) {
    var field = $(fieldId);
    if (!field) return;
    var wrapper = field.closest('.form-field');
    if (wrapper) {
      wrapper.classList.toggle('has-error', hasError);
    }
  }

  function validateForm() {
    var valid = true;
    var requiredFields = ['inflable', 'fecha', 'hora', 'nombre', 'telefono', 'direccion'];

    requiredFields.forEach(function (fieldId) {
      var value = $(fieldId).value.trim();
      var hasError = !value;
      if (fieldId === 'telefono') {
        hasError = value.replace(/[^0-9]/g, '').length < 8;
      }
      setFieldError(fieldId, hasError);
      if (hasError) {
        valid = false;
      }
    });

    return valid;
  }

  function selectedItemName(itemId) {
    var items = state.content.catalogo;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === itemId) {
        return items[i].nombre;
      }
    }
    return itemId;
  }

  function showFormStatus(message, type) {
    var status = $('form-status');
    status.textContent = message;
    status.className = 'form-status is-visible is-' + type;
  }

  function handleFormSubmit(content) {
    if (!validateForm()) {
      showFormStatus(content.formulario.estadoError, 'error');
      return;
    }

    var inflableId = $('inflable').value.trim();
    var lines = [
      'Hola, vi su página y quiero apartar un inflable.',
      '',
      'Inflable: ' + selectedItemName(inflableId),
      'Fecha: ' + $('fecha').value.trim(),
      'Hora de entrega: ' + $('hora').value.trim(),
      'Nombre completo: ' + $('nombre').value.trim(),
      'Teléfono / WhatsApp: ' + $('telefono').value.trim(),
      'Dirección del evento: ' + $('direccion').value.trim(),
    ];

    var mensaje = $('mensaje').value.trim();
    if (mensaje) {
      lines.push('Mensaje adicional: ' + mensaje);
    }

    showFormStatus(content.formulario.estadoExito, 'success');
    window.location.href = createWhatsAppUrl(content.negocio.whatsapp, lines.join('\n'));
  }

  function renderCoverage(content) {
    $('cobertura-head').innerHTML =
      '<h2>' + content.cobertura.titulo + '</h2>' +
      '<p class="section-lead">' + content.cobertura.texto + '</p>';

    $('coverage-card').innerHTML =
      '<ul class="coverage-list">' +
        content.cobertura.zonas.map(function (zona) {
          return '<li>' + zona + '</li>';
        }).join('') +
      '</ul>' +
      '<span class="coverage-note">' + content.cobertura.notaEnvio + '</span>';
  }

  function renderFaq(content) {
    $('faq-head').innerHTML =
      '<h2>' + content.faqInfo.titulo + '</h2>' +
      '<p class="section-lead">' + content.faqInfo.descripcion + '</p>';

    $('faq-list').innerHTML = content.faq.map(function (item, index) {
      return (
        '<div class="faq-item reveal' + (index === 0 ? ' is-open' : '') + '">' +
          '<button class="faq-trigger" type="button" aria-expanded="' + (index === 0 ? 'true' : 'false') + '">' +
            '<span>' + item.pregunta + '</span>' +
            '<span>' + (index === 0 ? '−' : '+') + '</span>' +
          '</button>' +
          '<div class="faq-answer"><p>' + item.respuesta + '</p></div>' +
        '</div>'
      );
    }).join('');

    var triggers = document.querySelectorAll('.faq-trigger');
    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var item = this.parentElement;
        var expanded = this.getAttribute('aria-expanded') === 'true';
        item.classList.toggle('is-open', !expanded);
        this.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        this.querySelector('span:last-child').textContent = expanded ? '+' : '−';
      });
    });
  }

  function renderContact(content) {
    $('contacto-head').innerHTML =
      '<h2>' + content.contacto.titulo + '</h2>' +
      '<p class="section-lead">' + content.contacto.descripcion + '</p>';

    $('contacto-grid').innerHTML =
      '<article class="contact-card reveal">' +
        '<div class="contact-icon contact-icon--phone">' + iconMarkup('i-whatsapp') + '</div>' +
        '<h3>' + content.contacto.whatsappLabel + '</h3>' +
        '<p><a href="' + createWhatsAppUrl(content.negocio.whatsapp, content.contacto.mensajeWhatsapp) + '" target="_blank" rel="noopener">' + content.negocio.telefono + '</a></p>' +
      '</article>' +
      '<article class="contact-card reveal">' +
        '<div class="contact-icon contact-icon--location">' + iconMarkup('i-phone') + '</div>' +
        '<h3>' + content.contacto.telefonoLabel + '</h3>' +
        '<p><a href="tel:' + content.negocio.telefono.replace(/[^0-9+]/g, '') + '">' + content.negocio.telefono + '</a></p>' +
      '</article>' +
      '<article class="contact-card reveal">' +
        '<div class="contact-icon contact-icon--mail">' + iconMarkup('i-mail') + '</div>' +
        '<h3>' + content.contacto.correoLabel + '</h3>' +
        '<p><a href="mailto:' + content.negocio.correo + '">' + content.negocio.correo + '</a></p>' +
      '</article>';

    $('whatsapp-fab').href = createWhatsAppUrl(content.negocio.whatsapp, content.contacto.mensajeWhatsapp);
  }

  function initNavToggle() {
    var toggle = $('nav-toggle');
    var nav = $('main-nav');

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initReveal() {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var items = document.querySelectorAll('.reveal');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (item) {
        item.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.14,
      rootMargin: '0px 0px -40px 0px',
    });

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function renderPage(content) {
    state.content = content;
    setPageMeta(content);
    renderBrand(content);
    renderNav(content);
    renderHero(content);
    renderCatalog(content);
    renderSteps(content);
    renderCalendarSection(content);
    renderCoverage(content);
    renderFaq(content);
    renderContact(content);
    initNavToggle();
    initReveal();
  }

  function renderError() {
    document.querySelector('main').innerHTML =
      '<section class="section"><div class="container renta-empty">No fue posible cargar el contenido de renta.</div></section>';
  }

  function init() {
    fetch(CONTENT_URL)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('No se pudo cargar el JSON');
        }
        return response.json();
      })
      .then(function (content) {
        renderPage(content);
      })
      .catch(function () {
        renderError();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
