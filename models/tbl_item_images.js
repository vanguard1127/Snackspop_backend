'use strict';
module.exports = (sequelize, DataTypes) => {
  const tbl_item_images = sequelize.define('tbl_item_images', {
    item_id: DataTypes.INTEGER,
    number: DataTypes.INTEGER,
    image: DataTypes.INTEGER
  }, {});
  tbl_item_images.associate = function(models) {
    // associations can be defined here
      tbl_item_images.belongsTo(models.tbl_items , {
        foreignKey : 'item_id',
        as : 'images'
      });


  };
  return tbl_item_images;
};