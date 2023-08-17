var express = require("express");
var router = express.Router();
const AWS = require("aws-sdk");
require("dotenv").config();

router.post("/classify", async function (req, res, next) {
  const uploadedImage = req.files.file;

  // Check if AWS configuration is complete
  if (!process.env.ACCESS_KEY_ID || !process.env.SECRET_ACCESS_KEY || !process.env.REGION) {
    return res.status(500).json({ error: "AWS configuration is incomplete." });
  }

  // Configure AWS credentials and region
  AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
  });

  // Initialize AWS Rekognition
  const rekognition = new AWS.Rekognition();

  const params = {
    Image: {
      Bytes: uploadedImage.data,
    },
    MaxLabels: 10,
  };

  try {
    const rekognitionResponse = await rekognition
      .detectLabels(params)
      .promise();
    const response = rekognitionResponse.Labels.map((label) => label.Name);

    res.json({
      labels: response,
    });
  } catch (error) {
    console.error("routes/vision.js | Error classifying image: ", error); // Can add this on a logger instead on console
    res
      .status(500)
      .json({ error: "An error occurred while processing the image." });
  }
});

module.exports = router;
