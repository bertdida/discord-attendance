import Guild from "@/models/guild";
import Member from "@/models/member";
import Attendance from "@/models/attendance";

Member.hasMany(Attendance, {
  foreignKey: "memberId",
  as: "attendances",
});

Guild.hasMany(Attendance, {
  foreignKey: "guildId",
  as: "attendances",
});

Attendance.belongsTo(Guild, {
  foreignKey: "guildId",
  as: "guild",
});

Attendance.belongsTo(Member, {
  foreignKey: "memberId",
  as: "member",
});
