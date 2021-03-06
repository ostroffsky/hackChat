/**
 * Created by Alexey Ostrovsky.
 * Date: 29.01.14
 * Time: 22:49
 */

function getChatMembers(chatId) {
    Parse.Cloud.run('chatMembers', {"chatId":chatId}, {
        success: function(result) {
            var container = $("<ul class='members_lst' data-id='" + chatId + "'></ul>");
            $(".chat_members .members_lst[data-id='" + chatId + "']").remove();

            for (var i = 0; i < result.length; i++) {
                var name = result[i].attributes.name;

                var html = $("<li class='members_i'><a href='#' class='members_a'>" + name + "</a></li>");
                container.append(html)

                $(".chat_members").append(container);


                $(".chat_members").find(".members_lst:first").addClass("__active");
                $("#chats").find(".messages_cell:first").addClass("__active");
                $(".channels_lst").find(".channels_i:first").addClass("__active");
                $(".chat_messages").scrollTop($(".chat_messages")[0].scrollHeight);
                activeChatId = $(".channels_lst").find(".channels_i:first").find(".channels_a").attr("data-id");
                textarea.trigger("focus");
            }
        },
        error: function(error) {
            //alert('Error: ' + error.code + ' ' + error.message);
        }
    });
}

function joinChat(chatId, id) {
    Parse.Cloud.run('joinChat', {"chatId":chatId,"userId":id}, {
        success: function(result) {
            //alert(JSON.stringify(result));
        },
        error: function(error) {
            //alert('Error: ' + error.code + ' ' + error.message);
        }
    });
}

function chatList() {
    Parse.Cloud.run('chatList', {}, {
        success: function(result) {
            $(".channels_lst").empty();

            for (var i = 0; i < result.length; i++) {
                var chat = result[i].attributes.name.trim();
                var chatId = result[i].id;
                var html = $("<li class='channels_i'><a href='#' class='channels_a __channel' data-id='" + chatId + "'>" + chat + "</a></li>");
                $(".channels_lst").append(html);

                if (!chatLoaded) {
                    var chatHtml = $("<td class='messages_cell' data-id='" + chatId + "' data-chat='"+chat+"'></td>");
                    $("#chats tr").append(chatHtml);
                    joinChat(chatId, userId);

                    pubnub.subscribe({
                        channel: chatId,
                        message: addMessage
                    });

                    restoreHistory();
                }


                getChatMembers(chatId);
            }

            chatLoaded = true;
        },
        error: function(error) {
            //alert('Error: ' + error.code + ' ' + error.message);
        }
    });
}

function sendMessage(msg) {
    // draw msg
    addMyMessage(msg);

    // send msg
    Parse.Cloud.run('addMsg', {
        'chatId': activeChatId,
        'msg':  msg,
        'userId': userId
    }, {
        success: function(result) {
            //console.log(result);
        },
        error: function(error) {
            //alert('Error: ' + error.code + ' ' + error.message);
        }
    });
}

function getChatMessages(chatId, limit) {
    Parse.Cloud.run('getChatMessages', {
        'userId': userId,
        'chatId': chatId,
        'limit':  limit
    }, {
        success: function(result) {
            result.reverse();

            for (var i = 0; i < result.length; i++) {
                $("#chat_pc_" + result[i].attributes.sender.attributes.name).append("<div class='msg'>&lt;" + result[i].attributes.sender.attributes.name + "&gt; " + result[i].attributes.text + "</div>");
            }
        },
        error: function(error) {
            //alert('Error: ' + error.code + ' ' + error.message);
        }
    });
}

function sendPrivateMessage(user, msg, callback) {
    // draw msg
    addMyMessage(msg);

    // send msg
    Parse.Cloud.run('sendPrivateMessage', {
        'msg':  msg,
        'senderId': userId,
        'receiverName': user

    }, {
        success: function(result) {
            callback.success(result);
        },
        error: function(error) {
            //alert('Error: ' + error.code + ' ' + error.message);
        }
    });
}

function checkLogin(user) {
    username = user;

    Parse.Cloud.run('findContact', {'username':user}, {
        success: function(result) {
            //console.log(result.id);
            userId = result.id;
            username = user;

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
            currentPurpose = PURPOSE.MESSAGE;
            textarea.attr("placeholder", RES.MESSAGE);

            // set cookie
            $.cookie('userId', result.id);
            $.cookie('username', user);
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
            username = user;

            currentPurpose = PURPOSE.MESSAGE;
            textarea.attr("placeholder", RES.MESSAGE);

            $.cookie('userId', userId);
            $.cookie('username', user);
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
            //alert('Error: ' + error.code + ' ' + error.message);
        }
    });
}
