const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(__dirname)); // serve i file statici (html, js, img)
app.use(express.json());

// Endpoint per salvare i dati
app.post('/salva', (req, res) => {
  const { nome, euro } = req.body;
  const riga = `\n${nome};${euro}`;
  
  fs.appendFileSync(path.join(__dirname, 'dati.txt'), riga);
  res.send('Dati salvati con successo');
});

// Endpoint per servire dati.txt
app.get('/dati.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'dati.txt'));
});

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});