'use strict';

var config 	= require('../config/config');
const { tbl_items} = require('../models');
const { tbl_user_accounts} = require('../models');
const chatService       = require('../services/chat.service');
const itemService       = require('../services/item.service');
const { to, ReE, ReS }  = require('../services/util.service');

const FireAdmin = require('./firebase_admin');
/**
 * Encapsulates all code for emitting and listening to socket events
 *
 */
var ids = []
var sockets = {}
var item_ids = [];
const getUniqueString = function(from_user_id , to_user_id , item_id)
{
	return item_id + "_" + from_user_id + "_" +to_user_id;
}

const ioEvents = async function(io) {

	io.on('connection' ,function(socket){
		console.log('Client Connected...');


        socket.emit('hhh');
		socket.on('join', function(data) {
			console.log("----Socket Joined----\n");
			let uniqueString = getUniqueString(data.userId, data.toUserId ,data.itemId);

            sockets[uniqueString] = socket;
            ids[socket.id] = uniqueString;

            sockets[uniqueString].emit('joined', 'Hello from server');
        });

		socket.on('deliver', async function(data){
			var err,result;
            var updateInfo = {deliver : 1};
            var err ,cmsg1;
            for (var i = 0 ; i < data.length; i++)
            {
                [err, cmsg1] = await to (chatService.update_message(updateInfo,data[i]));
            }

		});

        socket.on('send', async function( data ) {
            console.log("Send msg");
			let uniqueString = getUniqueString(data.fromUserId, data.toUserId ,data.itemId);

			if( sockets[uniqueString] == undefined ){
	            sockets[uniqueString] = socket;
				ids[socket.id] = uniqueString;
			}

            var err, cmsg;
		  	  [err ,cmsg] = await to (chatService.add_new_message(data.fromUserId , data.toUserId, data.itemId , data.message));

                if (cmsg != undefined)
                {
					var unique_string =getUniqueString( data.toUserId ,data.fromUserId,data.itemId);
                    var tosocket = sockets[unique_string];

                    if (tosocket != undefined)
                    {
                        tosocket.emit('receive' , cmsg);
                    }
                    else
                    {
                        var err, user;
						[err,user] = await  to(tbl_user_accounts.findOne({where:{id : data.toUserId}}));

						if (err)
							return;

						var deviceId = user.device_id;

						var me;
						[err ,me] = await  to(tbl_user_accounts.findOne({where:{id : data.fromUserId}}));

						FireAdmin.sendNotification(deviceId , me, data.itemId, cmsg);

                    }
					
					let me_socket_id = getUniqueString( data.fromUserId,data.toUserId ,data.itemId);
                    if( sockets[me_socket_id] ){
                    	sockets[me_socket_id].emit("sent", cmsg);
					}
                }
        });

        socket.on('disconnect' , function(data){
            var us = ids[socket.id]
            console.log("Socket Disconnected: " + us);
            if (us != undefined) {
                delete sockets[us]
                delete ids[socket.id]
            }
        });
	});
}

var init = function(server){

	var io 		= require('socket.io')(server);
	ioEvents(io);
}

module.exports = init;