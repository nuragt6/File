const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public"))); // Serve frontend files

let users = {}; // Store connected users

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Store user name
    socket.on("new-user", (username) => {
        users[socket.id] = username;
        io.emit("user-list", users);
    });

    // Handle chat message
    socket.on("chat-message", (data) => {
        io.emit("receive-message", {
            message: data.message,
            sender: users[socket.id],
            isSelf: false, // Used for styling
        });
    });

    // Handle file sharing
    socket.on("send-file", (data) => {
        io.emit("receive-file", {
            fileName: data.fileName,
            fileUrl: data.fileUrl,
            sender: users[socket.id],
            isSelf: false,
        });
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("user-list", users);
        console.log("A user disconnected:", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});