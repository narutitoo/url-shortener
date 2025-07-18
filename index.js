const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Ruta pública
app.use('/public', express.static(`${__dirname}/public`));

// Ruta raíz (formulario)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Aquí irán tus rutas /api/shorturl...

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});