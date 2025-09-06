'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Teams', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      leagueId: {
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      shortName: {
        type: Sequelize.STRING
      },
      badgeUrl: {
        type: Sequelize.STRING
      },
      logoUrl: {
        type: Sequelize.STRING
      },
      foundedYear: {
        type: Sequelize.INTEGER
      },
      country: {
        type: Sequelize.STRING
      },
      stadiumName: {
        type: Sequelize.STRING
      },
      stadiumCity: {
        type: Sequelize.STRING
      },
      stadiumCapacity: {
        type: Sequelize.INTEGER
      },
      externalRef: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      lastSyncedAt: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('Teams');
  }
};