import type Sequelize from "sequelize";

type QueryInterface = Sequelize.QueryInterface;
type Sequelize = typeof Sequelize;

export default {
  up: async (queryInterface: QueryInterface, Sequelize: Sequelize) => {
    await queryInterface.createTable("Attendances", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      guildId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: "cascade",
        references: {
          model: "Guilds",
          key: "id",
        },
      },
      memberId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: "cascade",
        references: {
          model: "Members",
          key: "id",
        },
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM("IN", "OUT"),
      },
      note: {
        allowNull: true,
        type: Sequelize.TEXT("long"),
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
    await queryInterface.dropTable("Attendances");
  },
};
