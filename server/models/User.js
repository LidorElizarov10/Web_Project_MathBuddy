const mongoose = require("mongoose");

// Schema = מבנה של מסמך
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  level_a: { type: Number, default: 1 },
  level_b: { type: Number, default: 1 },
  level_c: { type: Number, default: 1 },
  level_d: { type: Number, default: 1 },
});

// יצוא המודל
module.exports = mongoose.model("User", UserSchema);
