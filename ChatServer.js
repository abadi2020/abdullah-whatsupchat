const socketIO = require("socket.io");

const express = require("express");
const app = express();
const http = require("http");
const port = 5000;
const server = express()
  .use(app)
  .listen(port, () => console.log(`Listening Socket on ${ port }`));
let io = socketIO(server);
const usrRtns = require("./userRoutines");

const adminColor = "#000000";

// Enable reverse proxy support in Express. This causes the
// the "X-Forwarded-Proto" header field to be trusted so its
// value can be used to determine the protocol. See
// http://expressjs.com/api#app-settings for more details.
app.enable("trust proxy");
// Add a handler to inspect the req.secure flag (see
// http://expressjs.com/api#req.secure). This allows us
// to know whether the request was via http or https.
app.use(function(req, res, next) {
  if (req.secure) {
    // request was via https, so do no special handling
    next();
  } else {
    // request was via http, so redirect to https
    res.redirect("https://" + req.headers.host + req.url);
  }
});
app.use(express.static("public"));

function findRooms() {
  var availableRooms = [];

  var rooms = io.sockets.adapter.rooms;
  if (rooms) {
    for (var room in io.sockets.adapter.rooms) {
      if (!rooms[room].hasOwnProperty(room) && room.length != 20) {
        var clientNumber = io.sockets.adapter.rooms[room].length;
        availableRooms.push({ room: room, count: clientNumber });
      }
    }
  }
  return availableRooms;
}

io.on("connection", socket => {
  socket.on("getRooms", function() {
    socket.emit("rooms", findRooms());
  });

  socket.on("join", async clientData => {
    // client has sent join to server
    let user;
    let time = await usrRtns.getTime();
    let isUserUnique;
    socket.name = clientData.chatName;

    // use the room property to create a room

    // clientData has a user and a room, see if the user already exists

    // if the user does not exist join the room and

    isUserUnique = await usrRtns.isNameUnique(clientData.chatName);
    if (isUserUnique) {
      socket.join(clientData.roomName); // join room
      let users;

      const color = await usrRtns.getColor();
      user = {
        room: clientData.roomName,
        name: clientData.chatName,
        id: socket.id,
        color: color
      };
      try {
        await usrRtns.addUser(user);
        users = await usrRtns.getAll();
      } catch (err) {
        console.log(`Error has occured in join: ${err.stack}`);
      }

      //send a welcome message to just the new arrival
      // msg should be a JSON object consisting of numerous properties e.g.:
      // from, room, text,id, colour, time

      let msg = {
        from: "Admin",
        room: user.room,
        text: `welcome ${clientData.chatName}`,
        id: user.id,
        colour: adminColor,
        time: time
      };

      socket.emit("welcome", msg);

      msg.text = `${clientData.chatName} has joind the ${
        clientData.roomName
      } room.`;
      // to everyone in the same room except client who joined
      socket.to(clientData.roomName).emit("someonejoined", msg);

      if (users) {
        io.to(user.room).emit("UsersAvailable", users);
      }
      // msg contains similar properties as before
    }

    // else the username has already been taken
    else {
      // msg should be a JSON object consisting of numerous properties e.g.:
      // from, room, text,id, colour, time

      const msg = {
        from: "Admin",
        room: "",
        text: `name already taken, try a different name`,
        id: "",
        colour: adminColor,
        time: ""
      };

      socket.emit("nameexists", msg);
    }
  });

  socket.on("disconnect", async () => {
    let user;
    let users;
    let time = await usrRtns.getTime();
    try {
      user = await usrRtns.getUser(socket.id);
      users = await usrRtns.getAll();
      if (user) {
        await usrRtns.removeUser(user.id);
        let msg = {
          from: "Admin",
          room: user.room,
          text: `${user.name} has left the ${user.room} room.`,
          id: user.id,
          colour: adminColor,
          time: time
        };

        if (users) {
          socket.to(user.room).emit("UsersAvailable", users);
        }

        socket.to(user.room).emit("someoneleft", msg);
      }
    } catch (err) {
      console.log(`Error has occured in disconnect: ${err.stack}`);
    }
  });

  socket.on("typing", async clientData => {
    let user;
    let time = await usrRtns.getTime();
    try {
      user = await usrRtns.getUser(socket.id);
      if (user) {
        let msg = {
          from: clientData.from,
          room: user.room,
          text: `${user.name} is typying...`,
          id: user.id,
          colour: adminColor,
          time: time
        };
        socket.to(user.room).emit("someoneistyping", msg);
      }
    } catch (err) {
      console.log(`Error has occured in typing: ${err}`);
    }
  });

  socket.on("message", async clientData => {
    let user;
    let time = await usrRtns.getTime();
    try {
      user = await usrRtns.getUser(socket.id);
      if (user) {
        let msg = {
          from: clientData.from,
          room: user.room,
          text: clientData.text,
          id: user.id,
          colour: user.color,
          time: time
        };
        io.in(user.room).emit("newmessage", msg);
      }
    } catch (err) {
      console.log(`Error has occured in message: ${err}`);
    }
  });
});

let getNumberOfUsersInRoom = room => io.nsps["/"].adapter.rooms[room].length;
server.listen(process.env.PORT || port, () =>
  console.log(`starting on port ${port}`)
);
