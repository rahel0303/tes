'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Players', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nationality: {
        type: Sequelize.STRING,
      },
      primaryPosition: {
        type: Sequelize.STRING,
      },
      thumbUrl: {
        type: Sequelize.STRING,
      },
      externalRef: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      bornAt: {
        type: Sequelize.DATE,
      },
      teamId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Teams',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      shirtNumber: {
        type: Sequelize.STRING,
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Players');
  },
};
