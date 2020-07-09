var express = require('express');
var router = express.Router();

const UserController   = require('../controllers/UserController');
const passport         = require('passport');
const path              = require('path');
const apiConfig         =require('../config/apiConfig');
const CONFIG = require('../config/config');

/* GET users listing. */


router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', UserController.create);
router.post('/signin', UserController.login);
router.post('/social_signin', UserController.social_login);
router.post('/forgotpass',UserController.forgot_pass);
router.post('/verify',UserController.verify);


router.put('/updatepass',function(req,res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
},UserController.update_pass);

router.put('/update',function(req,res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
},UserController.update);



router.post('/update_location', function(req,res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
},UserController.update_location);

router.post('/logout', function(req,res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
}, UserController.logOut);

router.post('/save_geolocation', function(req,res, next) {
    apiConfig.tokenAuthenticate(req, res, next);
}, UserController.save_geolocation);



module.exports = router;
