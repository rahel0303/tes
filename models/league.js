'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class League extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      League.hasMany(models.Team, { foreignKey: 'leagueId' });
    }
  }
  League.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: DataTypes.STRING,
    externalRef: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    logoUrl: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'League',
  });
  return League;
};
