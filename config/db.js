const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectDB = async () => {
  console.log("loading...");
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    });

    console.log("mongodb connected...");
  } catch (err) {
    console.log("error in connection..");
    console.log(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
