const SuperAdmin = require("../Models/superAdminModel");
const Admin = require("../Models/adminModel");


exports.findSameUsername = async (username) => {
  try {
    if (!username) throw new Error("username is required");

    const queries = [
      SuperAdmin.findOne({ username }).lean(),
      Admin.findOne({ username }).lean(),
    ];

    const results = await Promise.all(queries);

    if (results.some((result) => result)) {
      return { message: "username already exists", exists: true };
    }

    return { message: "username is available", exists: false };
  } catch (error) {
    console.error("Error finding username:", error.message);
    throw new Error("An error occurred while checking username availability.");
  }
};
