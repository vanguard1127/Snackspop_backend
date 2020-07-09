var express = require('express');
var router = express.Router();
const ItemController   = require('../controllers/ItemController');

const apiConfig         =require('../config/apiConfig');

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});
/*router.use(function(req,res,next){
    return apiConfig.tokenAuthenticate(req,res,next);
});*/
router.post('/get_items', ItemController.get_items);

router.post('/get_my_items',function(req,res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
}, ItemController.get_my_items);

router.post('/get_items_count',function(req,res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
}, ItemController.get_items_count);
router.post('/add_new_item',function(req,res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
}, ItemController.add_new_item);
router.post('/add_item_images', function(req,res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
},ItemController.add_item_images);
router.put('/update_item/:id',function(req,res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
}, function(req,res,next){
    ItemController.update_item(req.params.id,req,res);
});
router.delete('/del_item/:id',function(req,res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
}, function(req ,res, next){
    var id = req.params.id;
    ItemController.del_item(id, req ,res);
});
router.post('/get_item/:id', function(req ,res, next){
    var id = req.params.id;
    ItemController.get_item(id, req ,res);
});

module.exports = router;