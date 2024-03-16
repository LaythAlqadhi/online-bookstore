module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
  });

  Cart.associate = (models) => {
    Cart.belongsTo(models.User);
    Cart.belongsToMany(models.Book, {
      through: 'CartBook',
    });
  };

  return Cart;
};
