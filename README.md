# Trip Parque

Sitio web estático para Trip Parque, un parque infantil inflable donde se celebran fiestas de cumpleaños.

Incluye paquetes de cumpleaños (2 y 3 horas), entradas y bonos (30 min, 1 h, bono 6 h, bono 10 h), y un calendario de reservas para elegir día y horario.

## Uso

No requiere instalación ni dependencias. Abre `index.html` en el navegador, o publica el repositorio en GitHub Pages.

## Contenido de ejemplo

Los precios (marcados con `<!-- PLACEHOLDER:PRICE -->`) son de ejemplo y deben actualizarse con la información real del negocio antes de publicar.

El **botón flotante de WhatsApp** y el **formulario de reservación** usan el enlace `https://wa.me/522461784632` con un mensaje prellenado para iniciar la conversación desde el sitio. El correo de contacto es `contacto@chinobetoska.com`.

## Detalles de diseño

- **Tipografías:** se cargan Fredoka (títulos) y Nunito (cuerpo) desde Google Fonts vía `<link>`. Si no hay conexión, el sitio degrada a la fuente del sistema con un fallback definido en las variables `--font-display` / `--font-body` de `css/styles.css`.
- **Íconos:** son SVG en línea definidos una vez como sprite (`<symbol id="i-…">`) al inicio de `index.html` y reutilizados con `<svg class="icon"><use href="#i-…"></svg>`.
- **Ilustración:** `assets/hero-castle.svg` (castillo inflable) es decorativa.
- **Animaciones:** el reveal al hacer scroll (`js/reveal.js`) y las animaciones decorativas respetan `prefers-reduced-motion`.
