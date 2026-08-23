import mongoose from "mongoose";
import Product from "./productModel.js"; // Import the Product model
const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "A review is required"],
  },
  rating: {
    type: Number,
    max: [5, "Rating should be less than or equal to 5"],
    min: [1, "Rating should be more than or equal to 1"],
    required: [true, "Rating is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Review must belong to a Product"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Review must belong to a user"],
  },
});

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.static("updateProductRatings", async function (productID) {
  // Calculate the average rating and number of ratings for the product
  const data = await this.aggregate([
    {
      $match: { product: productID },
    },
    {
      $group: {
        _id: "$product",
        nRatings: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  if (data.length > 0) {
    await Product.findByIdAndUpdate(productID, {
      ratingsQuantity: data[0].nRatings,
      ratingsAverage: data[0].avgRating,
    });
  } else {
    await Product.findByIdAndUpdate(productID, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
});

reviewSchema.post("save", async function () {
  await this.constructor.updateProductRatings(this.product);
});

reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) await this.model.updateProductRatings(doc.product);
});

const Review =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);

module.exports = Review;
