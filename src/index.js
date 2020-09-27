const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { info } = require('console');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { getUser, getUsersInRoom, addUser, removeUser } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

const adminUsername = "Chatbot";

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
  console.log('New WebSocket Connection');

  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) return callback(error);

    socket.join(user.room);
    socket.emit('message', generateMessage(adminUsername, 'Welcome!'));
    socket.broadcast.to(room).emit('message', generateMessage(adminUsername, `${user.username} has joined!`));

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });


  socket.on('sendMsg', (body, callback) => {
    const user = getUser(socket.id);

    if (!user) return callback('No existing user');

    const filter = new Filter();
    if (filter.isProfane(body))
      return callback('Profanity is not allowed');

    io.to(user.room).emit('message', generateMessage(user.username, body));
    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);
    if (!user) return callback('No existing user');
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https:///google.com/maps?q=${coords.lat},${coords.lon}`));
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage(adminUsername, `${user.username} has left`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => console.log(`Listening on ${port}...`));