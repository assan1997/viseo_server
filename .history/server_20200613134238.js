const https = require('https');
mongoose = require('mongoose');
const message = require('./controller/user_message');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const fs = require('fs');
/* 
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  ca: fs.readFileSync('certificate.crt'),
}; */
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
const server = https.createServer(/* options, */ app);
const io = require('socket.io')(server, {
  transports: ['websocket', 'polling'],
});
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
    let client = { ...data.client, oncall: false };
    roomCleaner(client.room);
    socket.join(client.room);
    if (data.contacts.length !== 0) {
      data.contacts.forEach((c) => {
        let contact = clients.find((i) => i.userId === c._id);
        if (contact !== undefined)
          io.to(contact.room).emit('userOnline', data.client.userId);
      });
    }
    if (clients.length !== 0) {
      clients.forEach((item, index, array) => {
        if (item.userId === client.userId) {
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
  // ON SUPPRIME LA SALLE D'APPEL DE L'UTILISATEUR QUAND IL SE DECONNECTE
  socket.on('session-out', function (data) {
    let c = clients.findIndex((c) => c.username === data.user);
    clients.splice(c, 1);
    roomCleaner(data.room);
  });
  // APPEL
  socket.on('call', function (data) {
    let callData = data;
    let peer = clients.find((c) => c.userId === data.peer);
    let init = clients.find((c) => c.userId === data.init);
    console.log(data.peer);
    if (peer === undefined) {
      feedBack();
      socket.emit(
        'call-event',
        feedBack('failed', `Echec de la connexion : utilisateur hors ligne`)
      );
    } else {
      if (peer.oncall) {
        socket.emit(
          'call-event',
          feedBack('failed', `${peer.user}à un autre autre appel`)
        );
      } else {
        socket.emit('call-event', feedBack('success', 'Appel en cours'));
        callData.user = init.username;
        io.to(peer.room).emit('call-signal', callData);
      }
    }
  });
  // TRANSMISSION REUSSIE
  socket.on('ok', function (data) {
    let init = clients.find((c) => c.userId === data.init);
    let peer = clients.find((c) => c.userId === data.peer);
    OnCallStatus(true, init, peer);
    io.to(init.room).emit('AcceptCall', data.signal);
  });
  // TERMINER UN APPEL
  socket.on('end', function (data) {
    let init = clients.find((c) => c.userId === data.init);
    let peer = clients.find((c) => c.userId === data.peer);
    OnCallStatus(false, init, peer);
    io.to(init.room).emit('initEnd', feedBack('failed', 'Appel terminé'));
    if (peer !== undefined)
      io.to(peer.room).emit('peerEnd', feedBack('failed', 'Appel terminé'));
  });
  // REFUSER UN APPEL
  socket.on('denied', function (data) {
    let init = clients.find((c) => c.userId === data.init);
    let peer = clients.find((c) => c.userId === data.peer);
    io.to(init.room).emit('initEnd', feedBack('failed', 'Appel terminé'));
    io.to(peer.room).emit('peerEnd', feedBack('failed', 'Appel terminé'));
  });
  socket.on('reload', function (data) {
    let init = clients.find((c) => c.username === data.user);
    OnCallStatus(false, init, null);
  });

  // TEXT MESSAGE EVENTS
  // **ENVOI DE MESSAGE TEXTE ** //

  socket.on('sendMessage', async function (data) {
    let init = clients.find((c) => c.userId === data.header.emitter);
    let peer = clients.find((c) => c.userId === data.header.receiver);
    let res = await message.addMessage(data);
    io.to(init.room).emit('updateMessages', res.emitter);
    if (peer !== undefined)
      io.to(peer.room).emit('updateMessages', res.receiver);
  });
});

// FONCTIONS

/**
 * CETTE FONCTION GERE LES MESSAGES LIES AU EVEMENTS D'APPEL
 * @param {} status le statut du message
 * @param {} msg le message
 */
function feedBack(status, msg) {
  let feedBack = {};
  feedBack.status = status;
  feedBack.msg = msg;
  return feedBack;
}

/**
 * CETTE FONCTION PREND TROIS PARAMETTRE ET GERE LA METHODE ONCALL D'UN UTILISATEUR
 * LA METHODE ON PERMET DE SAVOIR SI UN UTILISATEUR A UN APPEL EN COUR
 * @param {} status Le Statut true OU false
 * @param {} init Un Utilisateur
 * @param {} peer Un Utilisateur
 */
function OnCallStatus(status, init, peer) {
  if (init !== null || init !== undefined) {
    let iniIndex = clients.findIndex((i) => i.userId === init.userId);
    init.oncall = status;
    clients.splice(clients.indexOf(iniIndex), init);
  }
  if (peer !== null && peer !== undefined) {
    let peerIndex = clients.find((c) => c.userId === peer.userId);
    peer.oncall = status;
    clients.splice(clients.indexOf(peerIndex), peer);
  }
}
function roomCleaner(room) {
  io.of('/')
    .in(room)
    .clients((error, socketIds) => {
      if (error) throw error;
      socketIds.forEach((socketId) => io.sockets.sockets[socketId].leave(room));
    });
}
server.listen(port, (err) => {
  console.log('started');
  mongoose.connect('mongodb://localhost/viseo', {
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
