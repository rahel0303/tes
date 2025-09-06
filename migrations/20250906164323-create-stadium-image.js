'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('StadiumImages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      teamId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      source: {
        type: Sequelize.STRING
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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

    await queryInterface.addIndex('StadiumImages', ['teamId']);
    await queryInterface.addIndex('StadiumImages', ['teamId', 'sortOrder']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('StadiumImages');
  }
};
