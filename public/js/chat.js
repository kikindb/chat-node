const socket = io();

socket.on('message', (message) => {
  console.log(message);
});

document.querySelector('#message-form').addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('Sending Msg...');
  const bodyMsg = e.target.elements.bodyMsg.value;
  socket.emit('sendMsg', bodyMsg);
});

document.querySelector('#sendLocation').addEventListener('click', () => {
  if (!navigator.geolocation)
    return alert('Geolocation is not supported by your Browser');

  navigator.geolocation.getCurrentPosition((position) => {
    console.log('Sending Location...');

    socket.emit('sendLocation', {
      lat: position.coords.latitude,
      lon: position.coords.longitude
    });
  });
});