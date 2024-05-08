'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
    }
  }
  user.init({
    userId: DataTypes.STRING,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    chatSectionId: DataTypes.STRING,
    typeLogin: DataTypes.ENUM('Facebook', 'Google', 'Local')
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};