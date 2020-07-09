'use strict';
module.exports = (sequelize, DataTypes) => {
  const tbl_chat_rooms = sequelize.define('tbl_chat_rooms', {
    from_user_id: DataTypes.INTEGER,
    to_user_id: DataTypes.INTEGER,
    item_id: DataTypes.INTEGER,
    room_unique:DataTypes.STRING,
    updateDateStr:DataTypes.STRING
  }, {});
  tbl_chat_rooms.associate = function(models) {
    // associations can be defined here
      tbl_chat_rooms.belongsTo(models.tbl_items ,{
          foreignKey: 'item_id',
          as : 'item'
      });

      tbl_chat_rooms.hasMany(models.tbl_chat_messages ,{
          foreignKey: 'room_id',
          as : 'messages'
      });
  };
  return tbl_chat_rooms;
};