const axios = require('axios');
const Document = require('../models/Document');

// Load Gemini API key from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * POST /api/ocr/extract-receipt
 * Body: { image: <base64 string> }
 * Returns extracted receipt data.
 */
const extractReceipt = async (req, res) => {
    try {
        // Support multipart upload (req.file) or base64 in req.body.image
        let image = null;
        if (req.file && req.file.buffer) {
            image = req.file.buffer.toString('base64');
        } else if (req.body && req.body.image) {
            // If body contains a data URL, strip prefix
            if (req.body.image.startsWith('data:')) {
                const m = req.body.image.match(/^data:(.+);base64,(.+)$/);
                image = m ? m[2] : req.body.image;
            } else {
                image = req.body.image;
            }
        }
        if (!image) {
            return res.status(400).json({
                success: false,
                message: 'Image data is required',
                error: { code: 'VALIDATION_ERROR' },
            });
        }
        // Call Gemini Vision API (if key available)
        let content = null;
        if (GEMINI_API_KEY) {
            try {
                const response = await axios.post(
                    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
                    {
                        contents: [
                            {
                                role: 'user',
                                parts: [
                                    {
                                        inlineData: {
                                            mimeType: req.file ? req.file.mimetype : 'image/png',
                                            data: image,
                                        },
                                    },
                                    {
                                        text: 'Extract receipt details: vendor name, date, line items (name, quantity, price), subtotal, tax, total. Return JSON.',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        params: { key: GEMINI_API_KEY },
                        headers: { 'Content-Type': 'application/json' },
                    }
                );

                content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
            } catch (err) {
                console.error('Gemini API error:', err?.response?.data || err.message);
                // fallback: set rawText placeholder
                content = null;
            }
        }

        // If Gemini didn't return parsed JSON, fallback to raw text or empty
        if (!content) content = null;
        let extracted = {};
        if (content) {
            try {
                // Strip markdown code blocks if present (```json ... ```)
                let jsonString = content.trim();
                if (jsonString.startsWith('```')) {
                    // Remove opening ```json or ```
                    jsonString = jsonString.replace(/^```(?:json)?\s*\n?/i, '');
                    // Remove closing ```
                    jsonString = jsonString.replace(/\n?```\s*$/i, '');
                }
                extracted = JSON.parse(jsonString);
            } catch (e) {
                console.error('Failed to parse OCR JSON:', e);
                extracted = { rawText: content };
            }
        } else {
            extracted = { rawText: null };
        }

        // Return extracted data without creating document
        // User can review and modify before creating the actual receipt document
        res.json({
            success: true,
            message: 'Receipt data extracted successfully',
            data: {
                extracted,
                // Return base64 image for form preview if needed
                imageData: image,
            },
        });
    } catch (error) {
        console.error('OCR extraction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error extracting receipt',
            error: { details: error.message },
        });
    }
};

module.exports = { extractReceipt };
