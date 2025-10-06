const express = require('express');
const proxyRouter = require('./api/proxy');

const app = express();
app.use(express.json());
app.use('/api/proxy', proxyRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
