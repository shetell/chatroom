const express = require("express");
const app = express();
app.use(express.static("public"));
var http = require('http').createServer(app); //将express注册到http中

//require('events').EventEmitter.defaultMaxListeners = 0; 
Array.prototype.remove = function () {
    for (var i = 0; i < arguments.length; i++) {
        var ele = arguments[i];
        var index = this.indexOf(ele);
        if (index > -1) {
            this.splice(index, 1);
        }
    }
};

var usocket = [];
var online_user = [];
var record = [];

function usr_socket(name,socket){
    this.name = name;
    this.socket = socket;
}

var io = require('socket.io')(http);
io.on('connection', function (socket) {
    //监听join事件
    socket.on("join", function (name) {
        if (online_user.find(function (value, index, arr) {
            return value == name;
        })) {
            io.to(socket.id).emit('relog', name)
        }
        else {
            usocket[name] = socket
            online_user.push(name);
            var u_s = new usr_socket(name,socket);
            record.push(u_s);
            io.emit("join", name) //服务器通过广播将新用户发送给全体群聊成员
        }
    })
    socket.on("send", function (MSG) {
        io.emit("receive", MSG);
    })

    socket.on('disconnect', function () { // 这里监听 disconnect，就可以知道谁断开连接了
        
        record.forEach(function(u_s){
            if(u_s.socket.id == socket.id){
                //console.log(u_s.name+' leave')
                record.remove(u_s);
                online_user.remove(u_s.name);
                io.emit("leave", u_s.name);
                //console.log(online_user);
            }
        })
    });
});

// setInterval(function () {
//         online_user.forEach(function (name) {
//             if(usocket[name]._handle == null){
//                 //online_user.shift(name);
//                 console.log(name+" logout")
//             } 
//         })
//     }, 500)

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/chatroom.html');
});

app.get('/chat.js', function (req, res) {
    res.sendFile(__dirname + '/chat.js');
});

app.get('/jquery-1.4.4.min.js', function (req, res) {
    res.sendFile(__dirname + '/jquery-1.4.4.min.js');
});

//启动监听，监听3000端口
// http.listen(3000,function(){
// 	console.log('http://192.168.92.1:3000')
// });

var os = require('os');
function getIPv4() {
    var interfaces = os.networkInterfaces();//获取网络接口列表
    var ipv4s = [];//同一接口可能有不止一个IP4v地址，所以用数组存
    Object.keys(interfaces).forEach(function (key) {
        interfaces[key].forEach(function (item) {
            //跳过IPv6 和 '127.0.0.1'
            if ('IPv4' !== item.family || item.internal !== false) { return false; }
            ipv4s.push(item.address);//可用的ipv4s加入数组
            //console.log(key+'--'+item.address);
        })
    });
    return ipv4s[0];//返回一个可用的即可
}

http.listen(3000, getIPv4(), function () {
    console.log('running at http://' + getIPv4() + ':3000');
})

