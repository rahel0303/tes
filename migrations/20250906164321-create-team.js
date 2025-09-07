'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Teams', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      leagueId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Leagues',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      shortName: {
        type: Sequelize.STRING,
      },
      logoUrl: {
        type: Sequelize.STRING,
      },
      foundedYear: {
        type: Sequelize.INTEGER,
      },
      country: {
        type: Sequelize.STRING,
      },
      stadiumName: {
        type: Sequelize.STRING,
      },
      stadiumCity: {
        type: Sequelize.STRING,
      },
      stadiumCapacity: {
        type: Sequelize.INTEGER,
      },
      externalRef: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
      },
      lastSyncedAt: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('Teams', ['leagueId']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Teams');
  },
};
