'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    static associate(models) {
      Team.belongsTo(models.League, { foreignKey: 'leagueId' });
      Team.hasMany(models.StadiumImage, {
        foreignKey: 'teamId',
        as: 'stadiumImages',
      });
      Team.hasMany(models.Player, {
        foreignKey: 'teamId',
        as: 'players',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });

      Team.belongsToMany(models.User, {
        through: models.Favorite,
        foreignKey: 'teamId',
        otherKey: 'userId',
        as: 'fans',
      });
    }
  }

  Team.init(
    {
      leagueId: {
        type: DataTypes.INTEGER,
        references: { model: 'Leagues', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      name: { type: DataTypes.STRING, allowNull: false },
      shortName: DataTypes.STRING,
      logoUrl: DataTypes.STRING,
      foundedYear: DataTypes.INTEGER,
      country: DataTypes.STRING,
      stadiumName: DataTypes.STRING,
      stadiumCity: DataTypes.STRING,
      stadiumCapacity: DataTypes.INTEGER,
      externalRef: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: DataTypes.TEXT,
      lastSyncedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Team',
      tableName: 'Teams',
    }
  );

  return Team;
};
