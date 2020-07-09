var admin = require("firebase-admin");

var serviceAccount = require("../config/snackspop-161808-firebase-adminsdk-9b5xw-14b030dede.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://snackspop-161808.firebaseio.com"
});

const sendNotification  = function(registrationToken ,  user, itemid,message)
{
	let shortMsg = message.message;
	if (message.length > 20){
		shortMsg = message.substring(0,20) + '...';
	}

    var payload = {
        notification: {
            title: "New Message",
            body: shortMsg
        }
        ,
        data: {
            user_info : JSON.stringify(user.toWeb()),
            item_id: String(itemid),
            chat: JSON.stringify(message.toWeb()),
            message: String(message.message),
            chat_flag: 'true'
        }

    };
    var options = {
        priority: "high",
        timeToLive: 60 * 60 *24
    };


    admin.messaging().sendToDevice(registrationToken, payload, options)
        .then(function(response) {
            console.log("Successfully sent message:", JSON.stringify(response));
        })
        .catch(function(error) {
            console.log("Error sending message:", error);
        });

}

module.exports.sendNotification = sendNotification;