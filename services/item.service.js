const { tbl_items } 	    = require('../models');
const { tbl_item_images} = require('../models');
const { tbl_user_accounts} = require('../models');
const { tbl_chat_messages} = require('../models');

const Sequelize = require('sequelize');
const validator     = require('validator');
const { to, TE }    = require('../services/util.service');
var models = require('../models');

var max_distance = 100000;

const get_items = async function(request){//returns token
	console.log("\n-----get items----");


    let err;
    var geo_lat_param = 0, geo_lng_param =0;
    if (request.body.geo_lat != undefined)
        geo_lat_param = request.body.geo_lat;
    if (request.body.geo_lng != undefined)
        geo_lng_param = request.body.geo_lng;


    var userid = 0;
    if (request.body.me_user_id == undefined)
    {
            userid = -1;
    }
    else {
        userid = request.body.me_user_id;
    }
    if (geo_lat_param == undefined)
        geo_lat_param = 0;
    if (geo_lng_param == undefined)
        geo_lng_param = 0;


    var keyword ="" , sort_type =0 ,price_from =0 , price_to=10000 ,direction_type=0 , page = 1 , limit = 100 ,meFlag = 0;
    if (request.body.keyword != undefined)
        keyword = request.body.keyword;
    if (request.body.sort_type != undefined)
        sort_type = request.body.sort_type;
    if (request.body.price_from != undefined)
        price_from = request.body.price_from;
    if (request.body.price_to != undefined)
        price_to = request.body.price_to;
    if (request.body.direction_type != undefined)
        direction_type = request.body.direction_type;
    if (request.body.page != undefined)
        page = request.body.page;
    if (request.body.limit != undefined)
        limit = request.body.limit;
    if (request.body.user_id != undefined)
        meFlag = request.body.user_id;

    var lat = parseFloat(geo_lat_param);
    var lng = parseFloat(geo_lng_param);
    limit = parseInt(limit);

    var attributes = ['phone_number' ,'email' ,'photo'];
    var distance1 = Sequelize.literal(`6371 * acos(cos(radians(${lat})) * cos(radians(geo_lat)) * cos(radians(${lng}) - radians(geo_lng)) + sin(radians(${lat})) * sin(radians(geo_lat)))`);
    attributes.push([distance1,'distance']);
    //attributes.push([`(6371 * acos(cos(radians(${lat})) * cos(radians(geo_lat)) * cos(radians(${lng}) - radians(geo_lng)) + sin(radians(${lat})) * sin(radians(geo_lat))))`, 'distance']);


    const Op = Sequelize.Op;

    var where_item = {};
    if (meFlag == 0)
        where_item = {[Op.and] : [{item_price : {[Op.gt] : price_from}},
                {item_price : {[Op.lt] : price_to}}],

            [Op.or]: [{
                item_description: {[Op.like] : '%' + keyword + '%' }
            },
                {
                    item_name : {[Op.like] : '%' + keyword + '%' }}
            ],
            user_id : {[Op.eq] : userid}};
    else
        where_item = {[Op.and] : [{item_price : {[Op.gt] : price_from}},
            {item_price : {[Op.lt] : price_to}}],

        [Op.or]: [{
            item_description: {[Op.like] : '%' + keyword + '%' }
        },
            {
                item_name : {[Op.like] : '%' + keyword + '%' }}
        ]
	//,user_id : {[Op.ne] : userid}
	};


    var items;

    if (sort_type ==0) //sorting price
    {

        [err , items] = await to (tbl_items.findAll({
            where : where_item,
            order : [['item_price',direction_type == 0 ? 'ASC' : 'DESC']],
            limit : limit,
            offset : (page - 1)* limit,
            include :[
                {
                    model: models.tbl_user_accounts,
                    as : "user",
                    attributes : attributes,
                    where :Sequelize.and(Sequelize.where(distance1 ,{[Op.lte] : max_distance})),
                },
                {
                    model : models.tbl_item_images,
                    attributes : ['number' , 'image'],
                    as : 'images',

                }
            ]
        }));
    }
    else if (sort_type == 1)//sorting distance
    {

        var str_order = [];
        if (direction_type == 0 )
            str_order.push(Sequelize.literal('`user.distance` DESC'));
        else
            str_order.push(Sequelize.literal('`user.distance` ASC'));
        [err,items] = await  to (tbl_items.findAll({
            where : where_item,
            limit : limit,
            offset : (page - 1)* limit,
            order : str_order,
            include :[
                {
                    model: models.tbl_user_accounts,
                    as : "user",
                    attributes : attributes,
                    where :Sequelize.and(Sequelize.where(distance1 ,{[Op.lte] : max_distance})),

                },
                {
                    model : models.tbl_item_images,
                    attributes : ['number' , 'image'],
                    as : 'images',

                }
            ],
        }));
    }


    return items;

}

