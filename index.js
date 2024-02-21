const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');


const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIo(server);
let userCount = 0;

app.use(express.static('public'));

io.on('connection', (socket) => {
    userCount++;
    console.log(`A user connected - ${userCount} users`);
        // Extract the room name from the URL
    const roomName = socket.handshake.headers.referer.split('/').pop();

    // Join the room
    socket.join(roomName);

    console.log(roomName)
    // let userType = userCount % 2 === 0 ? 'fire' : 'water';
    // let userColor = userCount % 2 === 0 ? '#ed5555' : '#2804AA';
    // let id = socket.id;
    // socket.emit('userDetails', { userType, userColor,  id});

    // socket.on('cursorMove', (data) => {
    //     data.id = socket.id; // Assign the socket ID
    //     data.type = userColor;
    //     socket.broadcast.emit('cursorMove', data);
    // });

    socket.on('blobMoved', (position) => {
        // Broadcast the new position to all other clients except the sender
        socket.broadcast.to(roomName).emit('blobMoved', { socketId: socket.id, position: position });
    });

    socket.on('shoot', (projectileData) => {
        socket.broadcast.to(roomName).emit('projectileShot', projectileData);
    });

    socket.on('projectileCollision', (collisionData) => {
        socket.broadcast.to(roomName).emit('youAreHit', collisionData);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected: ' + socket.id);
        socket.broadcast.to(roomName).emit('removeCursor', { id: socket.id });
        socket.broadcast.to(roomName).emit('blobRemoved', socket.id);

        userCount--;
    });
});



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/blob/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/blob.html'));
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
