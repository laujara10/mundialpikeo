# La Tribu Pikeo — Instrucciones de lanzamiento

## PASO 1 — Crear el Google Sheet

1. Ve a **sheets.google.com** y crea una hoja nueva
2. Nómbrala: `La Tribu Pikeo`
3. Deja la hoja vacía — el script crea los encabezados automáticamente

---

## PASO 2 — Publicar el Apps Script

1. Dentro del Google Sheet, ve al menú: **Extensiones → Apps Script**
2. Borra todo el código que aparece por defecto
3. Pega el contenido del archivo `google-apps-script.js`
4. Haz clic en **Guardar** (ícono de disquete o Ctrl+S)
5. Haz clic en **Ejecutar → testInsertar** para verificar que funciona
   - Te pedirá permiso la primera vez → acepta todo
   - Deberías ver una fila de prueba en tu Sheet
6. Haz clic en **Implementar → Nueva implementación**
7. Tipo: **Aplicación web**
8. Descripción: `La Tribu Pikeo v1`
9. Ejecutar como: **Yo**
10. Quién tiene acceso: **Cualquier persona**
11. Haz clic en **Implementar**
12. **Copia la URL** que aparece — la necesitas para el siguiente paso

---

## PASO 3 — Conectar el formulario

Abre el archivo `public/index.html` y busca estas dos líneas al final:

```js
const APPS_SCRIPT_URL = 'TU_URL_AQUI';
const PIKEO_WHATSAPP  = '573000000000';
```

Reemplaza:
- `TU_URL_AQUI` → pega la URL del Apps Script del paso anterior
- `573000000000` → número real de WhatsApp de Pikeo (sin + ni espacios, con código de país)

Ejemplo:
```js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/ABC.../exec';
const PIKEO_WHATSAPP  = '573156789012';
```

---

## PASO 4 — Publicar el sitio (elige una opción)

### Opción A — Servir localmente (para pruebas YA)
```bash
cd "/Users/laurajaramillo/MUNDIAL PIKEO"
node server.js
```
Abre: http://localhost:3000

### Opción B — Publicar gratis en internet (5 minutos)

**Con Netlify Drop:**
1. Ve a **app.netlify.com/drop**
2. Arrastra la carpeta `public/` a la página
3. Netlify te da una URL pública al instante
4. Esa URL es la que compartes por QR, Meta e Instagram

**Con Vercel:**
```bash
npx vercel --yes
```

---

## PASO 5 — Generar QR

1. Ve a **qr-code-generator.com**
2. Pega la URL de tu sitio
3. Descarga el QR y úsalo en el local, redes y materiales

---

## Flujo de datos

```
Usuario llena el formulario
        ↓
JavaScript hace POST a Apps Script
        ↓
Apps Script guarda fila en Google Sheet
        ↓
Pantalla de éxito + botón WhatsApp precargado
```

---

## ¿Cómo ver los registros?

Abre el Google Sheet directamente.  
Cada vez que alguien se registre aparece una nueva fila al instante.

Para exportar: **Archivo → Descargar → Excel (.xlsx) o CSV**

---

## Archivos del proyecto

```
MUNDIAL PIKEO/
├── public/
│   └── index.html          ← landing + formulario
├── server.js               ← servidor local (solo para pruebas)
├── google-apps-script.js   ← código para pegar en Apps Script
└── INSTRUCCIONES-DEPLOY.md ← este archivo
```
