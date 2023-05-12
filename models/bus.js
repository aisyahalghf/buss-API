"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class bus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.bus_rute, {
        foreignKey: "bus_id",
      });
      this.hasMany(models.transactions, {
        foreignKey: "bus_id",
      });
    }
  }
  bus.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "bus",
    }
  );
  return bus;
};
