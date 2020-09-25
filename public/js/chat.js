const socket = io();

// Elements
const $msgForm = document.querySelector('#msg-form');
const $msgFormTextArea = document.getElementById('bodyMsg');
const $msgFormBtn = $msgForm.querySelector('button');
const $sendLocationBtn = document.querySelector('#sendLocation');
const $messages = document.querySelector('#msgs');

// Templates
const $msgTemplate = document.querySelector('#msg-tmpl').innerHTML;
const $locMsgTemplate = document.querySelector('#loc-msg-tmpl').innerHTML;

socket.on('message', (message) => {
  console.log(message);
  const html = Mustache.render($msgTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (locURL) => {
  console.log(locURL);
  const html = Mustache.render($locMsgTemplate, {
    locURL: locURL.url,
    createdAt: moment(locURL.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
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