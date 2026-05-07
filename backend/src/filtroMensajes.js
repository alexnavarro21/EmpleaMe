const leoProfanity = require("leo-profanity");

// Diccionarios adicionales
leoProfanity.loadDictionary("fr");
leoProfanity.loadDictionary("de");
leoProfanity.loadDictionary("pt");

// Chilenismos, español general y abreviaciones
const palabrasLocales = [
  // ── Concha y variantes ────────────────────────────────────────
  "ctm", "ctmre",
  "conchetumare", "conchatumadre", "conchetumadre", "conchetumadree",
  "conchadesumadre", "conchasumadre", "conchaesumadre",
  "concha tu madre", "concha de tu madre", "concha e tu madre",
  "reconcha", "reconchesumadre", "reconchetu", "reconcha tu madre",

  // ── Hijo de puta y variantes ──────────────────────────────────
  "hdp", "h.d.p",
  "hijodeputa", "hijodeputas", "hijaputa", "hijueputa",
  "hijo de puta", "hijo de la puta", "hija de puta",
  "la puta que te parió", "la puta que lo parió", "la puta que te pario",
  "reputa", "reputo",

  // ── Puta/puto y variantes ─────────────────────────────────────
  "ptm", "p.t.m",
  "puta madre", "puta tu madre", "puta la madre",
  "puta", "puto", "putear", "puteado", "put4", "put0",
  "puta de mierda",

  // ── Chucha y variantes ────────────────────────────────────────
  "chucha", "lachucha", "rechucha",
  "chucha tu madre", "chuchatu madre", "chuchatumare",
  "la chucha de tu madre", "chuchetumadre", "chuch4",

  // ── Mierda y variantes ────────────────────────────────────────
  "mierda", "mierdas", "mierd", "mrd", "m1erda",
  "mierdear", "de mierda",

  // ── Culo/culiao y variantes ───────────────────────────────────
  "culiao", "culiado", "culiar", "culia", "culi4o",
  "culero", "culera", "culeroo", "qlero",
  "culo", "cul0", "c*lo",
  "culear",

  // ── Coño ─────────────────────────────────────────────────────
  "coño", "con0", "c0ño",

  // ── Maricon y variantes ───────────────────────────────────────
  "maricon", "maricón", "maricona", "marica",
  "maraco", "maracón", "maracona",

  // ── Aweonao y variantes ───────────────────────────────────────
  "aweonao", "aweonada", "aweonado", "aweoná",

  // ── QL y variantes ────────────────────────────────────────────
  "ql", "qlo", "qliao", "qliaa", "qliaoo", "qlia", "qliado", "qliada",

  // ── Pichula / sexual ──────────────────────────────────────────
  "pichula", "pichulita",
  "chupapico", "chupapija", "chupala", "chúpala",
  "chupa", "chupalo", "chúpalo",
  "pajero", "pajera", "pajeros", "pajeras",
  "mamahuevo", "mama huevo", "mamagüevo",

  // ── Weon y variantes ─────────────────────────────────────────
  "weon", "weón", "weonas", "weonazo", "weonaza", "weonada", "wn",
  "hueón", "hue0n", "hueona", "weá", "hueá",
  "huevon", "huevón", "huevonazo", "huevonas",
  "huevón de mierda", "weon de mierda", "weon culiao",

  // ── Saco de wea ───────────────────────────────────────────────
  "saco de wea", "sacowea", "scw", "saco wea",

  // ── Sapo / perkin (soplón) ────────────────────────────────────
  "perkin", "perkins", "perkin culiao",
  "sapo", "sapo culiao", "sapo de mierda", "sapo asqueroso", "sapo ql",
  "chanta", "chantas", "chanta culiao",
  "trola", "trolo", "trolas", "trolos",
  "fleta", "fleto",

  // ── Clasismo ─────────────────────────────────────────────────
  "roto", "rota", "roto culiao", "roto de mierda", "rota culiao",
  "gil", "gila", "giles",
  "naco", "naca",
  "pelao culiao", "pelada culiao",

  // ── Insultos generales español ────────────────────────────────
  "idiota", "idiot4", "idiotas",
  "imbecil", "imbécil", "imbeciles", "imbéciles",
  "estupido", "estúpido", "estupida", "estúpida", "estup1do",
  "pendejo", "pendeja", "pendejos", "pendejas",
  "pelotudo", "pelotuda", "pelotudos", "pelotudas",
  "tonto", "tonta", "tontos", "tontas", "tontito", "tontita",
  "burro", "burra", "burros", "burras",
  "animal", "bestia",
  "feo", "fea", "feísimo", "feísima",
  "cabrón", "cabron", "cabrones",
  "perra", "perras", "zorra", "zorras",
  "gilipollas",
  "prostituta", "prostituto",
  "mogolico", "mogólico", "mongolico", "mongólico",
  "mongoloide", "mongoloides",
  "retrasado", "retrasada", "retrasados", "retrasadas",
  "subnormal", "subnormales",
  "tarado", "tarada", "tarados", "taradas",
  "inútil", "inutiles", "inútiles",
  "cagón", "cagon", "cagona", "cagones",
  "cagada", "cagadas",
  "come mierda", "comemierda", "comemierdas",
  "choro de mierda",

  // ── Discriminación y body shaming ────────────────────────────
  "gordo de mierda", "gordo inútil", "gorda de mierda", "gorda inútil",
  "gorda culiao", "gordo culiao",

  // ── Racismo ───────────────────────────────────────────────────
  "nigger", "nigga", "n-word",
  "negro de mierda", "negra de mierda",
  "indio culiao", "india culiao",

  // ── Amenazas / acoso ─────────────────────────────────────────
  "matate", "muérete", "muerate", "muerete",
  "andate a la mierda", "anda a la mierda", "vayase a la mierda", "vete a la mierda",
  "andate a la chucha", "ándate a la chucha", "andate ala chucha",
  "andate a la ctm", "ándate a la ctm",
  "andate a la cresta", "ándate a la cresta", "anda a la cresta", "a la cresta",
  "te voy a matar", "te mato", "voy a matarte", "te voy a matar culiao",
  "te voy a cagar", "te cago",
  "te voy a romper", "te rompo la cara",
  "te voy a partir la cara", "te voy a partir", "te parto",
  "te voy a golpear", "te voy a pegar",

  // ── Abreviaciones ─────────────────────────────────────────────
  "stfu", "gtfo", "kys", "wtf", "mf",
];

leoProfanity.add(palabrasLocales);

function esMensajeInapropiado(texto) {
  return leoProfanity.check(texto);
}

module.exports = { esMensajeInapropiado };