const get_my_items = async function(request)
{
    let err;

    var userid = request.decoded.user_id;

    var userinfo;
    [err, userinfo] = await to (tbl_user_accounts.findOne({where : {id : userid}}));

    if (err)
        TE(err.message);

    var keyword ="" , sort_type =0 ,price_from =0 , price_to= 10000 ,direction_type=0 , page = 1 , limit = 100 ,meFlag = 0;
    if (request.body.keyword != undefined)
        keyword = request.body.keyword;
    if (request.body.sort_type != undefined)
        sort_type = request.body.sort_type;
    if (request.body.price_from != undefined)
        price_from = request.body.price_from;
    if (request.body.price_to != undefined)
        price_to = request.body.price_to;
    if (request.body.direction_type != undefined)
        direction_type = request.body.direction_type;
    if (request.body.page != undefined)
        page = request.body.page;
    if (request.body.limit != undefined)
        limit = request.body.limit;




    var attributes = ['phone_number' ,'email' ,'photo'];

    const Op = Sequelize.Op;

    var where_item = {
        [Op.or]: [{
            item_description: {[Op.like] : '%' + keyword + '%' }
        },
            {
                item_name : {[Op.like] : '%' + keyword + '%' }}
        ],
        user_id : {[Op.eq] : userid}};


    var items;
    if (sort_type == 0) //sorting price
    {
        [err , items] = await to (tbl_items.findAll({
            where : where_item,
            order : [['item_price',direction_type == 0 ? 'ASC' : 'DESC']],
            limit : limit,
            offset : (page - 1)* limit,
            include :[
                {
                    model: models.tbl_user_accounts,
                    as : "user",
                    attributes : attributes,
                },
                {
                    model : models.tbl_item_images,
                    attributes : ['number' , 'image'],
                    as : 'images',

                }
            ]
        }));
    }

    return items;
}
module.exports.get_my_items = get_my_items
module.exports.get_items = get_items;



const get_item = async function(id, request){//returns token
    var err, item;

    var geo_lat_param  = 0 ;
    var geo_lng_param  = 0;
    if (request.body.geo_lat != undefined)
        geo_lat_param = request.body.geo_lat;
    if (request.body.geo_lng != undefined)
        geo_lng_param = request.body.geo_lng;


    if (geo_lng_param == null)
    {
        geo_lng_param = "0";
    }
    if (geo_lat_param == null)
    {
        geo_lat_param = "0";
    }
    var lat = parseFloat(geo_lat_param);
    var lng = parseFloat(geo_lng_param);
    var attributes = ['phone_number' ,'email' , 'first_name' , 'last_name' , 'address_line1' , 'address_line2','photo'];
    var distance1 = Sequelize.literal(`6371 * acos(cos(radians(${lat})) * cos(radians(geo_lat)) * cos(radians(${lng}) - radians(geo_lng)) + sin(radians(${lat})) * sin(radians(geo_lat)))`);
    attributes.push([distance1,'distance']);

    [err , item] =await to ( tbl_items.findOne({
        where : {
            id : id
        },
        include :[
            {
                model: models.tbl_user_accounts,
                as : "user",
                attributes : attributes,
            },
            {
                model : models.tbl_item_images,
                attributes : ['number' , 'image'],
                as : 'images',

            }
        ]
    }));

    var item_user_id = item.user_id;
    const Op = Sequelize.Op;
    var items;
    [err, items] = await  to (tbl_items.findAll({
        where : {
            user_id : item_user_id
        },
        include :[
            {
                model : models.tbl_item_images,
                attributes : ['number' , 'image'],
                as : 'images',

            }
        ]

    }));

    if (err)
        TE("Failed to Get Seller Items");

    var jsonArrayData = [];
    var length = items.length;
    for (var i = 0 ; i < length ; i++)
    {
        var item1 = items[i];
        jsonArrayData.push(item1.toJSON());
    }

    var ret = {item : item.toJSON() , items : items};
    return ret;

}
module.exports.get_item = get_item;

