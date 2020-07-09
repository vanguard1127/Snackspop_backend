const { Images } 	    = require('../models');

const Sequelize = require('sequelize');
const validator     = require('validator');
const { to, TE }    = require('../services/util.service');
var models = require('../models');

const save_file = async function(path, original_fn){//returns token
    var err, item;
    var itemInfo = { path: path , original_fn : original_fn};
    [err , item] = await to(Images.create(itemInfo));
    if(err) TE(err.message);
    return item;

}
module.exports.save_file = save_file;


const get_file = async function(fileid){//returns token
    var err, item;

    [err , item] = await to(Images.findOne({where:{id: fileid}}));

    if(err) TE(err.message);

    return item;

}
module.exports.get_file = get_file;

