// ═══════════════════════════════════════════════════════════════════
//  LA TRIBU PIKEO · Google Apps Script
//  Pega este código en script.google.com y publícalo como Web App
// ═══════════════════════════════════════════════════════════════════

const SHEET_NAME = 'Registros';

function doPost(e) {
  try {
    const datos = JSON.parse(e.postData.contents);
    const hoja  = obtenerHoja();

    const ahora = new Date();
    const fechaRegistro = Utilities.formatDate(ahora, 'America/Bogota', 'dd/MM/yyyy HH:mm:ss');

    hoja.appendRow([
      fechaRegistro,
      datos.nombre             || '',
      datos.whatsapp           || '',
      datos.equipo1            || '',
      datos.marcador1          !== undefined ? datos.marcador1 : '',
      datos.equipo2            || '',
      datos.marcador2          !== undefined ? datos.marcador2 : '',
      datos.tipo               || '',
      datos.fecha_reserva      || '',
      datos.hora_reserva       || '',
      datos.cantidad_personas  || '',
      datos.acepta_comunicaciones || 'No'
    ]);

    return respuesta({ ok: true });

  } catch(err) {
    return respuesta({ ok: false, error: err.message });
  }
}

// Crea la hoja con encabezados si no existe
function obtenerHoja() {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  let hoja   = ss.getSheetByName(SHEET_NAME);

  if (!hoja) {
    hoja = ss.insertSheet(SHEET_NAME);
    hoja.appendRow([
      'Fecha registro',
      'Nombre',
      'WhatsApp',
      'Equipo 1',
      'Marcador equipo 1',
      'Equipo 2',
      'Marcador equipo 2',
      'Tipo participante',
      'Fecha reserva',
      'Hora reserva',
      'Cantidad personas',
      'Acepta comunicaciones'
    ]);

    // Formato encabezados
    const header = hoja.getRange(1, 1, 1, 12);
    header.setBackground('#d8450b');
    header.setFontColor('#f4e6c9');
    header.setFontWeight('bold');
    header.setFontSize(11);
    hoja.setFrozenRows(1);
    hoja.setColumnWidth(1, 160);
    hoja.setColumnWidth(2, 160);
    hoja.setColumnWidth(3, 150);
  }

  return hoja;
}

function respuesta(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Función de prueba — ejecútala manualmente para verificar que todo funciona
function testInsertar() {
  const hoja = obtenerHoja();
  hoja.appendRow([
    '13/06/2026 10:00:00',
    'TEST Laura',
    '+57 300 000 0000',
    'Colombia',
    2,
    'Brasil',
    1,
    'Reservar mesa',
    '2026-06-15',
    '18:00',
    '4',
    'Sí'
  ]);
  Logger.log('Fila de prueba insertada correctamente.');
}
