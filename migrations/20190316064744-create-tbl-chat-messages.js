'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tbl_chat_messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      message: {
          type: Sequelize.STRING
      },
      type: {
        type: Sequelize.INTEGER
      },
      room_id: {
          type: Sequelize.INTEGER
      },
      from_user_id: {
          type: Sequelize.INTEGER
      },
      to_user_id: {
          type: Sequelize.INTEGER
      },
      item_id: {
          type: Sequelize.INTEGER
      },
      deliver: {
          type: Sequelize.INTEGER
      },
      file_path: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('tbl_chat_messages');
  }
};