const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

// 服务器类对象
let app = express();
let server = http.Server(app);
let io = socketIO(server);

// 全局变量
let users = [];


// 启动服务器
server.listen(3000, () => {
    console.log('【启动服务器成功】：http://localhost:3000/');
});


// 绑定静态目录
app.use(express.static('./public/'));


// 监听用户连接事件
io.on('connection', (socket) => {
    console.log('新用户连接了。');

    // 监听用户登录服务器
    socket.on('login', data => {
        // 判断，用户是否再users中存在，如果已经登录了，不允许再登录。
        // 如果data在users中不存在，说明该用户没有登录，允许用户登录。
        // 跳转到相关页面
        let user = users.find(item => item.username === data.username);

        // 标识用户存在
        if (user) {
            socket.emit('loginError', {
                msg: '登录失败，用户已经登录！'
            });
            console.log(`用户${data.username}登录失败！`);
        } else {
            users.push(data);
            socket.emit('loginSuccess', data);
            console.log(`用户${data.username}登录成功！`);

            // 将用户信息绑定到套接字上
            socket.username = data.username;
            socket.avatar = data.avatar;

            // 广播消息 有新用户加入聊天室
            io.emit('addUser', data);

            // 广播消息 向所有客户端发送新的用户列表
            io.emit('userList', users);

        }

    })

    // 监听用户断开连接
    socket.on('disconnect', () => {
        console.log(`用户${socket.username}断开了连接。`);

        var idx = users.findIndex(item => item.username === socket.username);
        users.splice(idx, 1);

        // 广播消息 通知所有的客户端有用户退出
        io.emit('delUser', {
            "username": socket.username,
            "avatar": socket.avatar
        });

        // 广播消息 向所有客户端发送新的用户列表
        io.emit('userList', users);

    });

    // 监听用户发送消息
    socket.on('sendMessage', data => {
        // 广播给所有用户新消息
        io.emit('receiveMessage', data);
    });

});