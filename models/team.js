'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Team.init({
    leagueId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    shortName: DataTypes.STRING,
    badgeUrl: DataTypes.STRING,
    logoUrl: DataTypes.STRING,
    foundedYear: DataTypes.INTEGER,
    country: DataTypes.STRING,
    stadiumName: DataTypes.STRING,
    stadiumCity: DataTypes.STRING,
    stadiumCapacity: DataTypes.INTEGER,
    externalRef: DataTypes.STRING,
    description: DataTypes.TEXT,
    lastSyncedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Team',
  });
  return Team;
};