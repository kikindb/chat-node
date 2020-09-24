const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { info } = require('console');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

const message = 'Welcome!';

io.on('connection', (socket) => {
  console.log('New WebSocket Connection');

  socket.emit('message', message);
  socket.broadcast.emit('message', 'A new user has joined!');

  socket.on('sendMsg', (body) => {
    console.log("Body: ", body);
    io.emit('message', body);
  });

  socket.on('sendLocation', (coords) => {
    io.emit('message', `https:///google.com/maps?q=${coords.lat},${coords.lon}`);
  });

  socket.on('disconnect', () => {
    io.emit('message', 'A user has left');
  });
});

server.listen(port, () => console.log(`Listening on ${port}...`));