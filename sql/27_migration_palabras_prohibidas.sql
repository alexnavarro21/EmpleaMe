CREATE TABLE IF NOT EXISTS palabras_prohibidas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  palabra VARCHAR(100) NOT NULL UNIQUE,
  creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO palabras_prohibidas (palabra) VALUES
-- === ESPAÑOL GENERAL ===
('mierda'), ('mierd'), ('mrd'),
('puta'), ('put4'), ('perra'), ('zorra'),
('puto'), ('put0'),
('culo'), ('cul0'),
('coño'), ('con0'),
('idiota'), ('idiot4'),
('imbécil'), ('imbecil'),
('estúpido'), ('estupido'),
('gilipollas'),
('cabrón'), ('cabron'),
('hijueputa'),
('hijo de puta'), ('hp'),
('maricón'), ('maricon'), ('marica'),
('prostituta'),

-- === CHILENISMOS Y ABREVIACIONES ===
('huevón'), ('huevon'), ('weon'), ('weón'), ('wn'),
('concha'), ('conch4'),
('culiao'), ('culi4o'), ('culiado'),
('ctm'), ('conchatumadre'), ('concha de tu madre'),
('chucha'), ('chuch4'),
('aweonao'), ('aweoná'), ('aweonado'),
('saco de wea'), ('sacowea'), ('scw'), ('saco wea'),
('weá'), ('hueá'),
('maraco'), ('maracón'),
('conchetumare'), ('conchetumadre'),
('conchadesumadre'),
('qlia'), ('qliado'), ('qliao'), ('ql'),
('pichula'),
('raja'),
('mamahuevo'), ('mama huevo'),
('come mierda'), ('comemierda'),
('andate a la chucha'),
('cagón'), ('cagon'),
('cagada'),
('pechoño'), ('pechono'),
('flaite'),
('choro de mierda'),
('pico'), ('pico pal'),
('chupa'), ('chupalo'), ('chúpalo'),
('ándate a la chucha'), ('andate ala chucha'),
('la chucha de tu madre'), ('chuchatu madre'), ('chuchatumare'),
('hueón'), ('hue0n'),

-- === INSULTOS Y DISCRIMINACIÓN ===
('retrasado'), ('mongólico'), ('mongoloide'),
('subnormal'), ('inútil'),
('maricón'), ('travesti'),
('gordo de mierda'), ('gordo inútil'),

-- === RACISMO ===
('nigger'), ('nigga'), ('n-word'),
('negro de mierda'),
('indio culiao'),

-- === AMENAZAS ===
('te voy a matar'), ('te mato'), ('voy a matarte'),
('te voy a cagar'), ('te cago'),
('te voy a romper'), ('te rompo la cara'),

-- === INGLÉS ===
('fuck'), ('f*ck'), ('fck'), ('fuk'),
('shit'), ('sh1t'),
('bitch'), ('b1tch'),
('asshole'), ('ass hole'),
('bastard'),
('cunt'),
('dick'),
('pussy'),
('faggot'), ('fag'),
('motherfucker'), ('mf');
