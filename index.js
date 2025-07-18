const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlParser = require('url'); // para parsear la URL y obtener hostname
const app = express();

// Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Base de datos en memoria (temporal)
const urlDatabase = {};
let idCounter = 1;

// Ruta pública para archivos estáticos (si los tenés)
app.use('/public', express.static(`${__dirname}/public`));

// Ruta raíz: formulario
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// POST /api/shorturl
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validar formato básico de la URL (debe comenzar con http:// o https://)
  if (!/^https?:\/\//i.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Extraer hostname para verificar con dns.lookup
  let hostname;
  try {
    hostname = new URL(originalUrl).hostname;
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      // Revisar si la URL ya está guardada
      const existingEntry = Object.entries(urlDatabase).find(
        ([key, value]) => value === originalUrl
      );

      if (existingEntry) {
        // Si ya existe, devolver el short_url existente
        return res.json({ original_url: originalUrl, short_url: Number(existingEntry[0]) });
      }

      // Si no existe, agregar al "db"
      const shortUrlId = idCounter++;
      urlDatabase[shortUrlId] = originalUrl;

      return res.json({ original_url: originalUrl, short_url: shortUrlId });
    }
  });
});

// GET /api/shorturl/:id → redirigir a la URL original
app.get('/api/shorturl/:id', (req, res) => {
  const id = req.params.id;

  const originalUrl = urlDatabase[id];

  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.json({ error: 'No short URL found for the given input' });
  }
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
