const leoProfanity = require("leo-profanity");

// Diccionarios adicionales
leoProfanity.loadDictionary("fr");
leoProfanity.loadDictionary("de");
leoProfanity.loadDictionary("pt");

// Chilenismos, español general y abreviaciones
const palabrasLocales = [

  // ── CTM / concha y variantes ──────────────────────────────────
  "ctm", "ctmre", "c.t.m", "c-t-m", "c.t.m.r.e",
  "conchetumare", "conchetumadre", "conchetumadree",
  "conchatumadre", "conch4tumadre", "c0nchetumare",
  "conchadesumadre", "conchasumadre", "conchaesumadre",
  "concha tu madre", "concha de tu madre", "concha e tu madre",
  "c0ncha tu madre", "c0nchadesumadre",
  "reconcha", "reconchesumadre", "reconchetu", "reconcha tu madre",
  "rec0ncha", "rec0nchesumadre",

  // ── HDP / hijo de puta y variantes ───────────────────────────
  "hdp", "h.d.p", "h-d-p", "h_d_p",
  "hijodeputa", "hij0deputa", "hijodeput4",
  "hijodeputas", "hij0deputas",
  "hijaputa", "hij4puta", "hij4put4",
  "hijueputa", "hijueput4", "h1jueputa",
  "hijo de puta", "hijo de la puta", "hija de puta",
  "h1jo de puta", "hij0 de puta",
  "la puta que te parió", "la puta que te pario",
  "la puta que lo parió", "la puta que lo pario",
  "reputa", "reputo", "reput4",

  // ── PTM / puta madre y variantes ─────────────────────────────
  "ptm", "p.t.m", "p-t-m",
  "puta madre", "put4 madre", "puta m4dre", "put4 m4dre",
  "puta tu madre", "put4 tu madre",
  "puta la madre", "puta de mierda",
  "puta", "put4", "put@", "p*ta", "pu74",
  "puto", "put0", "p*to",
  "putear", "put3ar", "puteado", "put3ado",
  "putas", "put4s",

  // ── Chucha y variantes ────────────────────────────────────────
  "chucha", "chuch4", "ch*cha", "chuch@", "chucha",
  "lachucha", "l4chucha", "rechucha", "r3chucha",
  "chucha tu madre", "chuch4 tu madre",
  "chuchatu madre", "chuchatumare", "chuchatumadre",
  "la chucha de tu madre", "chuchetumadre",
  "chuch4tumare", "chuch4tumadre",

  // ── Mierda y variantes ────────────────────────────────────────
  "mierda", "m1erda", "mi3rda", "m13rda", "m1erd4",
  "mierd4", "m*erda", "mi3rd4",
  "mierdas", "m1erdas", "mierd", "mrd",
  "mierdear", "de mierda",

  // ── Culo / culiao y variantes ─────────────────────────────────
  "culo", "cul0", "c*lo", "cul@",
  "culiao", "culi4o", "cul1ao", "cul1@o", "culi@o", "kuli4o",
  "culiado", "culi4do", "cul14do",
  "culiar", "cul14r", "culia",
  "culero", "cul3ro", "cul3r0", "culeroo", "culera", "cul3ra",
  "qlero", "ql3ro",
  "culear", "cule4r",

  // ── Coño y variantes ─────────────────────────────────────────
  "coño", "c0ño", "con0", "c*ño", "c0n0",

  // ── Maricon y variantes ───────────────────────────────────────
  "maricon", "maricón", "mar1con", "mar1c0n", "m4ricon",
  "maricona", "mar1cona", "mar1c0na",
  "marica", "m4rica",
  "maraco", "maracón", "mar4co", "m4raco",
  "maracona", "mar4cona",

  // ── Aweonao y variantes ───────────────────────────────────────
  "aweonao", "aw3onao", "4weonao",
  "aweonada", "aw3onada",
  "aweonado", "aw3onado",
  "aweoná", "aw3oná",

  // ── QL y variantes ────────────────────────────────────────────
  "ql", "qlo", "q.l", "q-l",
  "qliao", "qli4o", "ql1ao",
  "qliaa", "qliaoo", "qlia", "qliado", "qliada",
  "ql1ado", "ql14do",

  // ── Pichula / sexual ──────────────────────────────────────────
  "pichula", "p1chula", "p1chul4", "pichul4",
  "pichulita", "p1chulita",
  "pajero", "p4jero", "paj3ro", "pajeros",
  "pajera", "p4jera", "paj3ra", "pajeras",
  "chupapico", "chupap1co", "chup4pico",
  "chupapija", "chupap1ja", "chup4pija",
  "chupala", "chúpala", "chup4la",
  "chupa", "chup4", "chupalo", "chúpalo", "chup4lo",
  "mamahuevo", "m4mahuevo", "mama huevo", "mamagüevo", "m4magüevo",

  // ── Weon / huevon y variantes ─────────────────────────────────
  "weon", "w3on", "w30n", "we0n",
  "weón", "weonas", "weonazo", "weonaza", "weonada", "wn",
  "hueón", "hue0n", "hu30n", "hueona",
  "weá", "we4", "hueá", "hue4",
  "huevon", "huev0n", "hu3von", "hu3v0n", "hv0n",
  "huevón", "huevonazo", "huevonas",
  "huevón de mierda", "weon de mierda", "weon culiao",
  "w3on culiao", "hu3von de mierda",

  // ── Saco de wea ───────────────────────────────────────────────
  "saco de wea", "s4co de wea", "sacowea", "scw", "saco wea",

  // ── Perkin / sapo (soplón) ────────────────────────────────────
  "perkin", "p3rkin", "p3rk1n", "perkins",
  "perkin culiao", "p3rkin culiao",
  "sapo", "s4po", "sapo culiao", "s4po culiao",
  "sapo de mierda", "sapo asqueroso", "sapo ql",
  "chanta", "ch4nta", "chantas",
  "chanta culiao", "ch4nta culiao",
  "trola", "tr0la", "trolas", "trolo", "tr0lo", "trolos",
  "fleta", "fl3ta", "fleto", "fl3to",

  // ── Clasismo ──────────────────────────────────────────────────
  "roto", "r0to", "rota", "r0ta",
  "roto culiao", "r0to culiao",
  "roto de mierda", "rota culiao",
  "gil", "g1l", "gila", "g1la", "giles",
  "naco", "n4co", "naca", "n4ca",
  "pelao culiao", "pel4o culiao", "pelada culiao",

  // ── Idiota y variantes ────────────────────────────────────────
  "idiota", "1diota", "idi0ta", "1di0ta", "idiot4", "id10ta",
  "idiotas", "1diotas",

  // ── Imbécil y variantes ───────────────────────────────────────
  "imbecil", "imbécil", "1mbecil", "imb3cil", "imb3c1l",
  "imbeciles", "imbéciles", "1mbeciles", "imb3ciles",

  // ── Estúpido y variantes ──────────────────────────────────────
  "estupido", "estúpido", "estup1do", "3stupido", "3stup1do",
  "estupid0", "3stup1d0", "estup1d0",
  "estupida", "estúpida", "estup1da", "3stupida", "estupid4",

  // ── Pendejo y variantes ───────────────────────────────────────
  "pendejo", "p3ndejo", "pend3jo", "p3nd3jo", "p3nd3j0",
  "pendeja", "p3ndeja", "pend3ja", "p3nd3ja",
  "pendejos", "pendejas",

  // ── Pelotudo y variantes ──────────────────────────────────────
  "pelotudo", "p3lotudo", "pel0tudo", "p3l0tudo",
  "pelotuda", "p3lotuda", "pel0tuda",
  "pelotudos", "pelotudas",

  // ── Tonto y variantes ─────────────────────────────────────────
  "tonto", "t0nto", "t0nt0", "tontos",
  "tonta", "t0nta", "tontas",
  "tontito", "t0ntito", "tontita", "t0ntita",

  // ── Burro y variantes ─────────────────────────────────────────
  "burro", "burr0", "b*rro", "burros",
  "burra", "burr4", "b*rra", "burras",
  "animal", "bestia",

  // ── Feo / fea (insulto apariencia) ───────────────────────────
  "feo", "f3o", "fea", "f3a",
  "feísimo", "feisimo", "f3isimo",
  "feísima", "feisima", "f3isima",

  // ── Cabrón y variantes ────────────────────────────────────────
  "cabrón", "cabron", "c4bron", "c4br0n", "cabr0n",
  "cabrones", "c4brones",
  "perra", "p3rra", "perras", "p3rras",
  "zorra", "z0rra", "zorras", "z0rras",
  "gilipollas", "g1lipollas",

  // ── Prostituta y variantes ────────────────────────────────────
  "prostituta", "pr0stituta", "pr0st1tuta", "prost1tuta",
  "prostituto", "pr0stituto",

  // ── Retrasado y variantes ─────────────────────────────────────
  "retrasado", "r3trasado", "retr4sado", "r3tr4s4do",
  "retrasada", "r3trasada", "retr4sada",
  "retrasados", "retrasadas",

  // ── Mogólico / mongoloide ────────────────────────────────────
  "mogolico", "mogólico", "m0golico", "m0g0lico",
  "mongolico", "mongólico", "m0ngolico",
  "mongoloide", "m0ngoloide", "mongoloides",

  // ── Subnormal / tarado ────────────────────────────────────────
  "subnormal", "subn0rmal", "subnormales",
  "tarado", "t4rado", "tar4do", "t4r4do",
  "tarada", "t4rada", "tar4da",
  "tarados", "taradas",

  // ── Inútil y variantes ────────────────────────────────────────
  "inútil", "inutil", "1nutil", "1nút1l",
  "inutiles", "inútiles", "1nutiles",

  // ── Cagón / cagada ────────────────────────────────────────────
  "cagón", "cagon", "c4gon", "c4g0n",
  "cagona", "c4gona", "cagones",
  "cagada", "c4gada", "cag4da", "cagadas",

  // ── Come mierda ───────────────────────────────────────────────
  "come mierda", "c0me mierda", "come m1erda",
  "comemierda", "c0memierda", "comem1erda", "comemierdas",
  "choro de mierda", "ch0ro de mierda",

  // ── Discriminación y body shaming ────────────────────────────
  "gordo de mierda", "g0rdo de mierda",
  "gordo inútil", "g0rdo inutil",
  "gorda de mierda", "g0rda de mierda",
  "gorda inútil", "g0rda inutil",
  "gorda culiao", "gordo culiao",

  // ── Racismo ───────────────────────────────────────────────────
  "nigger", "n1gger", "n1gg3r", "nigg3r",
  "nigga", "n1gga", "n-word",
  "negro de mierda", "n3gro de mierda",
  "negra de mierda", "n3gra de mierda",
  "indio culiao", "1ndio culiao",
  "india culiao",

  // ── Amenazas / acoso ─────────────────────────────────────────
  "matate", "m4tate", "mat4te",
  "muérete", "muerate", "muerete", "mu3rete",
  "andate a la mierda", "andate a la m1erda",
  "anda a la mierda", "anda a la m1erda",
  "vayase a la mierda", "vete a la mierda",
  "andate a la chucha", "ándate a la chucha", "andate ala chucha",
  "andate a la ctm", "ándate a la ctm",
  "andate a la cresta", "ándate a la cresta",
  "anda a la cresta", "a la cresta",
  "te voy a matar", "te mato", "voy a matarte",
  "te voy a cagar", "te cago",
  "te voy a romper", "te rompo la cara",
  "te voy a partir la cara", "te voy a partir", "te parto",
  "te voy a golpear", "te voy a pegar",

  // ── Abreviaciones ─────────────────────────────────────────────
  "stfu", "s.t.f.u", "gtfo", "g.t.f.o",
  "kys", "k.y.s",
  "wtf", "w.t.f",
  "mf", "m.f",
];

leoProfanity.add(palabrasLocales);

function esMensajeInapropiado(texto) {
  return leoProfanity.check(texto);
}

module.exports = { esMensajeInapropiado };
