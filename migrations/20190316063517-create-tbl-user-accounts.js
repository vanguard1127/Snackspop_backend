'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tbl_user_accounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      phone_number: {
        type: Sequelize.STRING
      },
      photo: {
        type: Sequelize.INTEGER
      },
      social_token: {
          type: Sequelize.STRING
      },
      device_type: {
        type: Sequelize.INTEGER
      },
      device_id: {
        type: Sequelize.STRING
      },
      country: {
        type: Sequelize.STRING
      },
      county_state_province: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      zip_code: {
        type: Sequelize.INTEGER
      },
      address_line1: {
        type: Sequelize.STRING
      },
      address_line2: {
        type: Sequelize.STRING
      },
      geo_lat: {
        type: Sequelize.STRING
      },
      geo_lng: {
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
    return queryInterface.dropTable('tbl_user_accounts');
  }
};