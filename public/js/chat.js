const socket = io();

// Elements
const $msgForm = document.querySelector('#msg-form');
const $msgFormInput = document.getElementById('bodyMsg');
const $msgFormBtn = $msgForm.querySelector('button');
const $sendLocationBtn = document.querySelector('#sendLocation');
const $messages = document.querySelector('#msgs');
const $roomBar = document.querySelector('#room-bar');

// Templates
const $msgTemplate = document.querySelector('#msg-tmpl').innerHTML;
const $locMsgTemplate = document.querySelector('#loc-msg-tmpl').innerHTML;
const $usersListTemplate = document.querySelector('#users-list-tmpl').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

window.addEventListener('load', (e) => {
  $msgFormInput.focus();
});

const autoscroll = () => {
  const $lastMsg = $messages.lastElementChild;
  const lastMsgStyles = getComputedStyle($lastMsg);
  const lastMsgMargin = parseInt(lastMsgStyles.marginBottom);
  const lastMsgHeight = $lastMsg.offsetHeight + lastMsgMargin;

  const visibleHeight = $messages.offsetHeight;

  const containerHeight = $messages.scrollHeight;

  const scrolOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - lastMsgHeight <= scrolOffset)
    $messages.scrollTop = $messages.scrollHeight;
};

socket.on('message', (message) => {
  console.log(message);
  const html = Mustache.render($msgTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('locationMessage', (locURL) => {
  console.log(locURL);
  const html = Mustache.render($locMsgTemplate, {
    username: locURL.username,
    locURL: locURL.url,
    createdAt: moment(locURL.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render($usersListTemplate, {
    users,
    room
  });
  $roomBar.innerHTML = html;
});

$msgForm.addEventListener('submit', (e) => {
  e.preventDefault();

  $msgFormBtn.setAttribute('disabled', 'disabled');

  console.log('Sending Msg...');

  let bodyMsg = e.target.elements.bodyMsg.value;

  socket.emit('sendMsg', bodyMsg, (error) => {

    $msgFormInput.value = '';
    $msgFormInput.focus();
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

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});