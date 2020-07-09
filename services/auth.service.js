const { tbl_user_accounts } 	    = require('../models');
const validator     = require('validator');
const bcrypt         = require('bcrypt');
const bcrypt_p       = require('bcrypt-promise');
const nodemailer     = require('nodemailer');
const { to, TE }    = require('../services/util.service');
var rand = require('csprng');

const getUniqueKeyFromBody = function(body){// this is so they can send in 3 options unique_key, email, or phone and it will work
    let unique_key = body.unique_key;
    if(typeof unique_key==='undefined'){
        if(typeof body.email != 'undefined'){
            unique_key = body.email
        }else if(typeof body.phone_number != 'undefined'){
            unique_key = body.phone_number
        }else{
            unique_key = null;
        }
    }

    return unique_key;
}

module.exports.getUniqueKeyFromBody = getUniqueKeyFromBody;

const createUser = async (userInfo) => {
    let unique_key, auth_info, err;

    auth_info={};
    auth_info.status='create';

    unique_key = getUniqueKeyFromBody(userInfo);
    if(!unique_key) TE('An email or phone number was not entered.');


    if(validator.isEmail(unique_key)){
        auth_info.method = 'email';
        userInfo.email = unique_key;

        [err, user] = await to(tbl_user_accounts.create(userInfo));
        if(err) TE(err.message);

        return user;

    }else if(validator.isMobilePhone(unique_key, 'any')){//checks if only phone number was sent
        auth_info.method = 'phone';
        userInfo.phone = unique_key;

        [err, user] = await to(tbl_user_accounts.create(userInfo));
        if(err) TE('user already exists with that phone number');

        return user;
    }else{
        TE('A valid email or phone number was not entered.');
    }
}
module.exports.createUser = createUser;

const authUser = async function(userInfo){//returns token
    let unique_key;
    let auth_info = {};
    auth_info.status = 'login';
    unique_key = getUniqueKeyFromBody(userInfo);

    if(!unique_key) TE('Please enter an email or phone number to login');


    if(!userInfo.password) TE('Please enter a password to login');

    let user;
    if(validator.isEmail(unique_key)){
        auth_info.method='email';

        [err, user] = await to(tbl_user_accounts.findOne({where:{email:unique_key}}));
        if(err) TE(err.message);

    }else if(validator.isMobilePhone(unique_key, 'any')){//checks if only phone number was sent
        auth_info.method='phone';

        [err, user] = await to(tbl_user_accounts.findOne({where:{phone_number:unique_key }}));
        if(err) TE(err.message);

    }else{
        TE('A valid email or phone number was not entered');
    }

    if(!user) TE('Not registered');

    [err, user] = await to(user.comparePassword(userInfo.password));

    if(err) TE(err.message);

    return user;

}
module.exports.authUser = authUser;


const authSocialUser = async function(userInfo){//returns token

    let auth_info = {};
    auth_info.status = 'socail_login';

    var social_token = userInfo.social_token;
	console.log("\nSocial_Token = " + social_token);

    if (!social_token)
        TE('Please Take Social Token');

	console.log("\n User Info =  "  + userInfo.email + "  " +  userInfo.first_name + "  " + userInfo.last_name + "  " +  userInfo.device_id + "  " + userInfo.device_type);
    /*let err, user;
      [err , user] = await  to (tbl_user_accounts.findOrCreate({where : {social_token : social_token} ,
            defaults:{email:userInfo.email,password:""}}));*/


	[err,user] = await to (tbl_user_accounts.findOne({where : {social_token : social_token}}));

	console.log("User = " + user);

	if (err)
		TE('Social Login Failed');

	if (user == null )
	{
		var error2 , user2;
		[error2, user2] = await to (tbl_user_accounts.findOne({where : {email : userInfo.email}}));
		
		if (user2 == null)
		{
			var error1 , user1;
			[err1,user1] = await to (tbl_user_accounts.create({email:userInfo.email, first_name:userInfo.first_name, last_name:userInfo.last_name, device_id:userInfo.device_id,
                	social_token:userInfo.social_token, device_type:userInfo.device_type , password:""}));
			if (err1)
				TE("iiii");
			console.log("User = " + user1);
			return user1;
		}
		else
		{
			return user2;
		}
	}
	else{
		    return user;

	}

	

}
module.exports.authSocialUser = authSocialUser;

