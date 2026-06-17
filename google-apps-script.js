// ═══════════════════════════════════════════════════════════════
//  LA TRIBU PIKEO · Google Apps Script
//  Pega este código completo en script.google.com
// ═══════════════════════════════════════════════════════════════

function doPost(e) {
  try {
    const datos = JSON.parse(e.postData.contents);

    if (datos.action === 'delete')       return eliminarFila(datos);
    if (datos.action === 'updateEstado') return actualizarEstado(datos);

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
      datos.acepta_comunicaciones || 'No',
      datos.id                 || '',  // columna 13: id interno
      datos.estado             || 'pendiente' // columna 14: estado
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

function actualizarEstado(datos) {
  try {
    const hoja    = obtenerHoja();
    const ultima  = hoja.getLastRow();
    if (ultima < 2) return respuesta({ ok: true, actualizado: false });

    const valores = hoja.getRange(2, 1, ultima - 1, 14).getValues();

    for (let i = valores.length - 1; i >= 0; i--) {
      const [,, nombre, whatsapp, fecha_reserva,,,,,,,,id] = valores[i];
      const porId        = datos.id && String(id) === String(datos.id);
      const porCompuesto = !porId
        && String(whatsapp).trim() === String(datos.whatsapp || '').trim()
        && String(nombre).trim()   === String(datos.nombre   || '').trim()
        && String(fecha_reserva)   === String(datos.fecha_reserva || '');

      if (porId || porCompuesto) {
        hoja.getRange(i + 2, 14).setValue(datos.estado); // columna 14 = estado
        return respuesta({ ok: true, actualizado: true });
      }
    }

    return respuesta({ ok: true, actualizado: false });
  } catch(err) {
    return respuesta({ ok: false, error: err.message });
  }
}

function eliminarFila(datos) {
  try {
    const hoja   = obtenerHoja();
    const ultima = hoja.getLastRow();
    if (ultima < 2) return respuesta({ ok: true, eliminado: false });

    const rango  = hoja.getRange(2, 1, ultima - 1, 13);
    const valores = rango.getValues();

    // Busca primero por id en columna 13; si no, por whatsapp+nombre+fecha
    for (let i = valores.length - 1; i >= 0; i--) {
      const [,, nombre, whatsapp, fecha_reserva,,,,,,,,id] = valores[i];
      const porId        = datos.id        && String(id) === String(datos.id);
      const porCompuesto = !porId
        && String(whatsapp).trim() === String(datos.whatsapp || '').trim()
        && String(nombre).trim()   === String(datos.nombre   || '').trim()
        && String(fecha_reserva)   === String(datos.fecha_reserva || '');

      if (porId || porCompuesto) {
        hoja.deleteRow(i + 2); // +2: fila 1 es encabezado, índice base 0
        return respuesta({ ok: true, eliminado: true });
      }
    }

    return respuesta({ ok: true, eliminado: false });
  } catch(err) {
    return respuesta({ ok: false, error: err.message });
  }
}

function respuesta(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
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
