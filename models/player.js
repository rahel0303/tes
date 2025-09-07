'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Player extends Model {
    static associate(models) {
      Player.belongsTo(models.Team, {
        foreignKey: 'teamId',
        as: 'team',
      });
    }
  }

  Player.init(
    {
      fullName: { type: DataTypes.STRING, allowNull: false },
      nationality: DataTypes.STRING,
      primaryPosition: DataTypes.STRING,
      thumbUrl: DataTypes.STRING,
      externalRef: { type: DataTypes.STRING, allowNull: false, unique: true },
      bornAt: DataTypes.DATE,
      teamId: {
        type: DataTypes.INTEGER,
        references: { model: 'Teams', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      shirtNumber: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Player',
      tableName: 'Players',
    }
  );

  return Player;
};
