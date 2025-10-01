/*
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// app.get("/GSM/getdatetime", (req, res) => {   
//   const currentDate = new Date();
//   res.json({ datetime: currentDate.toISOString() });
// });

// app.get("/GSM/getpublickey", (req, res) => {
//   const public = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzV7b4t3mFv6+X9y5jv1b\nqZl5H3F5Zl5H3F5Zl5H3F5Zl5H3F5Zl5H3F5Zl5H3F5Zl5H3F5Zl5H3F5Zl5H3F5Z\nl5H3F5Zl5H3F5Zl5H3F5Zl5H3F5Zl5H3F5Zl5H3F5Zl5H3F5Zl5H3F5Zl5H3F5Zl\n-----END PUBLIC KEY-----";
//   res.json({ publicKey: public });
// });

// app.get("/api/getdatetime", (req, res) => {
//   const currentDate = new Date();
//   res.json({ datetime: currentDate.toISOString() });
// });

// app.post("/GSM/injectdata", (req, res) => {
//   const data = req.body;
//   console.log("Données reçues :", data);
//   res.json({ message: "Données reçues avec succès", receivedData: data });
// });

// app.post("/api/testPOST", (req, res) => {
//   const data = req.body;
//   console.log("Données reçues :", data);
//   res.json({ message: "Données reçues avec succès", receivedData: data });
// });



// app.listen(port, () => {
//   console.log(`Serveur lancé sur le port ${port}`);
// }); 




// Middleware qui intercepte toutes les requêtes
    app.use((req, res) => {
      res.send(`
        <html>
          <head>
            <title>Requête reçue</title>
            <meta http-equiv="refresh" content="2">
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              p { margin: 5px 0; }
              .label { font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Requête reçue</h1>
            <p><span class="label">Méthode :</span> ${req.method}</p>
            <p><span class="label">URL :</span> ${req.originalUrl}</p>
            <p><span class="label">Corps :</span> ${JSON.stringify(req.body)}</p>
            <p><em>Cette page se met à jour toutes les 2 secondes.</em></p>
          </body>
        </html>
      `);


      res.json({
        message: 'Requête reçue',
        methode: req.method,
        url: req.originalUrl,
        corps: req.body
      });
    });

    app.listen(port, () => {
      console.log(`Serveur lancé sur le port ${port}`);
    });
*/

const express = require('express');
const app = express();
const port = 80;

let clients = [];

app.use(express.json());

// Route SSE pour le client web
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

// Page HTML affichée dans le navigateur
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Suivi des requêtes REST</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        .entry { margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
      </style>
    </head>
    <body>
      <h1>Requêtes REST reçues</h1>
      <div id="log"></div>

      <script>
        const log = document.getElementById('log');
        const eventSource = new EventSource('/events');

        eventSource.onmessage = function(event) {
          const data = JSON.parse(event.data);
          const entry = document.createElement('div');
          entry.className = 'entry';
          entry.innerHTML = \`
            <strong>Méthode :</strong> \${data.method}<br>
            <strong>URL :</strong> \${data.url}<br>
            <strong>Corps :</strong> \${JSON.stringify(data.body)}
          \`;
          log.prepend(entry);
        };
      </script>
    </body>
    </html>
  `);
});

// Middleware qui intercepte toutes les requêtes REST
app.use((req, res, next) => {
  const data = {
    method: req.method,
    url: req.originalUrl,
    body: req.body
  };

  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
  const infos = `pk_pas`
  const reponse = `CONNECT\r\nOK\r\n${infos}\r\nOK\r\nKHTTP_IND: 1,3\r\n`;
  
  res.send(reponse);
});

app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});