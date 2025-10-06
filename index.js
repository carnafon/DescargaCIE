const express = require('express');
const app = express();
const proxy = require('./api/proxy');

app.use(express.json());
app.use('/api/proxy', proxy);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
