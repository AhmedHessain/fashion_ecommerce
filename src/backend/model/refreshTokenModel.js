import mongoose from "mongoose";

// Define the refresh token schema
const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User Id is required"],
  },
  _id: {
    type: String,
    required: [true, "Token _id is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: parseInt(process.env.REFRESH_TOKEN_EXPIRATION_DATE) * 24 * 60 * 60, // Set the token to expire
  },
});

const RefreshToken =
  mongoose?.models?.RefreshToken ||
  mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
