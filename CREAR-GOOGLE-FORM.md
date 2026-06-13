# Cómo crear el Google Form en 5 minutos

## 1. Abre Google Forms
Ve a: https://forms.google.com
Haz clic en el botón + (formulario en blanco)

## 2. Título del formulario
Escribe: La Tribu Pikeo ⚽

## 3. Crea estas preguntas (en orden)

---

PREGUNTA 1
Tipo: Respuesta corta
Texto: Nombre completo
Marca como obligatoria ✓

---

PREGUNTA 2
Tipo: Respuesta corta
Texto: WhatsApp (con código de país)
Marca como obligatoria ✓

---

PREGUNTA 3
Tipo: Opción múltiple
Texto: ¿Cómo quieres participar?
Opciones:
  - Solo quiero participar
  - Quiero reservar una mesa
Marca como obligatoria ✓

---

PREGUNTA 4
Tipo: Respuesta corta
Texto: ¿Qué partido verás? (Ej: Colombia vs Brasil)
Marca como obligatoria ✓

---

PREGUNTA 5
Tipo: Respuesta corta
Texto: Tu pronóstico (Ej: 2-1)
Marca como obligatoria ✓

---

PREGUNTA 6
Tipo: Fecha
Texto: Fecha de tu reserva
(No obligatoria — solo para quienes reservan mesa)

---

PREGUNTA 7
Tipo: Hora
Texto: Hora de tu reserva
(No obligatoria)

---

PREGUNTA 8
Tipo: Opción múltiple
Texto: ¿Cuántas personas vienen?
Opciones: 1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 o más
(No obligatoria)

---

PREGUNTA 9
Tipo: Casilla de verificación
Texto: Quiero recibir beneficios exclusivos, promociones y eventos de Pikeo por WhatsApp.
(No obligatoria)

---

## 4. Conectar a Google Sheets (automático)

1. Haz clic en la pestaña RESPUESTAS (arriba del formulario)
2. Haz clic en el ícono verde de Sheets (o el botón "Vincular con Sheets")
3. Selecciona "Crear una hoja de cálculo nueva"
4. Nombre: La Tribu Pikeo - Registros
5. Haz clic en Crear

¡Listo! Cada registro nuevo aparecerá automáticamente en esa hoja.

---

## 5. Obtener el enlace del formulario

1. Haz clic en el botón ENVIAR (arriba a la derecha)
2. Haz clic en el ícono de eslabón/cadena (link)
3. Copia el enlace
4. Ese enlace es el que vas a pegar en el archivo index.html

---

## 6. Pegar el enlace en la landing

Abre el archivo:
/Users/laurajaramillo/MUNDIAL PIKEO/public/index.html

Busca esta línea (está al final del archivo):
const FORM_URL = 'TU_LINK_DE_GOOGLE_FORMS_AQUI';

Reemplaza TU_LINK_DE_GOOGLE_FORMS_AQUI con el enlace que copiaste.

También busca:
const PIKEO_WHATSAPP = '573000000000';

Reemplaza 573000000000 con el número real de Pikeo
(sin el +, sin espacios, con código de país 57 para Colombia)

Guarda el archivo.

---

## 7. Para compartir hoy mismo

OPCIÓN A - Comparte el link del Google Form directamente
(Lo más simple. Funciona de inmediato sin nada más.)

OPCIÓN B - Usa la landing de Pikeo + servidor local
En la terminal escribe:
cd "/Users/laurajaramillo/MUNDIAL PIKEO"
node server.js

Abre: http://localhost:3000
(Funciona para demos presenciales en la hackatón)

OPCIÓN C - Publicar online gratis (2 minutos, sin cuenta)
Ve a: https://app.netlify.com/drop
Arrastra la carpeta "public" a esa página
Netlify te da una URL pública al instante
