/** 
 * @description 聊天室主要逻辑功能
 */

// 1.连接socketio服务
var socket = io('http://localhost:3000');
var user = {};




// 2.登录功能
// 2.1 输入用户名
// 2.2 选择用户头像
// 2.3 触发登录事件
$(function () {
    // 选择头像
    $('#login_avatar li').on('click', function (e) {
        $(this).addClass('now').siblings().removeClass('now');
    })

    // 点击登录按钮
    $('#loginBtn').on('click', function (e) {
        var username = $('#txtUsername').val().trim();
        var avatar = $('#login_avatar li.now img').attr('src');

        // 用户名判空
        if (!username) {
            alert('请输入用户名！');
            return;
        }

        // 向服务器请求登录
        socket.emit('login', {
            "username": username,
            "avatar": avatar
        });
    });

    // 点击发送消息
    $('#sendMsg').on('click', function () {
        var msgContent = $('#msgContent').val().trim();
        $('#msgContent').val('');

        if (!msgContent) {
            return;
        }

        socket.emit('sendMessage', {
            "username": user.username,
            "avatar": user.avatar,
            "msg": msgContent
        });
    });



    // 监听用户登录失败的请求
    socket.on('loginError', data => {
        alert('登录失败，用户名已经存在！');
    });

    // 监听用户登录成功的请求
    socket.on('loginSuccess', data => {
        alert('登录成功！');

        // 需要隐藏登录窗口，显示聊天室窗口
        $('.user-info').fadeOut(1000);
        $('.container').fadeIn(1000);

        // 更改用户信息
        $('.user img').attr('src', data.avatar);
        $('.user .username').text(data.username);

        // 设置用户信息
        user = data;
    });

    // 监听其他用户登入事件
    socket.on('addUser', data => {
        $('.room-content').append(`
            <div class="msg-system">
                <p>${data.username}加入了聊天室</p>
            </div>
        `);
    });

    // 监听其他用户登出事件
    socket.on('delUser', data => {
        $('.room-content').append(`
        <div class="msg-system">
            <p>${data.username}离开了聊天室</p>
        </div>
    `);
    });

    // 监听用户列表下发事件
    socket.on('userList', data => {
        // 更新聊天室在线人数信息
        $('.chat-room .room-title span').text(data.length);

        // 更新聊天室成员列表
        $('#userList').html('');
        data.forEach(item => {
            $('#userList').append(`
                <li>
                    <div class="user">
                        <img src="${item.avatar}">
                        <p class="username">${item.username}</p>
                    </div>
                </li>
            `);
        })


    });

    // 监听聊天消息
    socket.on('receiveMessage', data => {
        if (data.username === user.username) {
            $('.room-content').append(`
                <div class="message-box">
                    <div class="owner-msg">
                        <img src="${data.avatar}" class="avatar">
                        <div class="content">
                            <div class="bubble">${data.msg}</div>
                        </div>
                    </div>
                </div>
            `)
        } else {
            $('.room-content').append(`
                <div class="message-box">
                    <div class="other-msg">
                        <img src="${data.avatar}" class="avatar">
                        <div class="content">
                            <div class="nickname">${data.username} ${getTime()}</div>
                            <div class="bubble">${data.msg}</div>
                        </div>
                    </div>
                </div>
            `);
        }

    });


});









function getTime() {
    var curDate = new Date();

    return curDate.getFullYear() + '-' + curDate.getMonth() + '-' + curDate.getDate() + ' ' + curDate.getHours() + ':' + curDate.getMinutes() + ':' + curDate.getSeconds();
}