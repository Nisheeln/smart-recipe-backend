const express = require("express");
const multer = require("multer");
const { ImageAnnotatorClient } = require("@google-cloud/vision");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let visionClient;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON.trim();
  const credentials = raw.startsWith("{")
    ? JSON.parse(raw)
    : JSON.parse(JSON.parse(raw));
  visionClient = new ImageAnnotatorClient({ credentials });
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS_FILE) {
  visionClient = new ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS_FILE,
  });
} else {
  throw new Error(
    "Google Vision credentials not found. Set GOOGLE_APPLICATION_CREDENTIALS_JSON or GOOGLE_APPLICATION_CREDENTIALS_FILE"
  );
}


router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No image uploaded" });

    const [result] = await visionClient.objectLocalization({
      image: { content: req.file.buffer },
    });

    const objects = result.localizedObjectAnnotations || [];

    const ingredients = objects
      .filter((obj) => obj.score >= 0.7)
      .map((obj) => ({
        name: obj.name,
        confidence: Number((obj.score * 100).toFixed(2)),
      }));

    if (ingredients.length === 0) {
      return res.json({
        message: "No ingredients detected with sufficient confidence.",
        ingredients: [],
      });
    }

    res.json({ ingredients });
  } catch (err) {
    console.error("Ingredient detection error:", err);
    res.status(500).json({ error: "Failed to detect ingredients", details: err.message });
  }
});

module.exports = router;
