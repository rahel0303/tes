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
      // define association here
    }
  }
  Player.init({
    fullName: DataTypes.STRING,
    nationality: DataTypes.STRING,
    primaryPosition: DataTypes.STRING,
    thumbUrl: DataTypes.STRING,
    externalRef: DataTypes.STRING,
    bornAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Player',
  });
  return Player;
};