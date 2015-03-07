/****************************************************************
 *
 * This extension is written by Omar Al-Safi (omarsmak@gmail.com)
 * 2013
 *
 */




helperAPI = {
    combineLogs: function (mainArray) {
        var a = mainArray.concat();
        for (var i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (a[i].key === a[j].key)
                    a.splice(j--, 1);
            }
        }

        return a;
    },
    findNotificationLogs: function (logsArry, notificationLogs) {
        var logsToNotify = [];
        for (var i = 0; i < logsArry.length; i++) {
            console.log(logsArry[i].engineer);
            var existingFlag = false;
            //we compare each value with the main array
            for (var m = 0; m < notificationLogs.length; m++) {
                if (logsArry[i].key === notificationLogs[m].key) {
                    //the value is existing in the main array, means that is value is not new
                    existingFlag = true;
                }
            }
            if (!existingFlag) {
                //If the value is not exiting, we push it to the logsToNotify
                logsToNotify.push(logsArry[i]);
            }
        }
        return logsToNotify;
    },

    checkForNewLogs: function () {
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=UTF-8",
            url: URL + "/rest/api/latest/search?jql=filter=" + FILTER_ID,
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", screenSharingAPI.makeBasicAuth(USERNAME, PASSWORD));
            },
            success: function (data) {
                chrome.storage.local.get({notificationLogs: []}, function (result) {
                    var notificationLogs = result.notificationLogs;
                    var logs = data.issues;
                    var logsArry = [];
                    for (var i = 0; i < logs.length; i++) {
                        var obj = {"key": logs[i].key.toString(), "engineer": logs[i].fields.description.toString()};
                        logsArry.push(obj);
                    }
                    if (notificationLogs.length === 0) {  //in case no logs yet, just store
                        chrome.storage.local.set({notificationLogs: logsArry}, function () {
                            chrome.storage.local.get('notificationLogs', function (result) {
                                console.log(result.notificationLogs);
                            })
                        })
                    } else {
                        //First we generate array of logs to notify
                        var logsToNotify = helperAPI.findNotificationLogs(logsArry, notificationLogs);
                        console.log("Notfication");
                        console.log(logsToNotify);

                        //Now we combine bot the main array with the new one
                        notificationLogs = helperAPI.combineLogs(notificationLogs.concat(logsArry));
                        console.log("Combined");
                        console.log(notificationLogs);
                        //store the new array
                        chrome.storage.local.set({notificationLogs: notificationLogs}, function () {
                            //Now show the notifications
                            helperAPI.notifyUsers(logsToNotify);
                        })
                    }
                })
            },
            error: function (err) {

            },
            complete: setTimeout(function () {
                helperAPI.checkForNewLogs()
            }, TIMEOUT),
            timeout: 2000
        });
    },

    notifyUsers: function (logsArr) {
        //Add the notification for each array
        for (var i = 0; i < logsArr.length; i++) {
            var notification = webkitNotifications.createNotification(
                'icons/icon_128.png',
                'Engineer\'s OnCall Alert',
                 logsArr[i].engineer + " is OnCall currently, please remain quiet"
            );
            //If the alerts are muted, no notifications
            screenSharingAPI.isMuted(function(bool){
                if(!bool){
                    //We will only show the notification when 'isNotMuted'
                    console.log('notifications not muted');
                    notification.show();
                    //After 3s hide the notification
                    setTimeout(function(){
                        notification.cancel();
                    }, 3000);
                }
            })
        }
    }
}

//Run the function

helperAPI.checkForNewLogs();

