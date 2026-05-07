const leoProfanity = require("leo-profanity");

// Diccionarios adicionales
leoProfanity.loadDictionary("fr");
leoProfanity.loadDictionary("de");
leoProfanity.loadDictionary("pt");

// Chilenismos, español general y abreviaciones
const palabrasLocales = [
  // Insultos directos
  "ctm", "conchetumare", "conchatumadre", "conchetumadre", "conchadesumadre",
  "hdp", "hijodeputa", "hijodeputas", "hijaputa", "hijueputa", "hijo de puta",
  "chucha", "lachucha", "rechucha", "chuchatu madre", "chuchatumare",
  "la chucha de tu madre",
  "puta", "puto", "putear", "puteado", "put4", "put0",
  "mierda", "mierdas", "mierd", "mrd",
  "culiao", "culiado", "culiar", "culia", "culi4o",
  "culo", "cul0",
  "coño", "con0",
  "maricon", "maricón", "marica", "maraco", "maracón",
  "aweonao", "aweonada", "aweonado", "aweoná",
  "ql", "qlo", "qliao", "qliaa", "qliaoo", "qlia", "qliado",
  "pichula",
  "chupa", "chupalo", "chúpalo",

  // Weon y variantes
  "weon", "weón", "weonas", "weonazo", "weonaza", "wn",
  "hueón", "hue0n", "weá", "hueá",
  "huevon", "huevón", "huevonazo",

  // Saco de wea y variantes
  "saco de wea", "sacowea", "scw", "saco wea",

  // Insultos generales español
  "idiota", "idiot4", "imbecil", "imbécil", "estupido", "estúpido",
  "pendejo", "pendeja", "pelotudo", "pelotuda",
  "cabrón", "cabron", "perra", "zorra",
  "gilipollas", "prostituta",
  "mogolico", "mogólico", "retrasado", "retrasada", "mongolico", "mongólico",
  "mongoloide", "subnormal", "tarado", "tarada", "inútil",
  "cagón", "cagon", "cagada",
  "come mierda", "comemierda",
  "choro de mierda",
  "mamahuevo", "mama huevo",

  // Discriminación y body shaming
  "gordo de mierda", "gordo inútil",

  // Racismo
  "nigger", "nigga", "n-word",
  "negro de mierda",
  "indio culiao",

  // Amenazas / acoso
  "matate", "muérete", "muerate",
  "andate a la mierda", "anda a la mierda", "vayase a la mierda",
  "andate a la chucha", "ándate a la chucha", "andate ala chucha",
  "te voy a matar", "te mato", "voy a matarte",
  "te voy a cagar", "te cago",
  "te voy a romper", "te rompo la cara",

  // Abreviaciones comunes
  "stfu", "wtf", "kys", "mf",
];

leoProfanity.add(palabrasLocales);

function esMensajeInapropiado(texto) {
  return leoProfanity.check(texto);
}

module.exports = { esMensajeInapropiado };
