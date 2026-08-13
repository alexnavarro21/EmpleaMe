const XLSX = require("xlsx");
const iconv = require("iconv-lite");

// Los .xlsx (zip) y .xls (OLE) antiguos ya traen su propio codepage embebido
// y SheetJS lo resuelve solo. El problema es el CSV/TXT: no lleva codificación
// declarada, y las nóminas exportadas por sistemas de colegios suelen venir en
// Windows-1252/Latin-1 en vez de UTF-8. Si se decodifican como UTF-8 a la fuerza,
// cada tilde o "ñ" se corrompe en el caracter de reemplazo U+FFFD ("�"/"?").
function esBinarioOfimatico(buffer) {
  if (buffer.length < 4) return false;
  const esZip = buffer[0] === 0x50 && buffer[1] === 0x4b; // xlsx/xlsm (PK\x03\x04)
  const esOle = buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0; // xls antiguo
  return esZip || esOle;
}

function decodificarTextoPlano(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return buffer.slice(3).toString("utf8"); // BOM UTF-8 explícito
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return iconv.decode(buffer, "win1252");
  }
}

// Reemplazo seguro de XLSX.read(buffer, { type: "buffer" }) para archivos
// subidos por el usuario (xlsx, xls o csv de origen incierto).
function leerLibroExcel(buffer) {
  if (esBinarioOfimatico(buffer)) {
    return XLSX.read(buffer, { type: "buffer" });
  }
  return XLSX.read(decodificarTextoPlano(buffer), { type: "string" });
}

// Normaliza un nombre/apellido: colapsa espacios, y deja mayúscula solo la
// primera letra de cada palabra (separada por espacio, guión o apóstrofo).
// Así "JOSÉ  MANUEL" -> "José Manuel" y "MARIE-ANGE" -> "Marie-Ange",
// sin importar si el archivo de origen venía todo en mayúsculas.
function capitalizarNombre(texto) {
  if (!texto) return texto;
  const capitalizarParte = (parte) =>
    parte ? parte.charAt(0).toUpperCase() + parte.slice(1) : parte;

  return texto
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .split(" ")
    .map((palabra) =>
      palabra
        .split("-")
        .map((tramo) => tramo.split("'").map(capitalizarParte).join("'"))
        .join("-")
    )
    .join(" ");
}

module.exports = { leerLibroExcel, capitalizarNombre };
