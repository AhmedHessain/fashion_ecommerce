import * as factory from "./controllerFactory.js";
import Product from "../model/productModel.js";
import { NextResponse } from "next/server";
import { catchAsync } from "@/backend/utils/captureErrors.js";
export const getAllProducts = factory.getAllDocs(Product);

export const getProductById = factory.getDocById(Product, "reviews");

export const addProduct = factory.addDoc(Product, ({ body, params }) => {
  const {
    name,
    price,
    priceAfterDiscount,
    ratingsAverage,
    ratingsQuantity,
    quantity,
    tags,
    description,
    mainImage,
    category,
    otherImages,
    NumberOfSales,
  } = body;
  return {
    name,
    price,
    priceAfterDiscount,
    ratingsAverage,
    ratingsQuantity,
    quantity,
    tags,
    description,
    mainImage,
    category,
    otherImages,
    NumberOfSales,
  };
});

export const updateProduct = factory.updateDoc(Product, ["__v", "createdAt"]);

export const deleteProduct = factory.deleteDoc(Product);

export const getHighestTenSoldProducts = catchAsync(
  async (req, event, next) => {
    const products = await Product.find().sort({ numOfSales: -1 }).limit(8);
    return NextResponse.json({
      status: "success",
      results: products.length,
      products: products,
    });
  }
);
