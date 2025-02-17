const express = require("express");
const router = express.Router();
const generateEmailContentController = require("../controllers/generateEmailContent");

router.post(
  "/generate-email-content",
  generateEmailContentController.generateEmailContent
);

module.exports = router;
