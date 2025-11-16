import mongoose from "mongoose";
import validator from "validator";
import argon2 from "argon2";

const addressSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      minlength: 2,
      maxlength: 40,
      match: [/^[A-Za-z\s'-]{2,40}$/, "Please enter a valid first name"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minlength: 2,
      maxlength: 40,
      match: [/^[A-Za-z\s'-]{2,40}$/, "Please enter a valid last name"],
    },
    companyName: {
      type: String,
      default: "",
    },
    streetAddress: {
      type: String,
      required: [true, "Street address is required"],
      minlength: 5,
      maxlength: 100,
      match: [
        /^[A-Za-z0-9\s,'-]{5,100}$/,
        "Please enter a valid street address",
      ],
    },
    apartment: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      required: [true, "City is required"],
      minlength: 2,
      maxlength: 60,
      match: [/^[A-Za-z\s'-]{2,60}$/, "Please enter a valid city"],
    },
    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      minlength: 4,
      maxlength: 10,
      match: [/^[0-9A-Za-z\s-]{4,10}$/, "Please enter a valid postal code"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      minlength: 2,
      maxlength: 60,
      match: [/^[A-Za-z\s'-]{2,60}$/, "Please enter a valid country"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\+?[0-9]{10,15}$/, "Please enter a valid phone number"],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const notificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    link: { type: String }, // Optional redirect link (e.g. order details page)
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

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
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1"],
        default: 1,
      },
    },
  ],
  addresses: [addressSchema],
  notifications: [notificationSchema],
});

// Pre-save middleware to hash the password and track password changes
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await argon2.hash(this.password);
  }
  if (this.isModified("password") && !this.isNew) {
    this.passwordChangedDate = Date.now();
  }
  next();
});

userSchema.method({
  async isPasswordMatch(userPassword, candidatePassword) {
    return argon2.verify(userPassword, candidatePassword);
  },
});

const User = mongoose?.models?.User || mongoose.model("User", userSchema);

export default User;
