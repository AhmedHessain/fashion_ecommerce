import mongoose from "mongoose";

const shippingAddressSchema = new mongoose.Schema(
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
const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],

    shippingAddress: shippingAddressSchema, // snapshot of chosen address

    paymentMethod: {
      type: String,
      enum: ["COD", "Stripe", "PayPal"],
      default: "COD",
    },

    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
