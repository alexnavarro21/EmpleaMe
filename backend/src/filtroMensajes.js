const leoProfanity = require("leo-profanity");

// Palabras locales adicionales (reemplazan la tabla palabras_prohibidas en BD)
const palabrasLocales = [
  "ctm", "conchetumare", "conchatumadre", "weon", "weón", "weonas",
  "culiao", "culiado", "maricon", "maricón", "puta", "puto", "aweonao",
  "aweonada", "huevon", "huevón", "mierda", "hdp", "hijodeputas",
];

leoProfanity.add(palabrasLocales);

function esMensajeInapropiado(texto) {
  return leoProfanity.check(texto);
}

module.exports = { esMensajeInapropiado };
