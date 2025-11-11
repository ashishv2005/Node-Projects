// models/index.js
import User from "./User.js";
import Student from "./Student.js";

// Optional linking: a User (student account) can be linked to a Student record
User.hasOne(Student, { foreignKey: "userId", onDelete: "SET NULL" });
Student.belongsTo(User, { foreignKey: "userId" });

export { User, Student };
