module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100],
      },
      unique: true,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 25],
      },
    },
    genre: {
      type: DataTypes.ENUM(
        'Mystery',
        'Science',
        'Fantasy',
        'Historical',
        'Romance',
        'Horror',
        'Business',
        'Travel',
        'Other',
      ),
      defaultValue: 'Other',
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM('Available', 'Borrowed', 'Out of Stock'),
      defaultValue: 'Available',
    },
  });

  Book.associate = (models) => {
    Book.belongsToMany(models.Cart, {
      through: 'CartBook',
    });
    Book.belongsTo(models.Order);
  };

  return Book;
};
