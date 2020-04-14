const http = require('http');
mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
};
const server = http.createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 4000;
const route = require('./routes/index');
app.use(cors(corsOptions));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
route(app);
// SOCKET CALL EVENTS
let clients = [];
io.on('connection', function (socket) {
  socket.on('disconnect', function () {});
  let t = [];
  let client = {};
  // SALLE D'APPEL
  socket.on('session', function (data) {
    client.username = data.username;
    client.id = socket.id;
    if (clients.length !== 0) {
      clients.forEach((item, index, array) => {
        if (item.username === client.username && client.id !== item.id) {
          clients.splice(clients.indexOf(index), client);
        } else {
          t.push('different');
        }
      });
    } else {
      clients.push(client);
    }
    if (t.length === clients.length) clients.push(client);
  });
  // deconnect l'utilisateur si il quitte la page
  // deconnecte l'utilisateur par le boutton de decconnexion
  socket.on('session-out', function (data) {
    let c = clients.findIndex((c) => c.username === data);
    clients.splice(c, 1);
  });
  socket.on('call', function (data) {
    let peer = clients.find((c) => c.username === data.peer);
    let feedback = {};
    if (peer === undefined) {
      feedback.msg = `Ofline`;
      feedback.status = 'failed';
      socket.emit('call-event', feedback);
    } else {
      feedback.msg = 'connexion';
      feedback.status = 'success';
      io.to(peer.id).emit('call-signal', data);
    }
  });
  socket.on('ok', function (data) {
    let init = clients.find((c) => c.username === data.init);
    io.to(init.id).emit('AcceptCall', data.signal);
  });
  socket.on('end', function (data) {
    let init = clients.find((c) => c.username === data.peer);
    let peer = clients.find((c) => c.username === data.init);

    io.to(init.id).emit('initEnd');
    io.to(peer.id).emit('peerEnd');
  });
});
server.listen(port, (err) => {
  console.log('started');
  mongoose.connect('mongodb://localhost/webrtc', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoose.connection
    .once('open', () => console.log('connexion à la base de donnée établie'))
    .on('error', (error) => {
      console.warn('Warning', error);
    });
  if (err) {
    console.log(err);
  }
});
