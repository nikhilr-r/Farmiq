/**
 * AgriQ — ML Service Integration
 * ================================
 * Node.js client for the Python ML FastAPI service.
 * Drop this into your server/services/ folder.
 *
 * Usage in your Express routes:
 *   const { predictDisease, checkMLHealth } = require('./services/mlService');
 *   const result = await predictDisease(req.file.buffer, req.file.mimetype);
 */

const axios = require("axios");
const FormData = require("form-data");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// ─────────────────────────────────────────────
//  Core Prediction
// ─────────────────────────────────────────────

/**
 * Send a farmer's crop image to the ML service for disease prediction.
 *
 * @param {Buffer} imageBuffer    - Raw image bytes from multer upload
 * @param {string} mimeType       - "image/jpeg" | "image/png" | "image/webp"
 * @param {boolean} returnGradcam - Include GradCAM heatmap in response
 * @returns {Promise<PredictionResult>}
 */
async function predictDisease(imageBuffer, mimeType = "image/jpeg", returnGradcam = false) {
  const form = new FormData();
  form.append("file", imageBuffer, {
    filename: "crop_image.jpg",
    contentType: mimeType,
  });

  const url = `${ML_SERVICE_URL}/predict?return_gradcam=${returnGradcam}`;

  const response = await axios.post(url, form, {
    headers: form.getHeaders(),
    timeout: 30000, // 30s — TTA takes time
    maxContentLength: 15 * 1024 * 1024,
  });

  return response.data;
}

/**
 * Predict disease from a URL (when farmer sends image URL instead of upload)
 */
async function predictDiseaseFromUrl(imageUrl) {
  const imageResp = await axios.get(imageUrl, {
    responseType: "arraybuffer",
    timeout: 10000,
  });

  const buffer   = Buffer.from(imageResp.data);
  const mimeType = imageResp.headers["content-type"] || "image/jpeg";

  return predictDisease(buffer, mimeType);
}

// ─────────────────────────────────────────────
//  Health Check
// ─────────────────────────────────────────────

async function checkMLHealth() {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 5000 });
    return response.data;
  } catch {
    return { status: "unavailable", model_loaded: false };
  }
}

// ─────────────────────────────────────────────
//  Integration with Crop Calendar
// ─────────────────────────────────────────────

/**
 * Main method called from your disease detection route.
 * Enriches ML prediction with crop calendar context.
 *
 * @param {Buffer}   imageBuffer
 * @param {Object}   cropCalendar  - From MongoDB CropCalendar model
 * @param {Object}   farmer        - Farmer document
 */
async function analyzeWithCalendarContext(imageBuffer, cropCalendar, farmer) {
  // 1. Run ML prediction
  const mlResult = await predictDisease(imageBuffer, "image/jpeg", true);

  // 2. Verify crop match — warn if prediction doesn't match farmer's crop
  const predictedCrop = mlResult.crop.toLowerCase();
  const farmerCrop    = cropCalendar.cropName.toLowerCase();
  const cropMismatch  = !predictedCrop.includes(farmerCrop) && !farmerCrop.includes(predictedCrop);

  // 3. Build enriched response
  const enriched = {
    ...mlResult,

    // Calendar context
    calendar_context: {
      farmer_crop:        cropCalendar.cropName,
      current_stage:      cropCalendar.currentStage,
      days_since_sowing:  Math.floor(
        (Date.now() - new Date(cropCalendar.sowingDate)) / (1000 * 60 * 60 * 24)
      ),
      crop_mismatch_warning: cropMismatch
        ? `⚠️ Our model detected ${mlResult.crop}, but your registered crop is ${cropCalendar.cropName}. Please verify.`
        : null,
    },

    // Save-ready alert object
    alert_to_save: mlResult.is_healthy
      ? null
      : {
          farmerId:         farmer._id,
          cropCalendarId:   cropCalendar._id,
          disease:          mlResult.disease,
          crop:             mlResult.crop,
          confidence:       mlResult.confidence,
          severity:         mlResult.severity,
          isUncertain:      mlResult.is_uncertain,
          advisory:         mlResult.farmer_message,
          gradcamBase64:    mlResult.gradcam_base64 || null,
          detectedAt:       new Date(),
          resolved:         false,
        },
  };

  return enriched;
}

// ─────────────────────────────────────────────
//  Express Route Handler (plug into your routes)
// ─────────────────────────────────────────────

/**
 * POST /api/disease/predict
 * Requires: multer middleware for file upload, auth middleware
 *
 * Example integration in server/routes/disease.js:
 *   router.post('/predict', auth, upload.single('image'), predictDiseaseHandler);
 */
async function predictDiseaseHandler(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // Optional: get farmer's crop calendar for context
    const CropCalendar = require("../models/CropCalendar");
    const calendar     = await CropCalendar.findOne({
      farmerId: req.user._id,
      active:   true,
    });

    let result;
    if (calendar) {
      result = await analyzeWithCalendarContext(
        req.file.buffer,
        calendar,
        req.user
      );
    } else {
      result = await predictDisease(req.file.buffer, req.file.mimetype, true);
    }

    // Save alert to DB if disease detected
    if (result.alert_to_save) {
      const DiseaseAlert = require("../models/DiseaseAlert");
      await DiseaseAlert.create(result.alert_to_save);

      // Update crop calendar
      if (calendar) {
        await CropCalendar.findByIdAndUpdate(calendar._id, {
          $push: {
            diseaseRiskAlerts: {
              disease:   result.disease,
              severity:  result.severity,
              detectedAt: new Date(),
            },
          },
        });
      }
    }

    return res.json({
      success: true,
      data:    result,
    });
  } catch (err) {
    console.error("Disease prediction error:", err.message);

    // Graceful degradation — ML service might be down
    if (err.code === "ECONNREFUSED" || err.code === "ECONNABORTED") {
      return res.status(503).json({
        error: "AI prediction service temporarily unavailable. Please try again in a moment.",
        fallback: true,
      });
    }

    return res.status(500).json({ error: "Prediction failed", details: err.message });
  }
}

module.exports = {
  predictDisease,
  predictDiseaseFromUrl,
  checkMLHealth,
  analyzeWithCalendarContext,
  predictDiseaseHandler,
};
