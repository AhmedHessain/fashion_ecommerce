import mongoose from "mongoose";

const startAsyncTransaction = async function (asyncFunc) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await asyncFunc(session);
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export default startAsyncTransaction;
