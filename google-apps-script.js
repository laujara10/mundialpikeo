// ═══════════════════════════════════════════════════════════════
//  LA TRIBU PIKEO · Google Apps Script
//  Pega este código completo en script.google.com
// ═══════════════════════════════════════════════════════════════

function doPost(e) {
  try {
    const datos = JSON.parse(e.postData.contents);
    const hoja  = obtenerHoja();

    const fecha = Utilities.formatDate(
      new Date(), 'America/Bogota', 'dd/MM/yyyy HH:mm:ss'
    );

    hoja.appendRow([
      fecha,
      datos.tipo               || '',
      datos.nombre             || '',
      datos.whatsapp           || '',
      datos.fecha_reserva      || '',
      datos.hora_reserva       || '',
      datos.cantidad_personas  || '',
      datos.equipo_a           || '',
      datos.gol_a              !== undefined ? datos.gol_a : '',
      datos.equipo_b           || '',
      datos.gol_b              !== undefined ? datos.gol_b : '',
      datos.acepta_comunicaciones || 'No'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function obtenerHoja() {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  let hoja   = ss.getSheetByName('Registros');

  if (!hoja) {
    hoja = ss.insertSheet('Registros');

    // Encabezados
    hoja.appendRow([
      'Fecha registro',
      'Tipo',
      'Nombre',
      'WhatsApp',
      'Fecha reserva',
      'Hora reserva',
      'Personas',
      'Equipo A',
      'Goles A',
      'Equipo B',
      'Goles B',
      'Acepta comunicaciones'
    ]);

    // Formato encabezados
    const header = hoja.getRange(1, 1, 1, 11);
    header.setBackground('#d8450b');
    header.setFontColor('#f4e6c9');
    header.setFontWeight('bold');
    hoja.setFrozenRows(1);
    hoja.setColumnWidths(1, 11, 150);
  }

  return hoja;
}

// Ejecuta esto una vez para verificar que funciona
function testConexion() {
  const hoja = obtenerHoja();
  hoja.appendRow([
    'PRUEBA - puedes borrar esta fila',
    'Laura Test', '+57 300 000 0000',
    '2026-06-20', '18:00', '4',
    'Colombia', 2, 'Brasil', 1, 'Sí'
  ]);
  Logger.log('✅ Conexión exitosa');
}
