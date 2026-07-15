/*
 * Formulario de reserva — Tye Parque
 *
 * No hay backend disponible, así que el envío construye un enlace mailto:
 * precompletado hacia Tyeparque@hotmail.com. Esto depende de que el
 * visitante tenga un cliente de correo configurado en su dispositivo; no
 * queda ningún registro del lado del servidor.
 */
(function () {
  'use strict';

  var BUSINESS_EMAIL = 'Tyeparque@hotmail.com';
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

  function buildMailto(data) {
    var subject = 'Solicitud de reserva - Tye Parque - ' + (PACKAGE_LABELS[data.paquete] || data.paquete);
    var lines = [
      'Nombre: ' + data.nombre,
      'Teléfono: ' + data.telefono,
      'Email: ' + data.email,
      'Paquete/Entrada: ' + (PACKAGE_LABELS[data.paquete] || data.paquete),
      'Fecha solicitada: ' + data.fecha,
      'Hora solicitada: ' + data.hora,
    ];
    if (data.mensaje) {
      lines.push('Mensaje adicional: ' + data.mensaje);
    }
    lines.push('');
    lines.push('— Enviado desde el sitio web de Tye Parque');

    var body = lines.join('\n');
    return 'mailto:' + BUSINESS_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
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

      var mailtoLink = buildMailto(data);
      showStatus(
        statusEl,
        'Se abrirá tu aplicación de correo con los datos completados. Si no se abre automáticamente, escríbenos a ' + BUSINESS_EMAIL + '.',
        'success'
      );
      window.location.href = mailtoLink;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
