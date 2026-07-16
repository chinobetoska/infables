# Tye Parque

Sitio web estático para Tye Parque, un parque infantil inflable donde se celebran fiestas de cumpleaños.

Incluye paquetes de cumpleaños (2 y 3 horas), entradas y bonos (30 min, 1 h, bono 6 h, bono 10 h), y un calendario de reservas para elegir día y horario.

## Uso

No requiere instalación ni dependencias. Abre `index.html` en el navegador, o publica el repositorio en GitHub Pages.

## Contenido de ejemplo

Los precios (marcados con `<!-- PLACEHOLDER:PRICE -->`) y los datos de contacto (marcados entre corchetes, ej. `[Dirección — completar]`) son de ejemplo y deben actualizarse con la información real del negocio antes de publicar.

El **número de WhatsApp** del botón flotante es un placeholder (marcado con `<!-- PLACEHOLDER:WHATSAPP -->` en `index.html`): reemplaza `5215500000000` por el número real con código de país.

## Detalles de diseño

- **Tipografías:** se cargan Fredoka (títulos) y Nunito (cuerpo) desde Google Fonts vía `<link>`. Si no hay conexión, el sitio degrada a la fuente del sistema con un fallback definido en las variables `--font-display` / `--font-body` de `css/styles.css`.
- **Íconos:** son SVG en línea definidos una vez como sprite (`<symbol id="i-…">`) al inicio de `index.html` y reutilizados con `<svg class="icon"><use href="#i-…"></svg>`.
- **Ilustración:** `assets/hero-castle.svg` (castillo inflable) es decorativa.
- **Animaciones:** el reveal al hacer scroll (`js/reveal.js`) y las animaciones decorativas respetan `prefers-reduced-motion`.
