const { tbl_chat_messages } = require('../models');
const { tbl_items} = require('../models');
const { tbl_user_accounts } = require('../models');

const { tbl_chat_rooms } = require('../models');
const Sequelize = require('sequelize');
const { to, TE }    = require('../services/util.service');
var models = require('../models');

const limit = 100;


const getUniqueString = function(from_user_id , to_user_id)
{
    if (from_user_id > to_user_id)
    {
        return to_user_id + "_" + from_user_id;
    }
    else
    {
        return from_user_id + "_" +to_user_id;
    }
}

const add_new_message = async function(f_userid, t_userid ,item_id, message){//returns token
    var err, chat_room ,chat_msg;

    var room_info = {from_user_id : f_userid , to_user_id:t_userid, item_id : item_id};

    var unique_str = item_id + "_" + getUniqueString(f_userid,t_userid);

    [err , chat_room] = await  to (tbl_chat_rooms.findOrCreate({where:{room_unique:unique_str} , defaults:room_info}));

    if(err) TE(err.message);

    var nowTime = new Date();
    var updateDateStr = {updateDateStr:String(nowTime)};
    chat_room[0].set(updateDateStr);


    var val;
    [err , val] = await to (chat_room[0].save());

    var room_id = chat_room[0].id;


    var msg_info = {from_user_id:f_userid , to_user_id:t_userid , item_id:item_id,
        room_id : room_id ,type:0, message: message};

    [err , chat_msg] = await to(tbl_chat_messages.create(msg_info));

    if(err) TE(err.message);

    return chat_msg;

}
module.exports.add_new_message = add_new_message;


const update_message = async function(updateInfo , data)
{
    var chat_id = data.chat_id;

    var err ,new_cmsg;

    [err,new_cmsg] = await to(tbl_chat_messages.findOne({where:{id:chat_id}}));

    if (err)
        TE(err.message);

    new_cmsg.set(updateInfo);

    [err ,new_cmsg] = await to(new_cmsg.save());

    if (err)
        TE(err.message);

    return new_cmsg;
}
module.exports.update_message = update_message;

const get_messages_byRoom = async function(req,res){
    var err , msgs , room;

    var from_user_id = req.body.fromUserId;
    var to_user_id = req.body.toUserId;
    var item_id= req.body.itemId;

    var unique_str = item_id + "_" + getUniqueString(from_user_id ,to_user_id);

    [err , room] = await  to(tbl_chat_rooms.findOne({where :{room_unique:unique_str}}));

    if (err)
        TE(err.message);

    if (room == null)
        return [];
    var page = req.body.page;

    var room_id = room.id;
    //TODO sort
    [err, msgs] = await  to (tbl_chat_messages.findAll({
        where : {room_id : room.id},
        limit : limit,
        offset : (page - 1) * limit,
        order : [['createdAt','DESC']],
    }));

    if (err)
        TE(err.message);


     return msgs;

}
module.exports.get_messages_byRoom = get_messages_byRoom;

const get_items_with_chat = async function(request){

    var err, rooms;
    const Op = Sequelize.Op;
    var page = 1;
    if (request.body.page != undefined)
        page = request.body.page;

    var userid = request.decoded.user_id;

    [err , rooms] = await to(tbl_chat_rooms.findAll({
        limit : limit,
        offset : (page - 1) * limit,
        order: [['updatedAt'  ,'DESC']],
        where :{
            [Op.or]: [{
                from_user_id: userid
            },
                {
                    to_user_id : userid}
            ]
        },
        include:
        [
            {
                model: models.tbl_items,
                as : 'item',
		required: true,
                include:[
                    {
                        model:models.tbl_item_images,
                        as :'images',
                        attributes : ['number' , 'image']
                    },
                    {
                        model:models.tbl_user_accounts,
                        as : 'user',
                        attributes:['first_name','last_name','photo']
                    }
                ]
            },
            {
                model: models.tbl_chat_messages,
                as : 'messages',
                order: [['createdAt','DESC']],
                limit : 1
            }
        ],

    }));


    if (err)
        TE(err.message);
    var retItems = [];
    for (var i = 0; i < rooms.length ; i++)
    {
        var room = rooms[i];
        var err , unread_count;
        [err, unread_count]= await to (tbl_chat_messages.count({
            where :
                {room_id : room.id , to_user_id : userid , deliver : 0}
        }));
        if (room.messages.length > 0)
            retItems.push({room:room , unread_cnt:unread_count});
    }

    if (err)
        TE(err.message);
    return retItems;

}
module.exports.get_items_with_chat = get_items_with_chat;




const get_chats_with_item = async function(request){

    var item_id = -1;
    if (request.body.item_id != undefined)
        item_id = request.body.item_id;

    if (item_id == -1)
        TE("Please Send Item Id");

    var page = 1;

    if (request.body.page != undefined)
        page = request.body.page;

    var userid = request.decoded.user_id;

    [err , rooms] = await to(tbl_chat_rooms.findAll({
        group : ["room_unique"],
        limit : limit,
        order: [['updatedAt'  ,'DESC']],
        offset : (page - 1) * limit,
        where :{
            item_id : item_id
        },
        include:
            [
                {
                    model: models.tbl_chat_messages,
                    as : 'messages',
                    order: [['createdAt','DESC']],
                    limit : 1,
                }
            ],
    }));

    if (err)
        TE(err.message);
    var retItems = [];
    for (var i = 0; i < rooms.length ; i++)
    {
        var room = rooms[i];
        var err , unread_count;
        [err, unread_count]= await to (tbl_chat_messages.count({
            where :
                {room_id : room.id , to_user_id : userid , deliver : 0}
        }));

        if (room.messages.length > 0)
        {
            var fromUserId = room.from_user_id;
            var toUserId = room.to_user_id;

            if (userid != fromUserId)
                toUserId = fromUserId;

            var user;
            [err ,user] = await to(tbl_user_accounts.findOne({
                where : {id:toUserId},
                attributes:['id' , 'first_name' , 'last_name' , 'photo']
            }));
            if (err)
                TE(err.message);

            retItems.push({room:room , unread_cnt:unread_count , user:user});
        }




    }

    if (err)
        TE(err.message);
    return retItems;

}
module.exports.get_chats_with_item = get_chats_with_item;