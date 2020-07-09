var jwt    = require('jsonwebtoken'), // used to create, sign, and verify tokens
    config = require('./config.js')
var response = function (body, isSuccess, message) {
    return {
        success: isSuccess,
        message: message ? message : "No specified message",
        data: body
    }
}
module.exports = {
    response : response,

    tokenAuthenticate: function(req, res, next,callback) {
        // check header or url parameters or post parameters for token
        var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.token;
        // console.log("Token Provided to tokenAuthenticate : " + req);
        // console.log(req.headers.token);
        // decode token
        if (token) {

            // verifies secret and checks exp
            jwt.verify(token, config.jwt_encryption, function(err, decoded) {
                // console.log(token)
                // console.log(config.tokenSecret);
                if (err) {
                    //console.log("error");
                    //console.log(err)
                    return res.json(response({}, false, "Failed to authenticate token"));
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    next();
                }
            });

        } else {

            // if there is no token
            // return an error
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });

        }
    }
}