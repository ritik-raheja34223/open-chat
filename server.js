const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const { uniqueNamesGenerator, adjectives, animals } = require('unique-names-generator');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

const users = {};

io.on('connection', (socket) => {
    const username = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: ' ',
        style: 'capital'
    });

    users[socket.id] = username;

    // Notify the user of their own name
    socket.emit('welcome', { username: username, activeUsers: Object.values(users).length });

    // Notify others
    socket.broadcast.emit('user_joined', { username: username, activeUsers: Object.values(users).length });

    // Update active user count for everyone
    io.emit('active_users', { count: Object.values(users).length });

    // Send automatic sale notification
    setTimeout(() => {
        socket.emit('message', {
            username: 'OpenChat Bot',
            text: '🔥 FLASH SALE! Get 50% off on our premium subscription. <a href="https://example.com/sale" target="_blank" style="color: #ff5252; text-decoration: underline;">Claim Offer</a>',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    }, 1500);

    console.log(`User connected: ${username} (${socket.id})`);

    socket.on('message', (msg) => {
        if (!msg || typeof msg !== 'string' || msg.trim().length === 0) return;

        io.emit('message', {
            username: users[socket.id],
            text: msg.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    socket.on('disconnect', () => {
        const username = users[socket.id];
        delete users[socket.id];

        if (username) {
            socket.broadcast.emit('user_left', { username: username });
            io.emit('active_users', { count: Object.values(users).length });
            console.log(`User disconnected: ${username}`);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
