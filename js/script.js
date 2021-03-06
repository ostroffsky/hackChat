var userId;
var username;
var currentPurpose;
var currentPrivate;
var activeChatId;
var chatLoaded = false;
var textarea = $("#textarea");

var RES = {
    LOGIN: "Введите логин",
    PASSWORD: "Введите пароль",
    MESSAGE: "Введите сообщение"
};

var PURPOSE = {
    LOGIN: "login",
    PASSWORD: "password",
    REGISTER: "register",
    MESSAGE: "message",
    PRIVATE: "private"
};

var pubnub = PUBNUB.init({
    publish_key: 'pub-c-4d13827f-f0c2-4b5a-b85d-3f3a7021196b',
    subscribe_key: 'sub-c-810a307c-88e6-11e3-96c6-02ee2ddab7fe'
});

Parse.initialize("PXK892hE80vhCiPNqv9xM4dm7g5oVXZ2mfgItQi7","7VJuR3Tawrs4hiIcXZCcNYF8iVhmPHlwIj6FZEIK");

if (typeof String.prototype.startsWith != 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str){
        return this.indexOf(str) == 0;
    };
}

function addSystemMessage(msg, targetId) {
    targetId = targetId || activeChatId;

    var msgHtml = $("<div class='msg __system __red'></div>");
    msgHtml.text(msg);

    var messages = $("#chats").find(".messages_cell[data-id=" + targetId + "]");

    messages.append(msgHtml);

    $(".chat_messages").animate({ scrollTop: $(".chat_messages")[0].scrollHeight}, 1000);

    collectHistory();
}

function addMessage(msg) {
    var targetChatId = msg.chat;
    var now = new Date();
    var time = $.format.parseDate(now);
    var timeString = "[" + time.time.time + "]";

    if(msg.type) {
        if(msg.type == 2 && msg.user != username) {
            addSystemMessage("<"+ msg.user + "> зашел на канал", msg.chat);
            return;
        } else if(msg.type == 8) {
            if(msg.user == username) {
                notification_post(msg.user, {
                    body: "Вас упоминули в чате",
                    icon: "http://myhello.tk/img/pic/avatar_" + Math.floor(Math.random()*(68-1+1)+1) + ".png",
                    tag: "tag",
                    dir: "ltr",
                    lang: "en-US"
                });
            }

            return;
        } else if(msg.type == 9 && msg.user != username) {
            addSystemMessage("<"+ msg.user + "> ушел с канала", msg.chat);

            $(".members_lst[data-id=" + msg.chat + "]").find(".members_a").each(function(){
                if($(this).text() == msg.user) {
                    $(this).parent().remove();
                }
            });
            return;
        } else {
            return;
        }
    }
    if(msg.sender != username) {
        var msgHtml = $("<div class='msg'></div>");

        var msgTxt = msg.text;
        if (msgTxt.startsWith("[sticker_")) {
            var id = msgTxt.split("[sticker_")[1].split("]")[0];
            msgTxt = $("<br/><img src='img/stickers/stick_1_" + id + ".png'/>");
            msgHtml.text(timeString + " <" + msg.sender + "> ").append(msgTxt);

        } else if (msgTxt.startsWith("[geo_")) {
            var coords = msgTxt.split("[geo_")[1].split("]")[0].split(",");
            msgTxt = $("<br/><img src='http://maps.googleapis.com/maps/api/staticmap?zoom=13&size=400x200&markers=color:blue%7Clabel:S%7C" + coords[0] + "," + coords[1] + "&sensor=false'/>");
            msgHtml.text(timeString + " <" + msg.sender + "> ").append(msgTxt);

        } else {
            msgHtml.text(timeString + " <" + msg.sender + "> " + msgTxt);

            if(msg.file) {
                msgHtml.append("<br/><img class='attach' src='" + msg.file + "'/>");
            }
        }


        var messages = $("#chats").find(".messages_cell[data-id=" + targetChatId + "]");
        var tab = $(".channels_a[data-id=" + targetChatId + "]");
        if(!tab.hasClass("__active")) {
            tab.addClass("__new");
        }

        messages.append(msgHtml);

        $(".chat_messages").animate({ scrollTop: $(".chat_messages")[0].scrollHeight}, 1000);

        collectHistory();
    }
}

function addMyMessage(msg) {
    var targetChatId = msg.chat;
    var now = new Date();
    var time = $.format.parseDate(now);
    var timeString = "[" + time.time.time + "]";

    var msgHtml = $("<div class='msg __green'></div>");
    msgHtml.text(timeString + " <" + username + "> " + msg);

    var messages = $("#chats").find(".messages_cell[data-id=" + activeChatId + "]");

    messages.append(msgHtml);

    $(".chat_messages").animate({ scrollTop: $(".chat_messages")[0].scrollHeight}, 1000);


    collectHistory();
}

