import mongoose from "mongoose";

(async () => {
  try {
    const URI = process.env.MONGO_URI || "";
    await mongoose.connect(
      URI,
      { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true },
      () =>
        console.log(
          mongoose.connection.readyState === 1
            ? "Connected to mongo"
            : "Issue connecting to mongo"
        )
    );
  } catch (err) {
    console.error(err.message);
  }
})();
