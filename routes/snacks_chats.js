var express = require('express');
var router = express.Router();
var path = require('path');
const apiConfig         =require('../config/apiConfig');

const ChatController   = require('../controllers/ChatController');


router.use(function(req,res,next){
    return apiConfig.tokenAuthenticate(req,res,next);
});

router.post('/get_messages',
    ChatController.get_messages_byRoom);

router.post('/get_items_with_chat',
    ChatController.get_items_with_chat);

router.post('/get_chats_with_item',
    ChatController.get_chats_with_item);

module.exports = router;
