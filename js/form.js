/*
 * Formulario de reserva — Trip Parque
 *
 * No hay backend disponible, así que el envío construye un enlace de
 * WhatsApp precompletado para que el visitante mande su solicitud.
 */
(function () {
  'use strict';

  var BUSINESS_WHATSAPP_URL = 'https://wa.me/522461784632';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var PACKAGE_LABELS = {
    cumple_2h: 'Cumpleaños — 2 horas',
    cumple_3h: 'Cumpleaños — 3 horas',
    entrada_30m: 'Entrada — 30 minutos',
    entrada_1h: 'Entrada — 1 hora',
    bono_6h: 'Bono — 6 horas',
    bono_10h: 'Bono — 10 horas',
  };

  function setFieldError(fieldId, hasError) {
    var field = document.getElementById(fieldId);
    if (!field) return;
    var wrapper = field.closest('.form-field');
    if (wrapper) {
      wrapper.classList.toggle('has-error', hasError);
    }
  }

  function validate(data) {
    var valid = true;

    if (!data.paquete) {
      setFieldError('paquete', true);
      valid = false;
    } else {
      setFieldError('paquete', false);
    }

    if (!data.fecha) {
      setFieldError('fecha', true);
      valid = false;
    } else {
      setFieldError('fecha', false);
    }

    if (!data.hora) {
      setFieldError('hora', true);
      valid = false;
    } else {
      setFieldError('hora', false);
    }

    if (!data.nombre) {
      setFieldError('nombre', true);
      valid = false;
    } else {
      setFieldError('nombre', false);
    }

    var digits = data.telefono.replace(/[^0-9]/g, '');
    if (!data.telefono || digits.length < 8) {
      setFieldError('telefono', true);
      valid = false;
    } else {
      setFieldError('telefono', false);
    }

    if (!data.email || !EMAIL_RE.test(data.email)) {
      setFieldError('email', true);
      valid = false;
    } else {
      setFieldError('email', false);
    }

    return valid;
  }

  function showStatus(el, message, type) {
    el.textContent = message;
    el.className = 'form-status is-visible is-' + type;
  }

  function buildWhatsAppLink(data) {
    var lines = [
      'Hola, vi su pagina y quiero apartar un inflable.',
      '',
      'Nombre: ' + data.nombre,
      'Telefono / WhatsApp: ' + data.telefono,
      'Correo: ' + data.email,
      'Paquete/Entrada: ' + (PACKAGE_LABELS[data.paquete] || data.paquete),
      'Fecha solicitada: ' + data.fecha,
      'Hora solicitada: ' + data.hora,
    ];
    if (data.mensaje) {
      lines.push('Mensaje adicional: ' + data.mensaje);
    }
    return BUSINESS_WHATSAPP_URL + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  function init() {
    var form = document.getElementById('reservation-form');
    if (!form) return;
    var statusEl = document.getElementById('form-status');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = {
        paquete: document.getElementById('paquete').value.trim(),
        fecha: document.getElementById('fecha').value.trim(),
        hora: document.getElementById('hora').value.trim(),
        nombre: document.getElementById('nombre').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        email: document.getElementById('email').value.trim(),
        mensaje: document.getElementById('mensaje').value.trim(),
      };

      if (!validate(data)) {
        showStatus(statusEl, 'Revisa los campos marcados en rojo antes de enviar.', 'error');
        return;
      }

      var whatsappLink = buildWhatsAppLink(data);
      showStatus(
        statusEl,
        'Se abrirá WhatsApp con los datos de tu reserva listos para enviar.',
        'success'
      );
      window.location.href = whatsappLink;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
