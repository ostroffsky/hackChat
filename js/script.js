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


function addSystemMessage(msg) {
    var msgHtml = $("<div class='msg __system __red'></div>");
    msgHtml.text(msg);

    var messages = $("#messages");

    messages.append(msgHtml);

    $(".chat_messages").animate({ scrollTop: $(".chat_messages")[0].scrollHeight}, 1000);

}
function addMessage(msg) {
    var msgHtml = $("<div class='msg'></div>");
    msgHtml.text("<" + msg.sender + "> " + msg.text);

    var messages = $("#messages");

    messages.append(msgHtml);

    $(".chat_messages").animate({ scrollTop: $(".chat_messages")[0].scrollHeight}, 1000);
}

function sendMessage(msg) {
    // send msg
    Parse.Cloud.run('addMsg', {
        'chatId': "t9WPRgM77Q",
        'msg':  msg,
        'userId': userId
    }, {
        success: function(result) {
            //console.log(result);
        },
        error: function(error) {
            alert('Error: ' + error.code + ' ' + error.message);
        }
    });
}

function checkLogin(user) {
    username = user;

    Parse.Cloud.run('findContact', {'username':user}, {
        success: function(result) {
            //console.log(result.id);
            userId = result.id;

            currentPurpose = PURPOSE.PASSWORD;
            textarea.attr("placeholder", RES.PASSWORD);
        },
        error: function(error) {
            addSystemMessage("Привет, " + user + "! Придумай себе пароль");

            currentPurpose = PURPOSE.REGISTER;
            textarea.attr("placeholder", RES.PASSWORD);
        }
    });
}

function login(user, password) {
    Parse.Cloud.run('login', {'username':user,'password':password}, {
        success: function(result) {
            //console.log(result);

            currentPurpose = PURPOSE.MESSAGE;
            textarea.attr("placeholder", RES.MESSAGE);

            // set cookie
            $.cookie('userId', result.id);
        },
        error: function(error) {
            addSystemMessage('Error: ' + error.code + ' ' + error.message);
        }
    });
}

function register(user, password) {
    console.log(user, password);
    Parse.Cloud.run('registration', {'username':user,'password':password}, {
        success: function(result) {
            //console.log(result);
            userId = result.id;

            currentPurpose = PURPOSE.MESSAGE;
            textarea.attr("placeholder", RES.MESSAGE);
        },
        error: function(error) {
            addSystemMessage('Error: ' + error.code + ' ' + error.message);
        }
    });
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

    if(!userId && !cookieId) {
        currentPurpose = PURPOSE.LOGIN;
        textarea.attr("placeholder", RES.LOGIN);
    } else if (cookieId) {
        userId = cookieId;
        currentPurpose = PURPOSE.MESSAGE;
    }

});