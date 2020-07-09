
const FileService       = require('../services/file.service');
const { to, ReE, ReS }  = require('../services/util.service');

const save_file = async function(path, original_fn , req, res){
    let err, items;

    [err, items] = await to(FileService.save_file(path, original_fn));

    console.log("items" + items);
    if(err) return ReE(res, err, 422);

    return items;//ReS(res, {success : true});
}
module.exports.save_file = save_file;


const get_file = async function(id ,req, res){
    let err, items;

    [err, items] = await to(FileService.get_file(id));
    if(err) return ReE(res, err, 422);

    return items;
    //return ReS(res, {success : true});
}
module.exports.get_file = get_file;