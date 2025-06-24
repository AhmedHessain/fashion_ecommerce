import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A Product must have a name"],
    unique: true,
    trim: true,
    maxLength: [40, "A Product name should be less than or equal to 40"],
    minLength: [3, "A Product name should be more than or equal to 3"],
    index: true,
  },
  price: {
    type: Number,
    required: [true, "A Product must have a price"],
  },
  priceAfterDiscount: {
    type: Number,
    validate: {
      // This only works on creating new document (this is doc at this function context, but on update it is query)
      validator(val) {
        return val < this.price;
      },
      message: `Price discount can't be greater than price`,
    },
  },
  ratingsAverage: {
    type: Number,
    default: 0,
    max: [5, "A Product rating should be less than or equal to 5"],
    min: [0, "A Product rating should be more than or equal to 0"],
    set: (val) => Math.round(val * 10) / 10,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
    min: [0, "A Product ratingQuantity should be more than or equal to 0"],
  },
  quantity: { type: Number, required: true },
  description: {
    type: String,
    trim: true,
  },
  category: { type: String, required: true, index: true }, // Indexed for filtering
  tags: [{ type: String }], // New field for tags
  mainImage: { type: String, required: true }, // New field for main product image
  otherImages: [{ type: String }], // New field for additional product images
  firstCreatedDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }, // New field for tracking updates
  NumOfSales: {
    type: Number,
    default: 0,
    min: [0, "A Product NumOfSales should be more than or equal to 0"],
  },
});

// Ensure unique product names within the same category (optional)
productSchema.index({ name: 1, category: 1 }, { unique: true });
productSchema.index({ price: 1, ratingsAverage: -1 });

productSchema.pre("save", function (next) {
  this.updatedDate = Date.now();
  next();
});

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
