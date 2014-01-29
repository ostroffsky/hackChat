Parse.initialize("PXK892hE80vhCiPNqv9xM4dm7g5oVXZ2mfgItQi7","7VJuR3Tawrs4hiIcXZCcNYF8iVhmPHlwIj6FZEIK");

function login(username, password) {
    Parse.Cloud.run('login', {'username':username,'password':password}, {
        success: function(result) {
            console.log(result);
        },
        error: function(error) {
            console.log('Error: ' + error.code + ' ' + error.message);
        }
    });
}
function check(username) {
    Parse.Cloud.run('findContact', {'username':username}, {
        success: function(result) {
            console.log(result);
        },
        error: function(error) {
            console.log('Error: ' + error.code + ' ' + error.message);
        }
    });
}
function register(username, password) {
    Parse.Cloud.run('registration', {'username':username,'password':password}, {
        success: function(result) {
            console.log(result);
        },
        error: function(error) {
            console.log('Error: ' + error.code + ' ' + error.message);
        }
    });
}
function addContact() {
    var username = document.getElementById('username').value;
    var me = document.getElementById('password').value;

    Parse.Cloud.run('addContact', {'username':username,'me':me}, {
        success: function(result) {
            console.log(result);
        },
        error: function(error) {
            console.log('Error: ' + error.code + ' ' + error.message);
        }
    });
}
function createChat() {
    var name = document.getElementById('username').value;

    Parse.Cloud.run('createChat', {'chatname':name}, {
        success: function(result) {
            console.log(result);
        },
        error: function(error) {
            console.log('Error: ' + error.code + ' ' + error.message);
        }
    });
}
function createMsg() {
    var userId = document.getElementById('username').value;
    var msg = document.getElementById('text').value;
    var chat = document.getElementById('password').value;

    Parse.Cloud.run('addMsg', {'chatId':chat, 'msg': msg, 'userId': userId}, {
        success: function(result) {
            console.log(result);
        },
        error: function(error) {
            console.log('Error: ' + error.code + ' ' + error.message);
        }
    });
}