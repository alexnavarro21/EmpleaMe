const multer = require('multer');
const path = require('path');

// Configuramos dónde y cómo se guardan los archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Asegúrate de crear la carpeta "uploads" en la raíz
  },
  filename: function (req, file, cb) {
    // Le ponemos la fecha al nombre para que no se sobreescriban archivos con el mismo nombre
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports = upload;