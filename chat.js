var msgbox;
var logbtn = document.getElementById('logbtn');
var sendbtn = document.getElementById('sendbtn');
var chatroom = document.getElementById('chatroom');
var login = document.getElementById('login');
var ID;
var side = document.getElementById('side');


const changeFavicon = link => {
    let $favicon = document.querySelector('link[rel="icon"]');
    // If a <link rel="icon"> element already exists,
    // change its href to the given link.
    if ($favicon !== null) {
        $favicon.href = link;
        // Otherwise, create a new element and append it to <head>.
    } else {
        $favicon = document.createElement("link");
        $favicon.rel = "icon";
        $favicon.href = link;
        document.head.appendChild($favicon);
    }
};
let icon = './chat_yello_front.png'; // 图片地址
changeFavicon(icon); // 动态修改网站图标


//findtarget
var target

$(function () {
    $('.contact li').click(function (e) {
        $(this).addClass('active').siblings().removeClass('active');
        $(this).children('div').remove();
        var index = $(this).index();
        target = e.target.id;
        var tid = 'msg_' + target.toLowerCase()
        msgbox = document.getElementById(tid)
        var header = document.getElementById('header')
        var t
        switch (target) {
            case 'Group':
                t = 'Group';
                break;
            case 'MBG':
                t = '马保国';
                break;
            case 'DSM':
                t = '大司马';
                break;
            case 'JG':
                t = '杰哥';
                break;
            case 'LX':
                t = '罗翔';
                break;
        }
        header.innerHTML = t;
        $(".MSG div").eq(index).show().siblings().hide();
        if (msgbox.lastElementChild) {
            msgbox.lastElementChild.scrollIntoView();
        }
    })
})



//用户名和密码定义段
function USER(id, passwd) {

    this.id = id;
    this.passwd = passwd;
}

var mbg = new USER('MBG', '111');
var lx = new USER('LX', '222');
var jg = new USER('JG', '333');
var dsm = new USER('DSM', '444');

var database = [mbg, lx, jg, dsm];

function judge_member(usr) {
    for (var i = 0; i < database.length; i++) {
        if (database[i].id === usr.id && database[i].passwd === usr.passwd) {
            return true;
        }
        else {
            if ((i + 1) === database.length) { return false; }
        }
    }
}

function MSG(target, id, msg) {
    this.target = target;
    this.id = id;
    this.msg = msg;
}

function log_in(user) {
    init(user);
    chatroom.style.top = '30px';
    login.style.top = '-100%';
    // chatroom.style.display = 'block';
    // login.style.display = 'none'
}

function init(usr) {
    console.log('init ' + usr)
    var user = document.getElementById(usr)
    user.remove()
    var msg_id = 'msg_' + user.id.toLowerCase()
    var self_msg = document.getElementById(msg_id)
    self_msg.remove()
    msgbox = document.getElementById('msg_group');
    target = 'Group'
}

logbtn.addEventListener('click', function () {
    var id = document.getElementById('id').value;
    var passwd = document.getElementById('passwd').value;
    ID = id;
    var usr = new USER(id, passwd);
    if (judge_member(usr)) {
        socket.emit("join", usr.id);
    }
    else {
        alert('用户名或密码错误');
    }

}, false)


socket.on("join", function (user) {
    if(user == ID){
        log_in(user);
        someone_join(user);
    }
    else{
        someone_join(user);
    }
})

socket.on("leave", function (user) {
    someone_leave(user)
})

socket.on("receive", function (MSG) {
    if (MSG.id != ID) {
        //console.log(MSG.id, ID);
        receiveMsg(MSG);
    }
})

socket.on("relog", function (name) {
    alert("您已登录聊天室，请勿重复登陆")
})

function someone_join(usr) {
    var joinmsg = document.createElement('p');
    var join_txt = document.createTextNode(usr + " 加入了群聊");
    joinmsg.appendChild(join_txt);
    joinmsg.setAttribute('class', 'join_in');
    msgbox.appendChild(joinmsg)
}

function someone_leave(usr) {
    var joinmsg = document.createElement('p');
    var join_txt = document.createTextNode(usr + " 退出了群聊");
    joinmsg.appendChild(join_txt);
    joinmsg.setAttribute('class', 'join_in');
    msgbox.appendChild(joinmsg)
}


document.onkeydown = function (event) {
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if (e && e.keyCode == 13) { // enter 键
        sendMsg();
    }
};

sendbtn.addEventListener('click', function () {
    sendMsg();
})

function sendMsg() {
    var input = document.getElementById('input');
    var msgtxt = document.getElementById('input').value;
    if (msgtxt === '') {
        return;
    }
    var msg = document.createElement('span');
    msg.innerHTML = msgtxt;
    msg.setAttribute('class', 'msg');

    var avatar = document.createElement('img');
    avatar.setAttribute('class', 'avatar');
    switch (ID) {
        case 'MBG':
            avatar.src = './mbg.jpg';
            break;
        case 'DSM':
            avatar.src = './dsm.jpg';
            break;
        case 'JG':
            avatar.src = './jg.jpg';
            break;
        case 'LX':
            avatar.src = './lx.jpg';
            break;
    }

    var msg_from_me = document.createElement('span');
    msg_from_me.setAttribute('class', 'msg_from_me');
    msg_from_me.appendChild(msg);
    msg_from_me.appendChild(avatar);
    msgbox.appendChild(msg_from_me);
    msg_from_me.scrollIntoView();

    input.value = '';

    var send_MAG = new MSG(target, ID, msgtxt);
    //console.log(target);
    socket.emit("send", send_MAG);
}

function receiveMsg(MSG) {
    var msg = document.createElement('span');
    msg.innerHTML = MSG.msg;
    msg.setAttribute('class', 'msg');

    var avatar = document.createElement('img');
    avatar.setAttribute('class', 'avatar');
    switch (MSG.id) {
        case 'MBG':
            avatar.src = 'mbg.jpg';
            break;
        case 'DSM':
            avatar.src = 'dsm.jpg';
            break;
        case 'JG':
            avatar.src = 'jg.jpg';
            break;
        case 'LX':
            avatar.src = 'lx.jpg';
            break;
    }
    var msg_from_others = document.createElement('span');
    msg_from_others.setAttribute('class', 'msg_from_others');
    msg_from_others.appendChild(avatar);
    msg_from_others.appendChild(msg);
    if (MSG.target == 'Group') {
        var tid = 'msg_group'
        var _msgbox = document.getElementById(tid);
        _msgbox.appendChild(msg_from_others);
        msg_from_others.scrollIntoView();
    }
    if (MSG.target == ID) {
        var tid = 'msg_' + MSG.id.toLowerCase()
        var _msgbox = document.getElementById(tid);
        _msgbox.appendChild(msg_from_others);
        msg_from_others.scrollIntoView();
    }
    if (MSG.id != target && MSG.target == ID) {
        new_msg_notice(MSG.id);
        msg_from_others.scrollIntoView();
    }
    if (MSG.target == 'Group' && target != 'Group') {
        new_msg_notice('Group');
        msg_from_others.scrollIntoView();
    }
    msg_from_others.scrollIntoView();
}

function new_msg_notice(target) {
    //console.log('new msg at ' + target)
    var newt = document.getElementById(target)
    dot = document.createElement('div')
    if (!document.getElementById('dot' + newt.id)) {
        dot.setAttribute('class', 'reddot')
        dot.setAttribute('id', 'dot' + newt.id)
        newt.appendChild(dot)
    }
}
