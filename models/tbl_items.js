'use strict';
module.exports = (sequelize, DataTypes) => {
  const tbl_items = sequelize.define('tbl_items', {
    user_id: DataTypes.INTEGER,
    item_name: DataTypes.STRING,
    item_description: DataTypes.STRING,
    item_price: DataTypes.DOUBLE,
    item_unit: DataTypes.STRING,
    created_date: DataTypes.DATE
  }, {});
  tbl_items.associate = function(models) {
    // associations can be defined here
      tbl_items.hasMany(models.tbl_item_images,{
        foreignKey : 'item_id' ,
          as : 'images'
      });

      tbl_items.belongsTo(models.tbl_user_accounts, {
            foreignKey : 'user_id',
            as : 'user'
      });

      tbl_items.hasMany(models.tbl_chat_rooms ,{
            foreignKey: 'item_id',
            as : 'chat_rooms'
      });

  };

    tbl_items.prototype.toWeb = function () {
        let json = this.toJSON();
        return json;
    };
  return tbl_items;
};