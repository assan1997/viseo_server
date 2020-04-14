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
app.use('/ressources', express.static(__dirname + '/ImageProfil'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
route(app);
// SOCKET CALL EVENTS
let clients = [];
io.on('connection', function (socket) {
  let t = [];
  // SALLE D'APPEL
  socket.on('session', function (data) {
    let client = data.client;
    client.oncall = false;
    socket.join(client.room);
    if (clients.length !== 0) {
      clients.forEach((item, index, array) => {
        if (item.username === client.username) {
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
  // lorsque l'utilisateur se deconnecte on supprime sa salle d'appel
  socket.on('session-out', function (data) {
    let c = clients.findIndex((c) => c.username === data.user);
    clients.splice(c, 1);
    io.of('/')
      .in(data.room)
      .clients((error, socketIds) => {
        if (error) throw error;
        socketIds.forEach((socketId) =>
          io.sockets.sockets[socketId].leave(data.room)
        );
      });
  });
  socket.on('call', function (data) {
    let peer = clients.find((c) => c.username === data.peer);

    if (peer === undefined) {
      feedback.msg = `Imposible de joindre ${data.peer} `;
      feedback.status = 'failed';
      socket.emit('call-event', feedback);
    } else {
      feedback.msg = 'Appel en cours';
      feedback.status = 'success';
      if (peer.oncall) {
        feedback.msg = `${data.peer} à un autre autre appel`;
        feedback.status = 'failed';
        socket.emit('call-event', feedback);
      } else {
        socket.emit('call-event', feedback);
        io.to(peer.room).emit('call-signal', data);
      }
    }
  });
  // code fonctionnel
  socket.on('ok', function (data) {
    let init = clients.find((c) => c.username === data.init);
    let peer = clients.find((c) => c.username === data.peer);
    OnCallStatus(true, init, peer);
    io.to(init.room).emit('AcceptCall', data.signal);
  });
  // code fonctionnel
  socket.on('end', function (data) {
    let init = clients.find((c) => c.username === data.init);
    let peer = clients.find((c) => c.username === data.peer);
    OnCallStatus(false, init, peer);
    io.to(init.room).emit('initEnd', feedback('failed', 'Appel terminé'));
    io.to(peer.room).emit('peerEnd', feedback('failed', 'Appel terminé'));
  });
  socket.on('denied', function (data) {
    let init = clients.find((c) => c.username === data.init);
    let peer = clients.find((c) => c.username === data.peer);
    io.to(init.room).emit('initEnd', feedBack('failed', 'Appel terminé'));
    io.to(peer.room).emit('peerEnd', feedBack('failed', 'Appel terminé'));
  });
  socket.on('reload', function (data) {
    let init = clients.find((c) => c.username === data.user);
    OnCallStatus(false, init, null);
  });
});

function feedBack(status, msg) {
  let feedBack = {};
  feedBack.status = status;
  feedBack.msg = msg;
  return feedBack;
}
function OnCallStatus(status, init, peer) {
  if (init !== null) {
    let iniIndex = clients.findIndex((i) => i.username === init.username);
    init.oncall = status;
    clients.splice(clients.indexOf(iniIndex), init);
  }
  if (peer !== null) {
    let peerIndex = clients.find((c) => c.username === peer.username);
    peer.oncall = status;
    clients.splice(clients.indexOf(peerIndex), peer);
  }
}
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
