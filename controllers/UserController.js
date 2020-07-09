const { tbl_user_accounts }          = require('../models');
const authService       = require('../services/auth.service');
const { to, ReE, ReS }  = require('../services/util.service');

const create = async function(req, res){
    const body = req.body;

    if(!body.unique_key && !body.email && !body.phone_number){
        return ReE(res, 'Please enter an email or phone number to register.');
    } else if(!body.password){
        return ReE(res, 'Please enter a password to register.');
    }else{
        let err, user;

        [err, user] = await to(authService.createUser(body));

        if(err) return ReE(res, err, 422);
        return ReS(res, {message:'Successfully created new user.', user:user.toWeb(), token:user.getJWT()}, 201);
    }
}
module.exports.create = create;

const get = async function(req, res){
    let user = req.user;

    return ReS(res, {user:user.toWeb()});
}
module.exports.get = get;

const update = async function(req, res){
    let err, user;
    [err, user] = await to(authService.update(req));

    if(err){
        if(err.message=='Validation error') err = 'The email address or phone number is already in use';
        return ReE(res, err);
    }
    return ReS(res, {message :'Updated User: '+user.email ,user:user.toWeb()});
}
module.exports.update = update;

const remove = async function(req, res){
    let user, err;
    user = req.user;

    [err, user] = await to(user.destroy());
    if(err) return ReE(res, 'error occured trying to delete user');

    return ReS(res, {message:'Deleted User'}, 204);
}
module.exports.remove = remove;


const login = async function(req, res){
    const body = req.body;
    let err, user;

    [err, user] = await to(authService.authUser(req.body));
    if(err) return ReE(res, err, 422);

    return ReS(res, {token:user.getJWT(), user:user.toWeb()});
}

module.exports.login = login;


const social_login = async function(req, res){
    const body = req.body;
    let err, user;

    [err, user] = await to(authService.authSocialUser(req.body));
    if(err) return ReE(res, err, 422);

    return ReS(res, {token:user.getJWT(), user:user.toWeb()});
}

module.exports.social_login = social_login;

const update_location = async function(req, res)
{
    const body = req.body;

    let err;
    [err] = await to(authService.update_location(req.decoded.user_id,req.body));

    if (err) return ReE(res, err , 423);

    return ReS(res,{success:true});

}

module.exports.update_location = update_location;

const save_geolocation = async function(req, res)
{
    let err;
    [err] = await to(authService.update_location(req.decoded.user_id,req.body));

    if (err) return ReE(res, err , 423);

    return ReS(res,{success:true});

}

module.exports.save_geolocation = save_geolocation;

const forgot_pass = async function(req, res)
{
    let err;
    [err] = await to(authService.forgot_pass(req.body));

    if (err) return ReE(res, err , 423);

    return ReS(res,{success:true});

}

module.exports.forgot_pass = forgot_pass;

const update_pass = async function(req, res)
{
    let err;
    [err] = await to(authService.update_pass(req));

    if (err) return ReE(res, err , 423);

    return ReS(res,{success:true});

}

module.exports.update_pass = update_pass;



const verify = async function(req, res)
{
    let err;
    [err] = await to(authService.verify(req.body));

    if (err) return ReE(res, err , 423);

    return ReS(res, {token:user.getJWT(), user:user.toWeb()});

}

module.exports.verify = verify;


const logOut = async function(req, res)
{
    const body = req.body;
}

module.exports.logOut = logOut;
