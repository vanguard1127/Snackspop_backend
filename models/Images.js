'use strict';
module.exports = (sequelize, DataTypes) => {
    const Images = sequelize.define('Images', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        path: DataTypes.STRING,
        original_fn: DataTypes.STRING,
    }, {});
    Images.associate = function(models) {
        // associations can be defined here

    };

    return Images;
};