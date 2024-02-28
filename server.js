const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");

const app = express();
const server = http.createServer(app);
// Socket.io
const io = new Server(server, {
  cors: {
    origin: ["https://catdemo.onrender.com","http://localhost:8080", "https://admin.socket.io"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
// For UI ADMIN
instrument(io, {
  auth: false,
});

// Instrument Socket.IO
// const instrumenter = instrument(server, {
//   auth: {
//       type: "basic",
//       username: "admin",
//       password: "admin@123"
//   }
// });


io.on("connection", (socket) => {
  console.log(`A user connected ${socket.id}`);
  //Send Message
  socket.on("send-message", (message, room) => {
    if (room === "") {
      socket.broadcast.emit("receive-message", message);
    } else {
      socket.to(room).emit("receive-message", message);
    }
  });
  //cd is a call Back Function
  socket.on("join-room", (room, cb) => {
    socket.join(room);
    cb(`Room Joined ${room}`);
  });
  //Demo of Socket
  socket.on("ping", (n) => {
    console.log(n);
  });
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected ${socket.id}`);
  });
});

//different name Spaces
function getUsernameFromToken(to) {
  return to;
}
const userIo = io.of("/user");

userIo.on("connection", (socket) => {
  //console.log("conected to use Name Space " + socket.username);
});

userIo.use((socket, next) => {
  if (socket.handshake.auth.token) {
    socket.username = getUsernameFromToken(socket.handshake.auth.token);
    next();
  } else {
    next(new Error("pls Send Token"));
  }
});
//Port and Server
const PORT = process.env.PORT || 3011;

// Add a route for "/hello"
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

server.listen(PORT, () => {
  console.log(`Server is Running on Post ${PORT}`);
});
