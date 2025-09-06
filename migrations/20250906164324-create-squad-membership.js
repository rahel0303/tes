'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SquadMemberships', {
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
      playerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Players',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      season: {
        type: Sequelize.STRING,
        allowNull: false
      },
      position: {
        type: Sequelize.ENUM('GK', 'DF', 'MF', 'FW'),
        allowNull: false
      },
      shirtNumber: {
        type: Sequelize.INTEGER
      },
      isCurrent: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    await queryInterface.addConstraint('SquadMemberships', {
      fields: ['teamId', 'playerId', 'season'],
      type: 'unique',
      name: 'unique_squadmembership_team_player_season'
    });

    await queryInterface.addIndex('SquadMemberships', ['teamId', 'season', 'position']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('SquadMemberships');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_SquadMemberships_position";');
  }
};