const del_item = async function(id, request){//returns token

    var userid = request.decoded.user_id;

    var err,rowDeleted;
    [err, rowDeleted] = await  to (tbl_items.destroy({where : { id : id}}));

    if (err) TE("Failed to Delete Item");

    [err, rowDeleted] =await  to (tbl_item_images.destroy({where : { item_id : id}}));

    if (err) TE("Failed to Delete Item Images");

    return true;

}
module.exports.del_item = del_item;

const get_items_count =  async function(request){

    var userid = request.decoded.user_id;

    let err, user_info;
    [err, user_info] = await to(tbl_user_accounts.findOne({where:{id:userid}}));
    var geo_lat = user_info.geo_lat;
    var geo_lng = user_info.geo_lng;

    if (geo_lat == undefined)
        geo_lat = 0;
    if (geo_lng == undefined)
        geo_lng = 0;

    var keyword ="" , sort_type =0 ,price_from =0 , price_to=10000;
    if (request.body.keyword != undefined)
        keyword = request.body.keyword;
    if (request.body.sort_type != undefined)
        sort_type = request.body.sort_type;
    if (request.body.price_from != undefined)
        price_from = request.body.price_from;
    if (request.body.price_to != undefined)
        price_to = request.body.price_to;

    const Op = Sequelize.Op;

    var count;
    if (sort_type == 0)
    {
        count = tbl_items.count({
            where : {
                [Op.and] : [{item_price : {[Op.gt] : price_from}},
                    {item_price : {[Op.lt] : price_to}}],

                [Op.or]: [{
                    item_description: {[Op.like] : '%' + keyword + '%' }
                },
                    {
                        item_name : {[Op.like] : '%' + keyword + '%' }}
                ],
            }
        });
    }
    else
    {
        count = tbl_items.count({
            where : {
                [Op.and] : [{item_price : {[Op.gt] : price_from}},
                    {item_price : {[Op.lt] : price_to}}],

                [Op.or]: [{
                    item_description: {[Op.like] : '%' + keyword + '%' }
                },
                    {
                        item_name : {[Op.like] : '%' + keyword + '%' }}
                ],
            }
        });
    }

    return count;
}
module.exports.get_items_count = get_items_count;

const add_new_item = async function(req){//returns token
    var err, item;
    var user_id = req.decoded.user_id;
    var itemInfo = { user_id : user_id, item_name : req.body.item_name , item_description : req.body.item_description ,
        item_price : req.body.item_price ,item_unit : req.body.item_price_unit};


    [err , item] = await to(tbl_items.create(itemInfo));

    if(err) TE(err.message);

    var imageArray = req.body.images;

    if (imageArray != undefined)
    {
        var item_id = item.id;
        for (var i = 0 ; i < imageArray.length ; i++)
        {
            var obj = { item_id : item_id,image :imageArray[i].image};
            [err , item] = await to(tbl_item_images.create(obj));
        }
    }
    if(err) TE(err.message);

    return item;

}
module.exports.add_new_item = add_new_item;


const update_item = async function(id, req){//returns token
    var err, item;


    [err, item] = await to(tbl_items.findOne({where:{id:id}}));
    if(err) TE(err.message);
    var data = req.body;
    item.set(data);

    [err, user] = await to(item.save());

    var imageArray = req.body.images;

    if (imageArray != undefined)
    {

        var item_id = item.id;
        [err , ret] = await to(tbl_item_images.destroy({where:{item_id : item_id}}));

        if(err) TE(err.message);

        for (var i = 0 ; i < imageArray.length ; i++)
        {
            var obj = { item_id : item_id,image :imageArray[i].image};
            [err , item] = await to(tbl_item_images.create(obj));
        }
    }

    if(err) TE(err.message);

    return user;



    return item;

}
module.exports.update_item = update_item;

const add_item_images = async function(req){//returns token
    var err, item;
    var userArray = req.body;
    for (var i = 0 ; i < userArray.length ; i++)
    {
        var obj = userArray[i];
        [err , item] = await to(tbl_item_images.create(obj));
    }

    //if(err) TE(err.message);

    return item;

}
module.exports.add_item_images = add_item_images;