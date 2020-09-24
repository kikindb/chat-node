const socket = io();

// Elements
const $msgForm = document.querySelector('#msg-form');
const $msgFormTextArea = document.getElementById('bodyMsg');
const $msgFormBtn = $msgForm.querySelector('button');

const $sendLocationBtn = document.querySelector('#sendLocation');



socket.on('message', (message) => {
  console.log(message);
});

$msgForm.addEventListener('submit', (e) => {
  e.preventDefault();

  $msgFormBtn.setAttribute('disabled', 'disabled');

  console.log('Sending Msg...');

  let bodyMsg = e.target.elements.bodyMsg.value;

  socket.emit('sendMsg', bodyMsg, (error) => {

    $msgFormTextArea.value = '';
    $msgFormTextArea.focus();
    $msgFormBtn.removeAttribute('disabled');

    if (error) return console.log(error);
    console.log("Message Delivered!");
  });
});

$sendLocationBtn.addEventListener('click', () => {
  if (!navigator.geolocation)
    return alert('Geolocation is not supported by your Browser');

  $sendLocationBtn.setAttribute('disabled', 'disabled');
  navigator.geolocation.getCurrentPosition((position) => {
    console.log('Sending Location...');
    socket.emit('sendLocation', {
      lat: position.coords.latitude,
      lon: position.coords.longitude
    }, () => {
      $sendLocationBtn.removeAttribute('disabled');
      console.log('Location shared!');
    });
  });
});