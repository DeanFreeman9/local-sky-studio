const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Local Sky Studio: http://localhost:${PORT}`);
});
