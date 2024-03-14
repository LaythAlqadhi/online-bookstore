module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100],
      },
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
      type: DataTypes.ENUM(
        'Available',
        'Borrowed',
        'Out of Stock'
      ),
      defaultValue: 'Available',
    }
  });
  
  Book.associate = (models) => {
    Book.belongsToMany(models.User, { through: models.Cart });
  };

  return Book;
};
