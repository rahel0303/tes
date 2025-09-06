'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Player extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Player.belongsToMany(models.Team, {
        through: models.SquadMembership,
        foreignKey: 'playerId',
        otherKey: 'teamId'
      });
    }
  }
  Player.init({
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nationality: DataTypes.STRING,
    primaryPosition: {
      type: DataTypes.ENUM('GK', 'DF', 'MF', 'FW'),
      allowNull: false
    },
    thumbUrl: DataTypes.STRING,
    externalRef: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    bornAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Player',
  });
  return Player;
};
