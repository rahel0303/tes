'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SquadMembership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SquadMembership.belongsTo(models.Team, { foreignKey: 'teamId' });
      SquadMembership.belongsTo(models.Player, { foreignKey: 'playerId' });
    }
  }
  SquadMembership.init({
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Teams',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Players',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    season: {
      type: DataTypes.STRING,
      allowNull: false
    },
    position: {
      type: DataTypes.ENUM('GK', 'DF', 'MF', 'FW'),
      allowNull: false
    },
    shirtNumber: DataTypes.INTEGER,
    isCurrent: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'SquadMembership',
  });
  return SquadMembership;
};
