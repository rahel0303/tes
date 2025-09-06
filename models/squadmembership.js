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
      // define association here
    }
  }
  SquadMembership.init({
    teamId: DataTypes.INTEGER,
    playerId: DataTypes.INTEGER,
    season: DataTypes.STRING,
    position: DataTypes.STRING,
    shirtNumber: DataTypes.INTEGER,
    isCurrent: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'SquadMembership',
  });
  return SquadMembership;
};