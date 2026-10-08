const EMAIL_DESTINO = "abrusalva1@gmail.com";
const SHEET_ID = "1EF2DrHybL8M5Murcx_shsMQ67jgA38KUd69KAWGMuGs";

function doPost(e) {
  try {

    const data = JSON.parse(e.postData.contents);

    console.log("Datos recibidos:");
    console.log(JSON.stringify(data));

    const ss = SpreadsheetApp.openById(SHEET_ID);

    if (data.type === "message") {

      const sh = getOrCreateSheet_(
        ss,
        "Mensajes",
        ["Fecha", "Nombre", "Categoría", "Mensaje"]
      );

      sh.appendRow([
        new Date(),
        data.name || "",
        data.category || "",
        data.message || ""
      ]);
    }


    if (data.type === "rsvp_yes") {

      const sh = getOrCreateSheet_(
        ss,
        "RSVP",
        [
          "Fecha",
          "Respuesta",
          "Cantidad",
          "Invitados",
          "Restricciones",
          "Mensaje"
        ]
      );

      const names = (data.guests || [])
        .map(g => g.name || "")
        .join(" | ");

      const restrictions = (data.guests || [])
        .map(g => `${g.name || ""}: ${g.restrictions || "-"}`)
        .join(" | ");

      sh.appendRow([
        new Date(),
        "SI",
        data.guestCount || 1,
        names,
        restrictions,
        data.message || ""
      ]);

      MailApp.sendEmail({
        to: EMAIL_DESTINO,
        subject: "✅ Nueva confirmación - 15 de Juana",
        htmlBody: `
          <h2>Nueva confirmación de asistencia</h2>

          <p><strong>Respuesta:</strong> Sí, puedo ir</p>
          <p><strong>Cantidad:</strong> ${data.guestCount || 1}</p>
          <p><strong>Invitados:</strong> ${names}</p>
          <p><strong>Restricciones:</strong> ${restrictions}</p>
          <p><strong>Mensaje:</strong> ${data.message || "-"}</p>
        `
      });
    }


    if (data.type === "rsvp_no") {

      const sh = getOrCreateSheet_(
        ss,
        "RSVP",
        [
          "Fecha",
          "Respuesta",
          "Cantidad",
          "Invitados",
          "Restricciones",
          "Mensaje"
        ]
      );

      sh.appendRow([
        new Date(),
        "NO",
        0,
        data.name || "",
        "",
        data.message || ""
      ]);

      MailApp.sendEmail({
        to: EMAIL_DESTINO,
        subject: "❌ No podrá asistir - 15 de Juana",
        htmlBody: `
          <h2>Respuesta de invitado</h2>

          <p><strong>Respuesta:</strong> No podré asistir</p>
          <p><strong>Nombre:</strong> ${data.name || "-"}</p>
          <p><strong>Mensaje:</strong> ${data.message || "-"}</p>
        `
      });
    }


    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {

    console.error(err);

    throw err;
  }
}


function getOrCreateSheet_(ss, name, headers) {

  let sh = ss.getSheetByName(name);

  if (!sh) {

    sh = ss.insertSheet(name);

    sh.appendRow(headers);

    sh.getRange(
      1,
      1,
      1,
      headers.length
    ).setFontWeight("bold");

    sh.setFrozenRows(1);
  }

  return sh;
}
