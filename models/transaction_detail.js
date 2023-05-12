"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class transaction_detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.transactions, {
        foreignKey: "transactions_id",
      });
    }
  }
  transaction_detail.init(
    {
      seat_number: DataTypes.STRING,
      price: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "transaction_detail",
    }
  );
  return transaction_detail;
};
