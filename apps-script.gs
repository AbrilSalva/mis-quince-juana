/**
 * BACKEND GRATUITO PARA MENSAJES + RSVP
 * 1) Creá un Google Sheet vacío.
 * 2) Extensiones > Apps Script.
 * 3) Pegá este código.
 * 4) Implementar > Nueva implementación > Aplicación web.
 * 5) Ejecutar como: vos. Acceso: Cualquier persona.
 * 6) Copiá la URL terminada en /exec y pegala en CONFIG.appsScriptUrl de app.js
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.type === "message") {
      const sh = getOrCreateSheet_(ss, "Mensajes", ["Fecha","Nombre","Categoría","Mensaje"]);
      sh.appendRow([new Date(), data.name || "", data.category || "", data.message || ""]);
    }

    if (data.type === "rsvp_yes") {
      const sh = getOrCreateSheet_(ss, "RSVP", ["Fecha","Respuesta","Cantidad","Invitados","Restricciones","Mensaje"]);
      const names = (data.guests || []).map(g => g.name || "").join(" | ");
      const restrictions = (data.guests || []).map(g => `${g.name || ""}: ${g.restrictions || "-"}`).join(" | ");
      sh.appendRow([new Date(), "SI", data.guestCount || 1, names, restrictions, data.message || ""]);
    }

    if (data.type === "rsvp_no") {
      const sh = getOrCreateSheet_(ss, "RSVP", ["Fecha","Respuesta","Cantidad","Invitados","Restricciones","Mensaje"]);
      sh.appendRow([new Date(), "NO", 0, data.name || "", "", data.message || ""]);
    }

    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.getRange(1,1,1,headers.length).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}
