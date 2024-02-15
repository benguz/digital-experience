const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');


const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('cursorMove', (data) => {
        data.id = socket.id; // Assign the socket ID
        socket.broadcast.emit('cursorMove', data);
    });

    socket.on('changeColor', (color) => {
        io.emit('colorChanged', color);
    });
    socket.on('disconnect', () => {
        console.log('A user disconnected: ' + socket.id);
        socket.broadcast.emit('removeCursor', { id: socket.id });
    });
});



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
