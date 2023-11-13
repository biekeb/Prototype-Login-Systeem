const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public")); // Maak een public folder voor je front-end assets

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const users = {};

io.on("connection", (socket) => {
  socket.on("setUsername", (username) => {
    if (!users[username]) {
      users[username] = socket.id;
      io.emit("updateUserList", Object.keys(users));
    } else {
      socket.emit("usernameError", "Username is already taken.");
    }
  });

  socket.on("sendMessage", (data) => {
    io.to(users[data.to]).emit("receiveMessage", {
      from: data.from,
      message: data.message,
    });
  });

  socket.on("disconnect", () => {
    const disconnectedUser = Object.keys(users).find(
      (key) => users[key] === socket.id
    );
    delete users[disconnectedUser];
    io.emit("updateUserList", Object.keys(users));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
