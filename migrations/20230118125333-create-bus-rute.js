'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bus_rutes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      from: {
        type: Sequelize.STRING
      },
      to: {
        type: Sequelize.STRING
      },
      total_seat: {
        type: Sequelize.INTEGER
      },
      class: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.INTEGER
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bus_rutes');
  }
};