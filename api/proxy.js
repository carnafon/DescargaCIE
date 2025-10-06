const express = require('express');
const router = express.Router();

router.options('/', (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res.status(200).end();
});

router.post('/', async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { url, username, password, params } = req.body;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error al obtener el PDF' });
    }

    const pdfBuffer = await response.arrayBuffer();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="archivo.pdf"');
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('Error en proxy:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