const update = async  function(req)
{
    var err, user;
    var user_id = req.decoded.user_id;

    [err, user] = await to(tbl_user_accounts.findOne({where:{id:user_id}}));

    var data = req.body;
    user.set(data);

    [err, user] = await to(user.save());

    if(err) TE(err.message);

    return user;
}

module.exports.update = update;

const forgot_pass = async function(userInfo){//returns token
    let unique_key;
    let auth_info = {};
    auth_info.status = 'login';
    unique_key = getUniqueKeyFromBody(userInfo);

    if(!unique_key) TE('Please enter an email or phone number to login');

    let user;
    if(validator.isEmail(unique_key)){
        auth_info.method='email';

        [err, user] = await to(tbl_user_accounts.findOne({where:{email:unique_key}}));
        if(err) TE(err.message);

    }else if(validator.isMobilePhone(unique_key, 'any')){//checks if only phone number was sent
        auth_info.method='phone';

        [err, user] = await to(tbl_user_accounts.findOne({where:{phone_number:unique_key }}));
        if(err) TE(err.message);

    }else{
        TE('A valid email or phone number was not entered');
    }

    if(!user) TE('Not registered');

    var new_pass = generateRandom();

    var data = {password : String(new_pass)};
    user.set(data);
	console.log("new pass = ");
	console.log(new_pass);
    [err, user] = await to(user.save());

    if(err) TE(err.message);

    //[err, user] = await to(user.comparePassword(userInfo.password));

    //if(err) TE(err.message);

    //if (err) TE("fail to reset password");

    return await sendMesseage(String(new_pass),user.email);

    
}
module.exports.forgot_pass = forgot_pass;

const generateRandom = function()
{
    var number = rand(24, 24);
    //var number = Math.floor((Math.random() * 1000) + 100);
    return number;
}
const sendMesseage =async function(new_pass, email)
{

    let smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user:'snackspop1@gmail.com',
            pass:'snackspop@123'
        }
    });
    var mailOptions = {
        from: "snackspop1@gmail.com",
        to: email,
        subject: "SnacksPop Forgot Password",
        text: "Hello " + email + ".  your new Password is " + new_pass + ".\nRegards,\n Snackspop",
    }

    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.log("error = " + error);
            return false;
        } else {
            //utils_services.prepareSuccessResponse(seller, "Check your Email and enter the verification code to reset your Password", res)
            return true;
        }
    });




}
const verify = async function(userInfo){//returns token

    let unique_key;
    let auth_info = {};
    auth_info.status = 'verify';
    let verify_code = userInfo.verify_code;


    unique_key = getUniqueKeyFromBody(userInfo);

    if(validator.isEmail(unique_key)){
        auth_info.method='email';

        [err, user] = await to(tbl_user_accounts.findOne({where:{email:unique_key}}));
        if(err) TE(err.message);

    }

    return [null,user];

}
module.exports.verify = verify;

const update_pass = async function(req){//returns token

    var user_id = req.decoded.user_id;

    [err , user1] = await to(tbl_user_accounts.update({password : req.body.password } ,{where : {id : user_id}}));
    if (err) TE("fail to reset password");

    return user1;

}
module.exports.update_pass = update_pass;

const update_location = async function(user_id,userInfo){//returns token
    let unique_key;
    let auth_info = {};
    auth_info.status = 'update_location';

    [err , user] = await to(tbl_user_accounts.update(userInfo , {where : {id : user_id} }));

    if(err) TE(err.message);

    return user;

}
module.exports.update_location = update_location;

const save_geoLocation = async function(user_id ,info){//returns token

    [err , user] = await to(tbl_user_accounts.update(info , {where : {id : user_id} }));

    if(err) TE(err.message);

    return user;

}
module.exports.save_geoLocation = save_geoLocation;