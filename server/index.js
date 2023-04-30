const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');


app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    }
})


const CHAT_BOT = 'ChatBot';
let chatRoom = '';
const allUsers = []

io.on('connection', socket => {
    console.log('Usuario conectado ', socket.id);
    socket.on('join_room', data => {
        const { username, room } = data;
        socket.join(room);

        const createdTime = Date.now();
        socket.to(room).emit('receive_message', {
            message: `${username} entrou na sala!`,
            username: CHAT_BOT,
            createdTime
        })

        socket.emit('receive_message', {
            message: `${username} seja bem vindo`,
            username: CHAT_BOT,
            createdTime
        })
    
        chatRoom = room;
        allUsers.push({id: socket.id, username, room})
        const chatRoomUsers = allUsers.filter(user => user.room === room);
        socket.to(room).emit('chatroom_users', chatRoomUsers);
        socket.emit('chatroom_users', chatRoomUsers);
    })

    socket.on('send_message', data => {
        const { username, room, message, createdTime } = data;
        console.log(data)
        io.in(room).emit('receive_message', data);
    })
})

server.listen(4000, ()=> 'Server is running on port 4000')