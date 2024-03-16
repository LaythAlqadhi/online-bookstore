const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 25],
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 25],
      },
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Invalid email format.',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8],
      },
      set(value) {
        if (
          !this.getDataValue('password') ||
          this.getDataValue('password') !== value
        ) {
          const hashedPassword = bcrypt.hashSync(value, 10);
          this.setDataValue('password', hashedPassword);
        }
      },
    },
    role: {
      type: DataTypes.ENUM('User', 'Admin'),
      defaultValue: 'User',
    },
  });

  User.associate = (models) => {
    User.hasOne(models.Cart, {
      foreignKey: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    });
    User.hasMany(models.Order, {
      foreignKey: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    });
  };

  User.afterCreate(async (user) => {
    try {
      await sequelize.models.Cart.create({ UserId: user.id });
    } catch (error) {
      console.error('Failed to create cart for user:', error);
    }
  });

  return User;
};
