const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyC31S8csdSeaYuIgim_i13VmRlLKcgWuz0');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const chat = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required',
            });
        }

        // Gather context (simplified for MVP)
        // In a real app, we might use RAG or more sophisticated context gathering
        const lowStockProducts = await Product.find({ $expr: { $lte: ['$currentStock', '$minStockLevel'] } }).limit(5);
        const totalProducts = await Product.countDocuments();
        const warehouses = await Warehouse.find({}, 'name');

        const context = `
      You are StockMaster AI, an intelligent inventory assistant.
      Current System Status:
      - Total Products: ${totalProducts}
      - Warehouses: ${warehouses.map(w => w.name).join(', ')}
      - Low Stock Alerts: ${lowStockProducts.map(p => `${p.name} (${p.currentStock} ${p.unitOfMeasure})`).join(', ') || 'None'}
      
      User Query: ${message}
      
      Provide a helpful, concise response based on the context if relevant. If the user asks about something not in context, answer generally about inventory management best practices.
    `;

        const result = await model.generateContent(context);
        const response = await result.response;
        const text = response.text();

        res.json({
            success: true,
            data: {
                response: text,
            },
        });
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating AI response',
            error: { details: error.message },
        });
    }
};

module.exports = { chat };
