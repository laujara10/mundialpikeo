const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// ── Base de datos local (solo para respaldo y panel admin) ──────
function readDB() {
  if (!fs.existsSync(DB_FILE)) return { reservas: [], seq: 0 };
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

if (!fs.existsSync(DB_FILE)) writeDB({ reservas: [], seq: 0 });

// ── Enviar a Google Sheets (solo en producción) ─────────────────
function enviarASheets(datos) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) return; // sin URL = modo local, no hace nada

  const body = JSON.stringify(datos);
  const urlObj = new URL(url);

  const opciones = {
    hostname: urlObj.hostname,
    path: urlObj.pathname + urlObj.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const req = https.request(opciones, (res) => {
    // Seguir redirecciones de Google (código 302)
    if (res.statusCode === 302 && res.headers.location) {
      const loc = new URL(res.headers.location);
      const req2 = https.request({
        hostname: loc.hostname,
        path: loc.pathname + loc.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      }, () => {});
      req2.on('error', () => {});
      req2.write(body);
      req2.end();
    }
  });

  req.on('error', (e) => console.error('Sheets error:', e.message));
  req.write(body);
  req.end();
}

// ── Middleware ──────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Crear reserva ───────────────────────────────────────────────
app.post('/api/reservas', (req, res) => {
  const {
    tipo, nombre, whatsapp,
    fecha_reserva, hora_reserva, cantidad_personas,
    equipo_a, equipo_b, gol_a, gol_b,
    acepta_comunicaciones
  } = req.body;

  if (!tipo || !nombre || !whatsapp || !equipo_a || !equipo_b ||
      gol_a === undefined || gol_b === undefined) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  // Guardar en db.json (local y Railway como respaldo)
  const db = readDB();
  db.seq += 1;

  const nueva = {
    id: db.seq,
    fecha_registro: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
    tipo: tipo === 'reserva' ? 'Reserva' : 'Walk-in',
    nombre: String(nombre).trim(),
    whatsapp: String(whatsapp).trim(),
    fecha_reserva:    tipo === 'reserva' ? fecha_reserva : '',
    hora_reserva:     tipo === 'reserva' ? hora_reserva  : '',
    cantidad_personas: tipo === 'reserva' ? parseInt(cantidad_personas) : 0,
    equipo_a: String(equipo_a).trim(),
    equipo_b: String(equipo_b).trim(),
    gol_a: parseInt(gol_a),
    gol_b: parseInt(gol_b),
    acepta_comunicaciones: acepta_comunicaciones ? 'Sí' : 'No',
    checkin: false,
    estado: 'pendiente'
  };

  db.reservas.unshift(nueva);
  writeDB(db);

  // Enviar a Google Sheets en paralelo (no bloquea la respuesta)
  enviarASheets(nueva);

  res.json({ success: true, id: nueva.id });
});

// ── Listar reservas (panel admin) ───────────────────────────────
app.get('/api/reservas', (req, res) => {
  const { nombre, whatsapp, fecha } = req.query;
  let lista = readDB().reservas;
  if (nombre)   lista = lista.filter(r => r.nombre.toLowerCase().includes(nombre.toLowerCase()));
  if (whatsapp) lista = lista.filter(r => r.whatsapp.includes(whatsapp));
  if (fecha)    lista = lista.filter(r => r.fecha_reserva === fecha);
  res.json(lista);
});

// ── Check-in ────────────────────────────────────────────────────
app.patch('/api/reservas/:id/checkin', (req, res) => {
  const id = parseInt(req.params.id);
  const db = readDB();
  const r = db.reservas.find(x => x.id === id);
  if (!r) return res.status(404).json({ error: 'No encontrada' });
  r.checkin = true;
  writeDB(db);
  res.json({ success: true });
});

// ── Cambiar estado ───────────────────────────────────────────────
app.patch('/api/reservas/:id/estado', (req, res) => {
  const id     = parseInt(req.params.id);
  const estado = req.body.estado;
  const VALIDOS = ['pendiente', 'confirmada', 'cancelada'];
  if (!VALIDOS.includes(estado)) return res.status(400).json({ error: 'Estado inválido' });

  const db = readDB();
  const r  = db.reservas.find(x => x.id === id);
  if (!r) return res.status(404).json({ error: 'No encontrada' });
  r.estado = estado;
  writeDB(db);

  enviarASheets({
    action:        'updateEstado',
    id:            r.id,
    nombre:        r.nombre,
    whatsapp:      r.whatsapp,
    fecha_reserva: r.fecha_reserva,
    estado
  });

  res.json({ success: true });
});

// ── Eliminar reserva ────────────────────────────────────────────
app.delete('/api/reservas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
  const db = readDB();
  const idx = db.reservas.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrada' });
  const [eliminada] = db.reservas.splice(idx, 1);
  writeDB(db);

  // Sincronizar borrado con Google Sheets (best-effort, no bloquea)
  enviarASheets({
    action:        'delete',
    id:            eliminada.id,
    nombre:        eliminada.nombre,
    whatsapp:      eliminada.whatsapp,
    fecha_reserva: eliminada.fecha_reserva
  });

  res.json({ success: true });
});

// ── Stats ───────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const lista = readDB().reservas;
  res.json({
    total: lista.length,
    checkins: lista.filter(r => r.checkin).length,
    personas: lista.reduce((s, r) => s + (r.cantidad_personas || 0), 0)
  });
});

// ── Exportar CSV ────────────────────────────────────────────────
app.get('/api/export/csv', (req, res) => {
  const lista = readDB().reservas;
  const cols = ['id','fecha_registro','nombre','whatsapp','fecha_reserva','hora_reserva',
                 'cantidad_personas','equipo_a','gol_a','equipo_b','gol_b',
                 'acepta_comunicaciones','checkin','estado'];
  const csv = [
    cols.join(','),
    ...lista.map(r => cols.map(c => `"${String(r[c] ?? '').replace(/"/g,'""')}"`).join(','))
  ].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="reservas_mundial.csv"');
  res.send('﻿' + csv);
});

// ── Exportar Excel ──────────────────────────────────────────────
app.get('/api/export/excel', (req, res) => {
  const lista = readDB().reservas;
  const ws = XLSX.utils.json_to_sheet(lista);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reservas');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="reservas_mundial.xlsx"');
  res.send(buf);
});

// ── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  const modo = process.env.APPS_SCRIPT_URL ? '🟢 Producción (Google Sheets activo)' : '🟡 Local (solo db.json)';
  console.log(`\n⚽ La Tribu Pikeo → http://localhost:${PORT}`);
  console.log(`📊 Panel admin    → http://localhost:${PORT}/admin.html`);
  console.log(`📋 Modo           → ${modo}\n`);
});
