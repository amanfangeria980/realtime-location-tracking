const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const http = require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
const PORT = process.env.PORT || 5000;

io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("send-location", (data) => {
        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", () => {
        io.emit("user-disconnected", socket.id);
    });
});

app.get("/", (req, res) => {
    res.render("index");
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
