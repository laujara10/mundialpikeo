const express = require('express');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

function readDB() {
  if (!fs.existsSync(DB_FILE)) return { reservas: [], seq: 0 };
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

if (!fs.existsSync(DB_FILE)) writeDB({ reservas: [], seq: 0 });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Crear reserva
app.post('/api/reservas', (req, res) => {
  const {
    nombre, whatsapp,
    fecha_reserva, hora_reserva, cantidad_personas,
    equipo_a, equipo_b, gol_a, gol_b,
    acepta_comunicaciones
  } = req.body;

  if (!nombre || !whatsapp || !fecha_reserva || !hora_reserva ||
      !cantidad_personas || !equipo_a || !equipo_b ||
      gol_a === undefined || gol_b === undefined) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const db = readDB();
  db.seq += 1;

  const nueva = {
    id: db.seq,
    fecha_registro: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
    nombre: String(nombre).trim(),
    whatsapp: String(whatsapp).trim(),
    fecha_reserva,
    hora_reserva,
    cantidad_personas: parseInt(cantidad_personas),
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
  res.json({ success: true, id: nueva.id });
});

// Listar reservas
app.get('/api/reservas', (req, res) => {
  const { nombre, whatsapp, fecha } = req.query;
  let lista = readDB().reservas;
  if (nombre)  lista = lista.filter(r => r.nombre.toLowerCase().includes(nombre.toLowerCase()));
  if (whatsapp) lista = lista.filter(r => r.whatsapp.includes(whatsapp));
  if (fecha)   lista = lista.filter(r => r.fecha_reserva === fecha);
  res.json(lista);
});

// Check-in
app.patch('/api/reservas/:id/checkin', (req, res) => {
  const id = parseInt(req.params.id);
  const db = readDB();
  const r = db.reservas.find(x => x.id === id);
  if (!r) return res.status(404).json({ error: 'No encontrada' });
  r.checkin = true;
  r.estado = 'confirmado';
  writeDB(db);
  res.json({ success: true });
});

// Stats
app.get('/api/stats', (req, res) => {
  const lista = readDB().reservas;
  res.json({
    total: lista.length,
    checkins: lista.filter(r => r.checkin).length,
    personas: lista.reduce((s, r) => s + (r.cantidad_personas || 0), 0)
  });
});

// Exportar CSV
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

// Exportar Excel
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

app.listen(PORT, () => {
  console.log(`\n🔥 La Tribu Pikeo → http://localhost:${PORT}`);
  console.log(`📊 Panel admin     → http://localhost:${PORT}/admin.html\n`);
});
