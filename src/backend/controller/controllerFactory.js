import { catchAsync } from "../utils/captureErrors";
import AppError from "../utils/AppError";
import QueryBuilder from "../utils/queryBuilder";
import { NextResponse } from "next/server";
import qs from "qs";
export const deleteDoc = (model) =>
  catchAsync(async (req, event, next) => {
    const doc = await model.findByIdAndDelete(event.params.id);

    if (!doc) {
      throw new AppError("No document found.", 404);
    }

    return new NextResponse(null, { status: 204 });
  });

export const getAllDocs = (model, fn) =>
  catchAsync(async (req, event, next) => {
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
      { status: 200 }
    );
  });

export const getDocById = (model, populate = "") =>
  catchAsync(async (req, event, next) => {
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
    const body = await req.json();

    // Use `fn` to filter/modify the body, or default to the parsed body
    const data = (fn && fn({ body, params: event.params })) || { ...body };

    const doc = await model.create(data);

    return NextResponse.json(
      {
        status: "success",
        data: doc,
      },
      { status: 201 }
    );
  });

export const updateDoc = (model, excludedFields = []) =>
  catchAsync(async (req, event, next) => {
    const { id } = event.params; // Extract `id` from the URL params
    const doc = await model.findOne({ _id: id });

    if (!doc) {
      throw new AppError("No document found.", 404);
    }

    // Get the list of valid fields for the model
    const verifiedFields = Object.keys(model.schema.paths).filter(
      (path) => !excludedFields.includes(path)
    );

    // Clone the document
    const clonedDoc = doc.$clone();

    // Update the cloned document only with verified fields
    Object.keys(req.body).forEach((key) => {
      if (verifiedFields.includes(key)) clonedDoc[key] = req.body[key];
    });

    // Save the updated document
    const updatedDoc = await clonedDoc.save();

    return NextResponse.json(
      {
        status: "success",
        data: updatedDoc,
      },
      { status: 200 }
    );
  });
