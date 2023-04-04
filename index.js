const app = require('http').createServer(handler);
const io = require("socket.io")(app, {
  cors: {
    origin: "http://localhost:9000",
    methods: ["GET", "POST"],
    // allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

const PORT = 8080;
let users = [];

app.listen(PORT);

function handler(req, res) {
  res.writeHead(200);
  res.end('Socket.io running!');
}

io.on('connection', socket => {
  let activeUser = {};

  socket.emit('users update', users);

  socket.on('message', msg => {
    console.info(`New message: ${msg}`);

    io.emit('message', msg);
  });

  socket.on('login', user => {
    console.info(`User login: ${user.username}`);

    users = users.concat(user);
    activeUser = user;

    io.emit('login', user);
    io.emit('users update', users);
  });

  socket.on('logout', user => {
    console.info(`User logout: ${user.username}`);

    users = users.filter(listUser => listUser.username !== user.username);
    activeUser = {};

    io.emit('logout', user);
    io.emit('users update', users);
  });

  socket.on('disconnect', () => {
    if (activeUser && activeUser.username) {
      console.info(`User disconnected: ${activeUser.username}`);
      users = users.filter(
        listUser => listUser.username !== activeUser.username
      );

      io.emit('logout', activeUser);
      io.emit('users update', users);
    }
  });
});

console.info(`Socket.io started in port ${PORT}`);