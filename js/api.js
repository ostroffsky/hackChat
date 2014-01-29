/**
 * Created by Alexey Ostrovsky.
 * Date: 29.01.14
 * Time: 22:49
 */

function getChatMembers(chatId) {
    Parse.Cloud.run('chatMembers', {"chatId":chatId}, {
        success: function(result) {
            for (var i = 0; i < result.length; i++) {
                var name = result[i].attributes.name;

                var html = $("<li class='members_i'><a href='#' class='members_a'>@" + name + "</a></li>");
                $(".members_lst").append(html);
            }
        },
        error: function(error) {
            alert('Error: ' + error.code + ' ' + error.message);
        }
    });
}

function joinChat(chatId, id) {
    Parse.Cloud.run('joinChat', {"chatId":chatId,"userId":id}, {
        success: function(result) {
            //alert(JSON.stringify(result));
        },
        error: function(error) {
            alert('Error: ' + error.code + ' ' + error.message);
        }
    });
}

function chatList() {
    Parse.Cloud.run('chatList', {}, {
        success: function(result) {
            for (var i = 0; i < result.length; i++) {
                var chat = result[i].attributes.name;

                var html = $("<li class='channels_i'><a href='#' class='channels_a __channel'>" + chat + "</a></li>");
                $(".channels_lst").append(html);
            }
        },
        error: function(error) {
            alert('Error: ' + error.code + ' ' + error.message);
        }
    });
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

            // join chat
            joinChat("t9WPRgM77Q", userId);
        },
        error: function(error) {
            addSystemMessage('Error: ' + error.code + ' ' + error.message);
        }
    });
}

function register(user, password) {
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

function createChat(chatName) {
    Parse.Cloud.run('createChat', {'chatname':chatName}, {
        success: function(result) {
            //alert(result);
        },
        error: function(error) {
            alert('Error: ' + error.code + ' ' + error.message);
        }
    });
}