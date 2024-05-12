import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  user: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  permission: {
    type: Number,
    required: true,
  },
  todos: [String],
  created_at: {
    type: Date,
    default: Date.now(),
    required: true,
  },
});

const User = mongoose.model("User", userSchema)

export default User
