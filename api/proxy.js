const express = require('express');
const { Agent } = require('undici'); // 👈 importa Agent de undici
const router = express.Router();

// --- Agente personalizado con más tiempo de conexión ---
const agent = new Agent({
  connect: {
    timeout: 30000 // ⏱️ 30 segundos para conectar
  }
});

router.options('/', (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res.status(200).end();
});

router.post('/', async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { url, username, password, params } = req.body;

  // Timeout total opcional (para abortar incluso si conecta)
  const TIMEOUT_MS = 60000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params),
      signal: controller.signal,
      dispatcher: agent, // 👈 usa el agente con timeout extendido
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error al obtener el PDF' });
    }

    const pdfBuffer = await response.arrayBuffer();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="archivo.pdf"');
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('Error en proxy:', error);

    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Timeout de conexión con el servidor remoto' });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    clearTimeout(timeout);
  }
});

module.exports = router;

