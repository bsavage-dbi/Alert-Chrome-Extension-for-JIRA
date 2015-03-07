/****************************************************************
 *
 * This extension is written by Omar Al-Safi (omarsmak@gmail.com)
 * 2013
 *
 */



/// /Vars
var URL = "xxxx.jira.com", USERNAME = "user", PASSWORD = "user", FILTER_ID = "10001", TIMEOUT = 8000; //The long polling will run after 8s + 2s

var screenSharingAPI = {
    isUsernameExisting: function (username) {
        chrome.storage.sync.get('username', function (results) {
            var stored_username = results.username;
            if (stored_username === username) {
                return true;
            } else {
                return false;
            }
        });
    },

    noUsername: function (callback) {
        chrome.storage.sync.get('username', function (results) {
            var stored_username = results.username;
            console.log(stored_username);
            if (stored_username === undefined) {
                callback(true);
            } else {
                callback(false);
            }
        });
    },

    noKey: function (callback) {
        chrome.storage.local.get('issueKey', function (results) {
            var stored_key = results.issueKey;
            if (stored_key === undefined) {
                callback(true);
            } else {
                callback(false);
            }
        });
    },

    saveUsername: function (username) {
        chrome.storage.sync.set({'username': username}, function () {

        });
    },

    getUsername: function (callback) {
        chrome.storage.sync.get('username', function (results) {
            var stored_username = results.username;
            callback(stored_username);
        });
    },

    getKey: function (callback) {
        chrome.storage.local.get('issueKey', function (results) {
            var stored_username = results.issueKey;
            callback(stored_username);
        });
    },

    hideForm: function (bool) {
        if (bool) {
            $('#buttons').css("display", "block");
            //$('#changeUsername_button').css("display", "block");
            $('#usernameForm').css('display', 'none');
        } else {
            $('#buttons').css("display", "none");
            //$('#changeUsername_button').css("display", "none");
            $('#usernameForm').css('display', 'block');
        }
    },

    makeBasicAuth: function (user, password) {
        var tok = user + ':' + password;
        var hash = btoa(tok);
        return 'Basic ' + hash;
    },

    startScreenShare: function (username) {
        //Create a ticket at JIRA
        screenSharingAPI.showLoading();
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            url: URL + "/rest/api/2/issue",
            data: '{"fields": {"project":{"key": "ST"},"summary": "Screensharing in progress","description": "' + username + '","issuetype": {"name": "Bug"} }}',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", screenSharingAPI.makeBasicAuth(USERNAME, PASSWORD));
            },
            success: function (data) {
                screenSharingAPI.changeStatus('icons/oncall-icon-big_stop.png', 'OnCall Alert: OnCall Currently')
                chrome.storage.local.set({'issueKey': data.key}, function () {
                    // $('#screenshare_label').html(data.key);
                    //$('#screenshare_label').parent().css('display', 'block');
                    screenSharingAPI.hideLoading();
                    screenSharingAPI.changeButtonLabel('Stop OnCall Alert', 'stop');
                });
            },
            error: function () {

            }
        })
    },

    stopScreenShare: function (issueKey) {
        screenSharingAPI.showLoading();
        $.ajax({
            type: "DELETE",
            contentType: "application/json; charset=UTF-8",
            url: URL + "/rest/api/2/issue/" + issueKey,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", screenSharingAPI.makeBasicAuth(USERNAME, PASSWORD));
            },
            success: function (data) {
                chrome.browserAction.setIcon({
                    path : 'icons/icon_48.png'
                });
                screenSharingAPI.changeStatus('icons/icon_48.png', 'OnCall Alert')
                chrome.storage.local.remove('issueKey', function () {
                    //$('#screenshare_label').html('');
                    //$('#screenshare_label').parent().css('display', 'none');
                    screenSharingAPI.hideLoading();
                    screenSharingAPI.changeButtonLabel('Start OnCall Alert', "start");
                });
            },
            error: function () {

            }
        })
    },

    changeButtonLabel: function (newLabel, iconFlag) {
        $('#oncall_button').html(newLabel);
        if (iconFlag === "stop") {
            $('#start_oncall_alert').find('img').attr("src", "icons/oncall-icon-big_stop.png");
        } else {
            $('#start_oncall_alert').find('img').attr("src", "icons/oncall-icon-big.png");
        }
    },

    showLoading : function(){
        $('#buttons').css('display', 'none');
        $('#loading_spinner').css('display', 'block');
    },

    hideLoading : function(){
        $('#buttons').css('display', 'block');
        $('#loading_spinner').css('display', 'none');
    },

    changeStatus : function(iconUrl, title){
        chrome.browserAction.setIcon({
            path : iconUrl
        });

        chrome.browserAction.setTitle({
            title : title
        })
    },

    muteAlerts : function(){
        chrome.storage.sync.set({'muteAlert': 'true'}, function () {
            screenSharingAPI.unmuteAlertIcon()
        });
    },

    unmuteAlerts : function(){
        chrome.storage.sync.set({'muteAlert': 'false'}, function () {
            screenSharingAPI.muteAlertIcon();
        });
    },

    isMuted : function(callback){
        chrome.storage.sync.get('muteAlert', function (results) {
            var stored_key = results.muteAlert;
            if (stored_key === 'true') {
                callback(true);
            } else {
                callback(false);
            }
        });
    },

    muteAlertIcon : function(){
        $('#mute_unmute_alert').find('span').html('Mute Alerts');
        $('#mute_unmute_alert').find('img').attr("src", "icons/mute.png");
    },

    unmuteAlertIcon : function(){
        $('#mute_unmute_alert').find('span').html('Unmute Alerts');
        $('#mute_unmute_alert').find('img').attr("src", "icons/sound.png");
    },

    isUsernameValid : function(name){
        if (name === undefined || name === null || name === ""){
            return false;
        } else {
            return true;
        }
    }

};