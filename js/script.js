var pubnub = PUBNUB.init({
    publish_key: 'pub-c-4d13827f-f0c2-4b5a-b85d-3f3a7021196b',
    subscribe_key: 'sub-c-810a307c-88e6-11e3-96c6-02ee2ddab7fe'
});

var CHAT = {
    addMessage : function(msg) {
        var msgHtml = $("<div class='msg'></div>");
        msgHtml.text(msg.text);

        var messages = $("#messages");

        messages.append(msgHtml);

        $(".chat_messages").animate({ scrollTop: $(".chat_messages")[0].scrollHeight}, 1000);
        //$(".chat_messages").scrollTop($(".chat_messages").prop("scrollHeight"));
    },
    sendMessage: function(msg) {
        // send msg
        console.log(msg);

        pubnub.publish({
            channel: 't9WPRgM77Q',
            message: {
                text: msg,
                message: msg
            }
        });
    },
    disable: function() {
        $("#messages").toggleClass("__disabled");
    }
};

pubnub.subscribe({
    channel: 't9WPRgM77Q',
    message: CHAT.addMessage
});

$("#textarea").on("keypress", function(e){
    if(e.keyCode === 13) {
        e.preventDefault();

        // send message
        CHAT.sendMessage($(this).val());

        // clear textarea
        $(this).val("");
    }
});