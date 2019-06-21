const express = require("express");
const connectDB = require("./config/db");
const app = express();

const PORT = process.env.PORT || 5000;

//connect database
connectDB();

//init body parser
app.use(
  express.json({
    extended: false
  })
);

app.get("/", (req, res) => {
  res.send("API running");
});

//define routes
app.use("/api/user", require("./routes/api/user"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

app.listen(PORT, () => {
  console.log(`server is running on port:${PORT}`);
});
