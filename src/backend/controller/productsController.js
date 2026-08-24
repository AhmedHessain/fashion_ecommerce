import * as factory from "./controllerFactory.js";
import Product from "../model/productModel.js";
import { NextResponse } from "next/server";
import { catchAsync } from "@/backend/utils/captureErrors.js";
import mongoose from "mongoose";
import { GetCurrentUser } from "@/app/actions.js";
import dbconnect from "../db/index.js";
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
    await dbconnect();
    const products = await Product.find().sort({ numOfSales: -1 }).limit(8);
    return NextResponse.json({
      status: "success",
      results: products.length,
      products: products,
    });
  },
);

export const getProductMetadata = catchAsync(async (req, event, next) => {
  await dbconnect();

  const aggregation = await Product.aggregate([
    {
      $facet: {
        priceStats: [
          {
            $group: {
              _id: null,
              minPrice: { $min: "$price" },
              maxPrice: { $max: "$price" },
              minDiscount: { $min: "$priceAfterDiscount" },
              maxDiscount: { $max: "$priceAfterDiscount" },
              minQuantity: { $min: "$quantity" },
              maxQuantity: { $max: "$quantity" },
              minRating: { $min: "$ratingsAverage" },
              maxRating: { $max: "$ratingsAverage" },
              minSales: { $min: "$NumOfSales" },
              maxSales: { $max: "$NumOfSales" },
            },
          },
        ],
        uniqueTags: [
          { $unwind: "$tags" },
          { $group: { _id: null, tags: { $addToSet: "$tags" } } },
        ],
        uniqueCategories: [
          { $group: { _id: null, categories: { $addToSet: "$category" } } },
        ],
      },
    },
    {
      $project: {
        priceStats: { $arrayElemAt: ["$priceStats", 0] },
        tags: { $arrayElemAt: ["$uniqueTags.tags", 0] },
        categories: { $arrayElemAt: ["$uniqueCategories.categories", 0] },
      },
    },
  ]);

  const metadata = aggregation[0];

  return NextResponse.json({
    status: "success",
    metadata,
  });
});
export const getRecommendedProducts = catchAsync(async (req, event, next) => {
  const params = new URLSearchParams(req.nextUrl.search);
  const id = params.get("_id");

  const user = await GetCurrentUser();

  const excludedIds = [
    ...(user?.wishlist ?? []).map((id) => new mongoose.Types.ObjectId(id)),
    ...(user?.cart ?? []).map(
      (item) => new mongoose.Types.ObjectId(item.product),
    ),
    ...(id ? [new mongoose.Types.ObjectId(id)] : []),
  ];

  const aggregation = await Product.aggregate([
    {
      $facet: {
        excludedMeta: [
          { $match: { _id: { $in: excludedIds } } },
          {
            $group: {
              _id: null,
              categories: { $addToSet: "$category" },
              tags: { $addToSet: "$tags" },
            },
          },
          {
            $project: {
              categories: 1,
              tags: {
                $reduce: {
                  input: "$tags",
                  initialValue: [],
                  in: { $setUnion: ["$$value", "$$this"] },
                },
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        excludedMeta: { $arrayElemAt: ["$excludedMeta", 0] },
      },
    },
    {
      $addFields: {
        categories: { $ifNull: ["$excludedMeta.categories", []] },
        tags: { $ifNull: ["$excludedMeta.tags", []] },
      },
    },
    {
      $addFields: {
        useFallback: {
          $or: [
            { $eq: [{ $size: "$categories" }, 0] },
            { $eq: [{ $size: "$tags" }, 0] },
          ],
        },
      },
    },
    {
      $facet: {
        recommendations: [
          {
            $match: {
              _id: { $nin: excludedIds },
            },
          },
          {
            $lookup: {
              from: "products",
              let: {
                catList: "$$ROOT.categories",
                tagList: "$$ROOT.tags",
                useFallback: "$$ROOT.useFallback",
              },
              pipeline: [
                {
                  $match: {
                    _id: { $nin: excludedIds },
                  },
                },
                {
                  $match: {
                    $expr: {
                      $cond: [
                        "$$useFallback",
                        true,
                        {
                          $or: [
                            { $in: ["$category", "$$catList"] },
                            {
                              $gt: [
                                {
                                  $size: {
                                    $setIntersection: ["$tags", "$$tagList"],
                                  },
                                },
                                0,
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  },
                },
                { $sample: { size: 4 } },
              ],
              as: "recommended",
            },
          },
          { $unwind: "$recommended" },
          { $replaceRoot: { newRoot: "$recommended" } },
        ],
      },
    },
    {
      $unwind: "$recommendations",
    },
    {
      $replaceRoot: {
        newRoot: "$recommendations",
      },
    },
  ]);

  return NextResponse.json({
    status: "success",
    data: aggregation,
  });
});
