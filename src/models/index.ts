import { sequelize, Sequelize } from "@/models/db";

import Guild from "@/models/guild";
import Member from "@/models/member";
import Attendance from "@/models/attendance";

import "./associations";

export default {
  sequelize,
  Sequelize,
  Guild,
  Member,
  Attendance,
};
