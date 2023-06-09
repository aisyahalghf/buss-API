"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class bus_rute extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.bus, {
        foreignKey: "bus_id",
      });
    }
  }
  bus_rute.init(
    {
      from: DataTypes.STRING,
      to: DataTypes.STRING,
      total_seat: DataTypes.INTEGER,
      class: DataTypes.STRING,
      price: DataTypes.INTEGER,
      schedule_date: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "bus_rute",
    }
  );
  return bus_rute;
};
