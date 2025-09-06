'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Players', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nationality: {
        type: Sequelize.STRING
      },
      primaryPosition: {
        type: Sequelize.ENUM('GK', 'DF', 'MF', 'FW'),
        allowNull: false
      },
      thumbUrl: {
        type: Sequelize.STRING
      },
      externalRef: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      bornAt: {
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
    await queryInterface.dropTable('Players');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Players_primaryPosition";');
  }
};
