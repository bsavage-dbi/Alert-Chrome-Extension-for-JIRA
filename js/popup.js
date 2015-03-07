


$(function () {
    screenSharingAPI.noUsername(function (bool) {
        //if there is a username already
        if (!bool) {
            screenSharingAPI.hideForm(true)
            screenSharingAPI.getUsername(function (username) {
                $('#engineer_name').html(username);
            })
        }
    });

    //screenSharingAPI.checkForNewLogs();

    screenSharingAPI.noKey(function (bool) {
        //if there is a key already
        if (!bool) {
            screenSharingAPI.getKey(function (key) {
                //$('#screenshare_label').html(key);
                //$('#screenshare_label').parent().css('display', 'block');
                screenSharingAPI.changeButtonLabel('Stop OnCall Alert', 'stop');
            })
        }
    });


    //check if the alerts are muted or not
    screenSharingAPI.isMuted(function(bool){
        if(bool){
            //Muted so we unmute
            console.log("muted");
            screenSharingAPI.unmuteAlertIcon();
        } else{
            console.log("notmuted");
            screenSharingAPI.muteAlertIcon();
        }
    })

    $('#usernameForm').submit(function (event) {
        event.preventDefault();
        var engineer_username = $("#engineer_username").val();
        console.log(engineer_username);
        if(screenSharingAPI.isUsernameValid(engineer_username)){
            screenSharingAPI.saveUsername(engineer_username);
            screenSharingAPI.hideForm(true);
            $('#engineer_name').html(engineer_username);
        } else {
            //TODO: Notify the user if the username is not valid
        }
    });

    $('#change_user').click(function (event) {
        event.preventDefault();
        screenSharingAPI.hideForm(false)
    });

    $('#start_oncall_alert').click(function (event) {
        event.preventDefault();
        screenSharingAPI.noKey(function (bool) {
            //if there is a key already
            if (!bool) {
                //Stop screenshare

                screenSharingAPI.getKey(screenSharingAPI.stopScreenShare);

            } else {
                //Start screenshare
                screenSharingAPI.getUsername(screenSharingAPI.startScreenShare);
            }
        });
    });

    $('#mute_unmute_alert').click(function(event){
        event.preventDefault();
        screenSharingAPI.isMuted(function(bool){
            if(bool){
                //Muted so we unmute
                console.log("muted");
                screenSharingAPI.unmuteAlerts();
            } else{
                console.log("notmuted");
                screenSharingAPI.muteAlerts();
            }
        })
    });
});