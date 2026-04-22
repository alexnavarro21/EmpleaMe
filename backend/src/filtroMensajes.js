const leoProfanity = require("leo-profanity");

// Diccionarios adicionales
leoProfanity.loadDictionary("fr");
leoProfanity.loadDictionary("de");
leoProfanity.loadDictionary("pt");

// Chilenismos, español general y abreviaciones
const palabrasLocales = [
  // Insultos directos
  "ctm", "conchetumare", "conchatumadre", "conchatumadre",
  "hdp", "hijodeputa", "hijodeputas", "hijaputa",
  "chucha", "lachucha", "rechucha",
  "puta", "puto", "putear", "puteado",
  "mierda", "mierdas",
  "culiao", "culiado", "culiar", "culia",
  "maricon", "maricón", "marica",
  "aweonao", "aweonada", "aweonado",
  "ql", "qlo", "qliao", "qliaa", "qliaoo",


  // Weon y variantes
  "weon", "weón", "weonas", "weonazo", "weonaza",
  "huevon", "huevón", "huevonazo",

  // Insultos generales español
  "idiota", "imbecil", "imbécil", "estupido", "estúpido",
  "pendejo", "pendeja", "pelotudo", "pelotuda",
  "cabrón", "cabron", "perra", "perro",
  "mogolico", "mogólico", "retrasado","retrasada", "mongolico", "mongólico",
  "subnormal", "tarado", "tarada",

  // Amenazas / acoso
  "matate", "muérete", "muerate", "andate a la mierda",
  "anda a la mierda", "vayase a la mierda",

  // Abreviaciones comunes
  "stfu", "wtf", "kys",
];

leoProfanity.add(palabrasLocales);

function esMensajeInapropiado(texto) {
  return leoProfanity.check(texto);
}

module.exports = { esMensajeInapropiado };
