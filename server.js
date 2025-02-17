const serverless = require("serverless-http");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(bodyParser.json());

app.use(cors());

const generateEmailContentRoutes = require("./src/routes/generateEmailContentRoute");

app.use("/api", generateEmailContentRoutes);
app.get("/api/test", (req, res) => {
  res.json({ message: "Test API is working!" });
});

// Serverless handler export
module.exports.handler = serverless(app);

// Local server setup
if (process.env.NODE_ENV !== "lambda") {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
