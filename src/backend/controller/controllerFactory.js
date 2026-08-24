import { catchAsync } from "../utils/captureErrors";
import AppError from "../utils/AppError";
import QueryBuilder from "../utils/queryBuilder";
import { NextResponse } from "next/server";
import qs from "qs";
import dbconnect from "../db/index.js";
//  * 🧩 Example Usage deleteDoc
//  *   // Single delete:
//  *   DELETE /api/products/671b3e89f1c5d9c6e9a7b001
//  *
//  *   // Multiple delete:
//  *   DELETE /api/products
//  *   {
//  *     "ids": ["671b3e89f1c5d9c6e9a7b001", "671b3e89f1c5d9c6e9a7b002"]
//  *   }
//  *

export const deleteDoc = (model) =>
  catchAsync(async (req, event, next) => {
    await dbconnect();

    const { id, ids } = event.params || {};
    const body = !id && !ids ? await req?.json() : {};

    // Normalize IDs (either from params or body)
    const docIds = ids || body.ids || (id ? [id] : []);

    if (!docIds || !Array.isArray(docIds) || docIds.length === 0) {
      throw new AppError(
        "Please provide a document ID or an array of IDs to delete.",
        400,
      );
    }

    // --- SINGLE DOCUMENT DELETE ---
    if (docIds.length === 1) {
      const doc = await model.findByIdAndDelete(docIds[0]);
      if (!doc) throw new AppError("No document found.", 404);

      return new NextResponse(null, { status: 204 }); // 204 No Content
    }

    // --- MULTI-DOCUMENT DELETE ---
    const result = await model.deleteMany({ _id: { $in: docIds } });

    if (result.deletedCount === 0) {
      throw new AppError("No documents found for the provided IDs.", 404);
    }

    return NextResponse.json(
      {
        status: "success",
        deletedCount: result.deletedCount,
        message: `${result.deletedCount} documents deleted successfully.`,
      },
      { status: 204 },
    );
  });

export const getAllDocs = (model, fn) =>
  catchAsync(async (req, event, next) => {
    await dbconnect();

    const url = new URL(req.url);
    const queryString = url.searchParams.toString();
    const queryObj = qs.parse(queryString);
    if (queryObj.name) {
      queryObj.name = { $regex: queryObj.name, $options: "i" };
    }

    const filter = (fn && fn({ query: queryObj, params: event.params })) || {};
    const queryBuilder = new QueryBuilder(model.find(filter), queryObj);
    queryBuilder.filter().sort().paginate().project();

    const docs = await queryBuilder.mongoQuery;
    return NextResponse.json(
      {
        status: "success",
        results: docs.length,
        data: docs,
      },
      { status: 200 },
    );
  });

export const getDocById = (model, populate = "") =>
  catchAsync(async (req, event, next) => {
    await dbconnect();
    const { id } = event.params;

    const doc = await model.findById(id).populate(populate);

    if (!doc) {
      throw new AppError("No document found.", 404);
    }

    return NextResponse.json({
      status: "success",
      data: doc,
    });
  });

export const addDoc = (model, fn) =>
  catchAsync(async (req, event, next) => {
    await dbconnect();
    const body = await req.json();

    // Use `fn` to filter/modify the body, or default to the parsed body
    const data = (fn && fn({ body, params: event.params })) || { ...body };

    const doc = await model.create(data);

    return NextResponse.json(
      {
        status: "success",
        data: doc,
      },
      { status: 201 },
    );
  });

//  * 🧩 Example Usage of updateDoc
//  *   // Single update:
//  *   PATCH /api/products/671b3e89f1c5d9c6e9a7b001
//  *   {
//  *     "status": "archived"
//  *   }
//  *
//  *   // Multiple update:
//  *   PATCH /api/products
//  *   {
//  *     "ids": ["671b3e89f1c5d9c6e9a7b001", "671b3e89f1c5d9c6e9a7b002"],
//  *     "status": "archived",
//  *     "category": "men"
//  *   }
//  *

export const updateDoc = (model, excludedFields = []) =>
  catchAsync(async (req, event, next) => {
    await dbconnect();
    const { id, ids } = event.params || {}; // in case one comes from route
    const body = await req.json();
    // Normalize: support both param and body array
    const docIds = ids || body.ids || (id ? [id] : []);
    if (!docIds || !Array.isArray(docIds) || docIds.length === 0) {
      throw new AppError(
        "Please provide a document ID or an array of IDs.",
        400,
      );
    }

    // Get valid model fields
    const verifiedFields = Object.keys(model.schema.paths).filter(
      (path) => !excludedFields.includes(path),
    );

    // Only pick allowed fields from body
    const updateData = {};
    Object.keys(body).forEach((key) => {
      if (verifiedFields.includes(key)) updateData[key] = body[key];
    });

    if (Object.keys(updateData).length === 0) {
      throw new AppError("No valid fields provided for update.", 400);
    }

    // --- SINGLE DOCUMENT UPDATE ---
    if (docIds.length === 1) {
      const doc = await model.findById(docIds[0]);
      if (!doc) throw new AppError("No document found.", 404);

      Object.assign(doc, updateData);
      const updatedDoc = await doc.save();

      return NextResponse.json(
        {
          status: "success",
          data: updatedDoc,
        },
        { status: 200 },
      );
    }

    // --- MULTI-DOCUMENT UPDATE ---
    const result = await model.updateMany(
      { _id: { $in: docIds } },
      { $set: updateData },
    );

    return NextResponse.json(
      {
        status: "success",
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        message: `${result.modifiedCount} documents updated successfully.`,
      },
      { status: 200 },
    );
  });
