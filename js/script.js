var userId;
var username;
var currentPurpose;
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
    MESSAGE: "message"
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

function addSystemMessage(msg) {
    var msgHtml = $("<div class='msg __system __red'></div>");
    msgHtml.text(msg);

    var messages = $("#messages");

    messages.append(msgHtml);

    $(".chat_messages").animate({ scrollTop: $(".chat_messages")[0].scrollHeight}, 1000);

    collectHistory();

}
function addMessage(msg) {
    if(msg.sender != username) {
        var msgHtml = $("<div class='msg'></div>");

        var msgTxt = msg.text;
        if (msgTxt.startsWith("[sticker_")) {
            var id = msgTxt.split("[sticker_")[1].split("]")[0];
            msgTxt = $("<img src='img/stickers/stick_1_" + id + ".png'/>");
            msgHtml.text("<" + msg.sender + "> ").append(msgTxt);

        } else {
            msgHtml.text("<" + msg.sender + "> " + msgTxt);
        }


        var messages = $("#messages");

        messages.append(msgHtml);

        $(".chat_messages").animate({ scrollTop: $(".chat_messages")[0].scrollHeight}, 1000);

        collectHistory();
    }
}

function addMyMessage(msg) {
    var msgHtml = $("<div class='msg __green'></div>");
    msgHtml.text("<" + username + "> " + msg);

    var messages = $("#messages");

    messages.append(msgHtml);

    $(".chat_messages").animate({ scrollTop: $(".chat_messages")[0].scrollHeight}, 1000);

    collectHistory();
}

function collectHistory() {
    var history = $("#messages").html();
    $.jStorage.set("history", history);
}



pubnub.subscribe({
    channel: 't9WPRgM77Q',
    message: addMessage
});

textarea.on("keypress", function(e){
    if(e.keyCode === 13) {
        e.preventDefault();
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

        joinChat("t9WPRgM77Q", userId);
    }

    chatList();
    getChatMembers("t9WPRgM77Q");

    var storedHistory = $($.jStorage.get("history"));
    storedHistory.find(".history .history .history").remove();
    var history = $("<div class='history'></div>");
    history.append(storedHistory);

    $("#messages").html(history);

    $(".chat_messages").animate({ scrollTop: $(".chat_messages")[0].scrollHeight}, 1000);

});