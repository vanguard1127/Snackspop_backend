const itemService       = require('../services/item.service');
const chatService       = require('../services/chat.service');
const { to, ReE, ReS }  = require('../services/util.service');

const get_items = async function(req, res){
    let err, items;

    [err, items] = await to(itemService.get_items(req));
    if(err) return ReE(res, err, 422);

    var jsonArrayData = [];
    var length = items.length;
    for (var i = 0 ; i < length ; i++)
    {
        var item = items[i];
        jsonArrayData.push(item.toJSON());
    }
    return ReS(res, {length : length , data : jsonArrayData});
}
module.exports.get_items = get_items;


const get_my_items = async function(req, res){
    let err, items;

    [err, items] = await to(itemService.get_my_items(req));
    if(err) return ReE(res, err, 422);

    var jsonArrayData = [];
    var length = items.length;
    for (var i = 0 ; i < length ; i++)
    {
        var item = items[i];
        jsonArrayData.push(item.toJSON());
    }
    return ReS(res, {length : length , data : jsonArrayData});
}
module.exports.get_my_items = get_my_items;

const get_item = async function(id, req, res){
    let err, item;

    [err, item] = await to(itemService.get_item(id,req ,res));
    if(err) return ReE(res, err, 422);

    return ReS(res, { data : item});
}
module.exports.get_item = get_item;

const del_item = async function(id, req, res){
    let err, item;

    [err, item] = await to(itemService.del_item(id,req ,res));
    if(err) return ReE(res, err, 422);

    return ReS(res, { success:true});
}
module.exports.del_item = del_item;

const get_items_count = async function(req, res){
    let err, count;

    [err ,count]= await to(itemService.get_items_count(req));
    //count = itemService.get_items_count(req);
    return ReS(res, {count : count });
}

module.exports.get_items_count = get_items_count;


const add_new_item = async function(req, res){
    let err, item;

    [err, item] = await to(itemService.add_new_item(req));
    if(err) return ReE(res, err, 422);

    return ReS(res, {success : true , fail_reason : "" , item_id : item.id});
}

module.exports.add_new_item = add_new_item;
const update_item = async function(item_id,req, res){
    let err, item;

    [err, item] = await to(itemService.update_item(item_id ,req));
    if(err) return ReE(res, err, 422);

    return ReS(res, {type : 0 , fail_reason : "" , item_id : item.id});
}

module.exports.update_item = update_item;
const add_item_images = async function(req, res){
    let err, item;

    [err, item] = await to(itemService.add_item_images(req));
    if(err) return ReE(res, err, 422);

    return ReS(res, {type : 0 , fail_reason : "" , item_id : item.id});
}

module.exports.add_item_images = add_item_images;