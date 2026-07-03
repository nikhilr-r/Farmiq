const DiagnosisHistory = require('../models/DiagnosisHistory');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

exports.analyzeCrop = async (req, res) => {
    try {
        const { image, cropName } = req.body;
        
        if (!image) {
            return res.status(400).json({ msg: 'No image provided' });
        }

        // image is a base64 string: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ msg: 'Invalid image format' });
        }

        const type = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');

        // Create form data to send to FastAPI
        const formData = new FormData();
        const blob = new Blob([buffer], { type });
        formData.append('file', blob, 'crop_image.jpg');

        console.log('Sending request to ML service...');
        
        // Call FastAPI
        const response = await fetch(`${ML_SERVICE_URL}/predict`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ML Service Error:', errorText);
            return res.status(response.status).json({ msg: 'ML analysis failed', details: errorText });
        }

        const mlResult = await response.json();
        
        // Map FastAPI response to the structure expected by the frontend CropDoctor component
        const formattedResult = {
            diagnosis: {
                diseaseName: mlResult.disease,
                severity: mlResult.severity,
                confidence: mlResult.confidence,
                description: mlResult.farmer_message,
                topPredictions: mlResult.top2 ? mlResult.top2 : []
            },
            advisory: {
                immediate: mlResult.immediate_action,
                treatment: mlResult.treatment,
                prevention: mlResult.prevention,
                yieldImpact: mlResult.yield_impact
            },
            // Adding a stub for weather and stage as some UI components might use it.
            // In a real app this would be fetched from other services.
            weatherContext: null,
            cropStageContext: null
        };

        // Save history
        const newHistoryItem = new DiagnosisHistory({
            farmerId: req.farmer.id,
            cropName: cropName || mlResult.crop,
            imageBase64: image, // Store the uploaded image
            diagnosis: formattedResult.diagnosis,
            advisory: formattedResult.advisory
        });
        
        await newHistoryItem.save();

        res.json(formattedResult);

    } catch (err) {
        console.error('Error in analyzeCrop:', err.message);
        res.status(500).json({ msg: 'Server Error during diagnosis' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const history = await DiagnosisHistory.find({ farmerId: req.farmer.id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        console.error('Error fetching history:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};
