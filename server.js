const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = 3000;
const staticChannels = ["global_notifications", "global_chat"];

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

/* socket object may be used to send specific messages to the new connected client */
io.on("connection", function (socket) {
  console.log("user connected");

  socket.on("sendMessage", function (message) {
    console.log("msg", message);
    io.emit("sendMessageToAll", message);
  });
});
