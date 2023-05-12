"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.users, {
        foreignKey: "users_id",
      });
      this.hasMany(models.transaction_detail, {
        foreignKey: "transactions_id",
      });
      this.belongsTo(models.bus, {
        foreignKey: "bus_id",
      });
    }
  }
  transactions.init(
    {
      status: {
        type: DataTypes.STRING,
        defaultValue: "waiting for payment",
        defaultValue: false,
      },

      bus_name: DataTypes.STRING,
      from: DataTypes.STRING,
      to: DataTypes.STRING,
      schedule_date: DataTypes.DATE,
      total_price: DataTypes.INTEGER,
      expired_date: DataTypes.DATE,
      status: DataTypes.STRING,
      invoice: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "transactions",
    }
  );
  return transactions;
};
