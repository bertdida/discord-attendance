import type Sequelize from "sequelize";

type QueryInterface = Sequelize.QueryInterface;
type Sequelize = typeof Sequelize;

export default {
  up: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    await queryInterface.addColumn("Attendances", "date", {
      allowNull: false,
      type: Sequelize.DATE,
    });
  },
  down: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    await queryInterface.removeColumn("Attendances", "date");
  },
};
