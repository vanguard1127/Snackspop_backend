'use strict';
const bcrypt         = require('bcrypt');
const bcrypt_p       = require('bcrypt-promise');
const jwt            = require('jsonwebtoken');
const {TE, to}       = require('../services/util.service');
const CONFIG         = require('../config/config');

module.exports = (sequelize, DataTypes) => {
  const tbl_user_accounts = sequelize.define('tbl_user_accounts', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: { type: DataTypes.STRING, allowNull : true , uniqure : true , validate : {isEmail : {msg : "Email invalid."}}},
    password: DataTypes.STRING,
    phone_number: {
        type : DataTypes.STRING, allowNull: true
        },
    photo: DataTypes.STRING,
    social_token: DataTypes.STRING,
    device_type: DataTypes.INTEGER,
    device_id: DataTypes.STRING,
    country: DataTypes.STRING,
    county_state_province: DataTypes.STRING,
    city: DataTypes.STRING,
    zip_code: DataTypes.INTEGER,
    address_line1: DataTypes.STRING,
    address_line2: DataTypes.STRING,
    geo_lat: DataTypes.STRING,
    geo_lng: DataTypes.STRING
  }, {});
  tbl_user_accounts.associate = function(models) {
    // associations can be defined here
      tbl_user_accounts.hasMany(models.tbl_items,{
          foreignKey : 'user_id' ,
          as : 'items'
      });

  };

    tbl_user_accounts.beforeSave(async (user, options) => {
        let err;
        if (user.changed('password')){
            let salt, hash
            [err, salt] = await to(bcrypt.genSalt(10));
            if(err) TE(err.message, true);

            [err, hash] = await to(bcrypt.hash(user.password, salt));
            if(err) TE(err.message, true);

            user.password = hash;
        }
    });


    /*tbl_user_accounts.beforeBulkUpdate(async (user, options) => {
        console.log("BeforeUpdate");
        let err;
        //if (user.changed('password')){
            let salt, hash
            [err, salt] = await to(bcrypt.genSalt(10));
            if(err) TE(err.message, true);

            [err, hash] = await to(bcrypt.hash(user.attributes.password, salt));
            //[err, hash] = await to(bcrypt.hash(user.password, salt));
            if(err) TE(err.message, true);

            user.attributes.password = hash;
            //user.password = hash;
        //}
    });*/
    tbl_user_accounts.prototype.comparePassword = async function (pw) {
        let err, pass;
        if(!this.password) TE('password not set');

        [err, pass] = await to(bcrypt_p.compare(pw, this.password));
        if(err) TE(err);

        if(!pass) TE('Invalid password');

        return this;
    }

    tbl_user_accounts.prototype.getJWT = function () {
        let expiration_time = parseInt(CONFIG.jwt_expiration);
        //return jwt.sign({user_id:this.id}, CONFIG.jwt_encryption, {expiresIn: expiration_time});
        return jwt.sign({user_id:this.id}, CONFIG.jwt_encryption);
    };

    tbl_user_accounts.prototype.toWeb = function () {
        let json = this.toJSON();
        return json;
    };


  return tbl_user_accounts;
};