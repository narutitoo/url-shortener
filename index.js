 const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Base de datos en memoria
const urlDatabase = {};
let idCounter = 1;

// Servir formulario y archivos estáticos
app.use('/public', express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// POST /api/shorturl
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validar que comience con http:// o https:// y sea URL válida
  if (!/^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/i.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Extraer hostname para dns.lookup
  let hostname;
  try {
    hostname = new URL(originalUrl).hostname;
  } catch {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Revisar si la URL ya está guardada
    const existingEntry = Object.entries(urlDatabase).find(
      ([key, value]) => value === originalUrl
    );
    if (existingEntry) {
      return res.json({ original_url: originalUrl, short_url: Number(existingEntry[0]) });
    }

    // Guardar nueva URL
    const shortUrlId = idCounter++;
    urlDatabase[shortUrlId] = originalUrl;

    res.json({ original_url: originalUrl, short_url: shortUrlId });
  });
});

// GET /api/shorturl/:id
app.get('/api/shorturl/:id', (req, res) => {
  const id = req.params.id;
  const originalUrl = urlDatabase[id];
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
