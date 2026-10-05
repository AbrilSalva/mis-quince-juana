# Invitación web — Juana · Mis 15

Sitio estático responsive, listo para publicar gratis en GitHub Pages, Netlify o Vercel.

## Qué ya funciona
- Pantalla inicial con botón **INGRESAR**
- Cuenta regresiva al **viernes 13 de noviembre de 2026, 21:00 (Argentina)**
- Botón para agregar el evento a Google Calendar
- Información de horario, dirección, Google Maps y dress code
- Modal para Alias / CBU con botones de copiar
- QR + botón para Google Drive de fotos
- Mensajes de invitados
- Confirmación de asistencia:
  - Sí: cantidad de invitados, nombres, restricciones alimentarias y mensaje
  - No: nombre y mensaje opcional
- Diseño responsive de estrellas con paleta verde

## Antes de publicar: completar 4 datos

### 1. Google Drive para fotos
En `app.js`, reemplazá:

`REEMPLAZAR_CON_LINK_DE_GOOGLE_DRIVE`

por el link real.

IMPORTANTE: Google Drive no permite que cualquier persona anónima suba libremente a una carpeta común de forma tan directa como una plataforma de carga.
La opción más simple y segura es usar un **Google Form con pregunta "Subir archivo"** o un formulario/servicio de carga.
Pegá ese link en `driveUrl`.

### 2. Alias y CBU
En `index.html` buscá:

- `JUANA.15`
- `0000000000000000000000`

y reemplazalos por los datos reales.

### 3. Frase personalizada
En `index.html`, buscá:

`Acompañame a celebrar este capítulo tan especial...`

y reemplazala por la frase final de Juana.

### 4. Activar mensajes + RSVP compartidos
Sin backend, los formularios se ven y funcionan visualmente, pero no guardan datos compartidos.

Para que todo llegue a una planilla:
1. Creá un Google Sheet.
2. Abrí **Extensiones > Apps Script**.
3. Pegá `apps-script.gs`.
4. **Implementar > Nueva implementación > Aplicación web**.
5. Ejecutar como: **vos**.
6. Acceso: **Cualquier persona**.
7. Copiá la URL terminada en `/exec`.
8. Pegala en `CONFIG.appsScriptUrl` dentro de `app.js`.

## Publicar gratis

### Opción recomendada: Netlify Drop
1. Entrá a Netlify.
2. Usá "Deploy manually".
3. Arrastrá la carpeta completa `invitacion_juana`.
4. Netlify genera una URL gratis.

### GitHub Pages
1. Creá un repositorio.
2. Subí `index.html`, `styles.css` y `app.js`.
3. Settings > Pages.
4. Deploy from branch > `main` / root.

## Archivos
- `index.html` — estructura
- `styles.css` — diseño responsive
- `app.js` — interacciones, cuenta regresiva, QR y formularios
- `apps-script.gs` — backend gratuito con Google Sheets

## Personalización rápida
La paleta principal está en las variables CSS al inicio de `styles.css`.
