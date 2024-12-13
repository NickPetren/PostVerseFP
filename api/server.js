import app from './app.js';
import mongoose from 'mongoose';

const PORT = 5177;
const DB_URL = 'mongodb+srv://Nick:1234@cluster0.cssn3.mongodb.net/final-project_data?retryWrites=true&w=majority&appName=Cluster0';
const JWT_SECRET = 'your-secret-key-123';

global.JWT_SECRET = JWT_SECRET;

async function startServer() {
    try {
        await mongoose.connect(DB_URL);
        console.log('Connected to MongoDB');
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.log('Server Error:', error.message);
        process.exit(1);
    }
}

startServer();