function collectHistory() {
    $("#chats .messages_cell").each(function(){
        var chatId = $(this).attr("data-id");
        $.jStorage.set(chatId, $(this).html());
    });
}
function restoreHistory() {
    $("#chats .messages_cell").each(function(){
        var chatId = $(this).attr("data-id");

        var storedHistory = $($.jStorage.get(chatId));
        storedHistory.find(".history .history .history").remove();

        var history = $("<div class='history'></div>");
        history.append(storedHistory);

        $(this).html(history)
    });
}

textarea.on("keypress", function(e){
    if(e.keyCode === 13) {
        e.preventDefault();

        if ($(this).val() == "") { return;}

        var value = $(this).val();

        // send message
        if (currentPurpose == PURPOSE.MESSAGE) {
            sendMessage(value);
        } else if (currentPurpose == PURPOSE.LOGIN) {
            checkLogin(value);
        } else if (currentPurpose == PURPOSE.PASSWORD) {
            login(username, value);
        } else if (currentPurpose == PURPOSE.REGISTER) {
            register(username, value);
        } else if (currentPurpose == PURPOSE.PRIVATE) {
            sendPrivateMessage(currentPrivate, value, {
                success: function(chat){
                    $("#chat_pc_" + currentPrivate).attr("data-id", chat.id);
                    currentPurpose = PURPOSE.MESSAGE;
                    activeChatId = chat.id;

                    pubnub.subscribe({
                        channel: chat.id,
                        message: addMessage
                    });
                }
            });
        }

        // clear textarea
        $(this).val("");
    }
});

$(function(){
    var cookieId = $.cookie('userId');
    var cookieUsername = $.cookie('username');

    if(!userId && !cookieId) {
        currentPurpose = PURPOSE.LOGIN;
        textarea.attr("placeholder", RES.LOGIN);
    } else if (cookieId) {
        userId = cookieId;
        username = cookieUsername;
        currentPurpose = PURPOSE.MESSAGE;

        pubnub.subscribe({
            channel: userId + "home",
            message: function(m){
                if (m.type) {
                    if(m.type == 1) {
                        getChatMessages(m.chat, 5);
                        addChat(m.user, m.chat);
                    }
                }
            }
        });

    }

    chatList();

    $(".chat_messages").scrollTop($(".chat_messages")[0].scrollHeight);

});

function addChat (u, ch) {
    $(".channels_lst").append("<li class='channels_i' id='pc_"+ u +"' data-type='private'><a href='#' data-id='pc_"+ u +"' class='channels_a __private' data-name='" + u + "'>" + u + "</a></li>");
}

$(".channels_lst").on("click", ".channels_i", function(e) {
    e.preventDefault();
    var chat;
    var members;

    // пометить канал как прочитанный
    $(this).find(".channels_a").removeClass("__new");

    // выставить текущий активный канал
    activeChatId = $(this).find(".channels_a").attr("data-id");

    if ($(this).attr("data-type") == "private") {
        currentPurpose = PURPOSE.PRIVATE;
        currentPrivate = $(this).find(".channels_a").attr("data-name");

        var id = "chat_" + $(this).attr("id");
        if(!document.getElementById(id)){
            var newPc = $("<td class='messages_cell' id='"+id+"' data-id='"+ $(this).attr("id") +"'></td>");
            $("#chats tr").append(newPc);
        }

        chat = $("#" + id);
        chat.addClass("__active");

        // спрятать участников чата
        members = $(".chat_members .members_lst");
        members.removeClass("__active");
    } else {
        currentPurpose = PURPOSE.MESSAGE;

        var name = $(this).find(".channels_a").text();
        chat = $("#chats").find(".messages_cell[data-chat=" + name + "]");

        // показать нужных участников чата
        members = $(".chat_members").find(".members_lst[data-id=" + activeChatId + "]");
        members.siblings().removeClass("__active");
        members.addClass("__active");
    }


    // выделить активный канал
    $(this).siblings().removeClass("__active");
    $(this).addClass("__active");

    // показать нужный контейнер с сообщениями
    chat.siblings().removeClass("__active");
    chat.addClass("__active");


    // проскроллить
    $(".chat_messages").scrollTop($(".chat_messages")[0].scrollHeight);

    // поставить фокус в поле ввода
    textarea.trigger("focus");
});

$(".chat_members")
        .on("click", ".members_a", function (e) {
            e.preventDefault();

            var name = $(this).text();
            var pc = document.getElementById("pc_" + name);
            if(!pc){
                $(".channels_lst").append("<li class='channels_i' id='pc_"+name+"' data-type='private'><a href='#' data-id='pc_"+name+"' class='channels_a __private' data-name='" + name + "'>" + name + "</a></li>");
            }
        });