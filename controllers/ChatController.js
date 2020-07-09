const { tbl_user_accounts }          = require('../models');
const { tbl_chat_rooms }          = require('../models');
const { tbl_chat_messages }          = require('../models');
const authService       = require('../services/auth.service');
const chatService       = require('../services/chat.service');
const { to, ReE, ReS }  = require('../services/util.service');

const get_messages_byRoom = async function(req, res){
    var err , msgs , room;

    [err , msgs] = await to (chatService.get_messages_byRoom(req,res));

    if (err)
        TE(err.message);

    return ReS(res, {success : true , data : msgs});

}

module.exports.get_messages_byRoom = get_messages_byRoom;

const get_items_with_chat = async function(req, res){
    let err, items;

    [err, items] = await to(chatService.get_items_with_chat(req));
    if(err) return ReE(res, err, 422);


    return ReS(res, {data : items});
}
module.exports.get_items_with_chat = get_items_with_chat;



const get_chats_with_item = async function(req, res){
    let err, items;

    [err, items] = await to(chatService.get_chats_with_item(req));
    if(err) return ReE(res, err, 422);


    return ReS(res, {data : items});
}
module.exports.get_chats_with_item = get_chats_with_item;

