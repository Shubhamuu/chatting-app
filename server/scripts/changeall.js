import { MONGO_URI } from "../src/constants/getenv.js";
import mongoose from "mongoose";
import User from "../src/models/user.js";
import bcrypt from "bcryptjs";
await mongoose.connect(MONGO_URI);


const updateAllPasswords = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");

    const newPassword = "password";

    // hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update all users
    const result = await User.updateMany(
      {},
      {
        $set: {
          password: hashedPassword,
        },
      }
    );

    console.log("Passwords updated successfully");
    console.log("Matched:", result.matchedCount);
    console.log("Modified:", result.modifiedCount);

    await mongoose.disconnect();

  } catch (error) {
    console.error(error);
  }
};

updateAllPasswords();