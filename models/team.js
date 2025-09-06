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
      Team.belongsTo(models.League, { foreignKey: 'leagueId' });
      Team.hasMany(models.StadiumImage, { foreignKey: 'teamId' });
      Team.belongsToMany(models.Player, {
        through: models.SquadMembership,
        foreignKey: 'teamId',
        otherKey: 'playerId'
      });
      Team.belongsToMany(models.User, {
        through: models.Favorite,
        foreignKey: 'teamId',
        otherKey: 'userId'
      });
    }
  }
  Team.init({
    leagueId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Leagues',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    shortName: DataTypes.STRING,
    badgeUrl: DataTypes.STRING,
    logoUrl: DataTypes.STRING,
    foundedYear: DataTypes.INTEGER,
    country: DataTypes.STRING,
    stadiumName: DataTypes.STRING,
    stadiumCity: DataTypes.STRING,
    stadiumCapacity: DataTypes.INTEGER,
    externalRef: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: DataTypes.TEXT,
    lastSyncedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Team',
  });
  return Team;
};
