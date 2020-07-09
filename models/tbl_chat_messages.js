'use strict';
module.exports = (sequelize, DataTypes) => {
  const tbl_chat_messages = sequelize.define('tbl_chat_messages', {
    message:DataTypes.STRING,
    type: DataTypes.INTEGER,
    room_id : DataTypes.INTEGER,
    from_user_id: DataTypes.INTEGER,
    to_user_id : DataTypes.INTEGER,
    item_id: DataTypes.INTEGER,
    deliver :{
      type : DataTypes.INTEGER,
      default: 0
    },
    file_path: DataTypes.STRING
  }, {});
  tbl_chat_messages.associate = function(models) {
    // associations can be defined here
      tbl_chat_messages.belongsTo(models.tbl_chat_rooms ,{
          foreignKey: 'room_id',
          as : 'room'
      });
  };

tbl_chat_messages.prototype.toWeb = function () {
    let json = this.toJSON();
    return json;
};

  return tbl_chat_messages;
};