import mongoose from "mongoose";
import validator from "validator";
import argon2 from "argon2";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [4, "User name should be at least 4 characters"],
    maxLength: [40, "User name should not exceed 40 characters"],
    required: [true, "User name is required"],
    trim: true,
  },
  imageUrl: String,
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "Password must be at least 8 characters long"],
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "editor", "admin"],
    default: "user",
  },
  signedUpAt: {
    type: Date,
    default: Date.now,
  },
  passwordChangedDate: {
    type: Date,
    select: false,
  },
  verifed: {
    type: Boolean,
    default: false,
    select: false,
  },
});

// Pre-save middleware to hash the password and track password changes
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // Hash the password with Argon2
    this.password = await argon2.hash(this.password);
  }

  // Update passwordChangedDate if the password is modified and the document is not new
  if (this.isModified("password") && !this.isNew) {
    this.passwordChangedDate = Date.now();
  }

  next();
});

userSchema.method({
  // we don't use this.password cause we made select false in this field by default
  async isPasswordMatch(userPassword, candidatePassword) {
    return argon2.verify(userPassword, candidatePassword);
  },
});

// Ensure the model isn't recompiled on hot reload in Next.js
const User = mongoose?.models?.User || mongoose.model("User", userSchema);

export default User;
