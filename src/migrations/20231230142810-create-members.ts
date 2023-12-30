import type Sequelize from "sequelize";

type QueryInterface = Sequelize.QueryInterface;
type Sequelize = typeof Sequelize;

export default {
  up: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    await queryInterface.createTable("Members", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      discordId: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
      },
      discordName: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("Members");
  },
};
