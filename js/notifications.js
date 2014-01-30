/**
 * Created by Alexey Ostrovsky.
 * Date: 31.01.14
 * Time: 0:40
 */

var NotificationIsSupported = !!(window.Notification /* W3C Specification */ || window.webkitNotifications /* old WebKit Browsers */ ||navigator.mozNotification /* Firefox for Android and Firefox OS */);

if(NotificationIsSupported) {
    //console.log("Notifications are supported");
} else {
    //console.log("Notifications aren't supported");
}

function notification_requestPermission() {
    if (window.webkitNotifications && window.webkitNotifications.checkPermission) {
        window.webkitNotifications.requestPermission();
    } else if (window.Notification && window.Notification.requestPermission) {
        window.Notification.requestPermission();
    }
}

var PERMISSION_DEFAULT = "default",
        PERMISSION_GRANTED = "granted",
        PERMISSION_DENIED = "denied",
        PERMISSION = [PERMISSION_GRANTED, PERMISSION_DEFAULT, PERMISSION_DENIED];

function notification_checkPermission() {
    var permission;
    if (window.webkitNotifications && window.webkitNotifications.checkPermission) {
        permission = PERMISSION[window.webkitNotifications.checkPermission()];
    } else if (navigator.mozNotification) {
        permission = PERMISSION_GRANTED;
    } else if (window.Notification && window.Notification.permission) {
        permission = window.Notification.permission;
    }
    return permission;
}

function notification_post (title, options) {
    var notification;
    if (notification_checkPermission() === PERMISSION_GRANTED) {
        if (window.Notification) {
            notification = new window.Notification(title, {
                icon: options.icon || "",
                body: options.body || "",
                tag: options.tag || ""
            });
        } else if (window.webkitNotifications) {
            notification = window.webkitNotifications.createNotification(options.icon, title, options.body);
            notification.show();
        } else if (navigator.mozNotification) {
            notification = navigator.mozNotification.createNotification(title, options.body, options.icon);
            notification.show();
        }
        return notification;
    } else {
        notification_requestPermission();
    }
}