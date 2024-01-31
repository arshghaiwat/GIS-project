const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/highwayDB', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const highwaySchema = new mongoose.Schema({
    name: String,
    geometry: Object, // geometry field is an object
});

const Highway = mongoose.model('Highway', highwaySchema);



app.post('/api/saveHighway', async (req, res) => {
    try {
        const { name, geometry } = req.body;
        const newHighway = new Highway({
            name,
            geometry,
        });

        await newHighway.save();

        res.status(201).json({ message: 'Highway saved successfully' });
    } catch (error) {
        console.error('Error saving highway:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/deleteHighway', async (req, res) => {
    try {
        const { geometry } = req.body;

        const deletedHighway = await Highway.findOneAndDelete({ geometry });

        if (!deletedHighway) {
            return res.status(404).json({ error: 'Highway not found' });
        }

        res.json({ message: 'Highway deleted successfully' });
    } catch (error) {
        console.error('Error deleting highway:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/getAllHighways', async (req, res) => {
    try {
        const allHighways = await Highway.find();
        res.json(allHighways);
    } catch (error) {
        console.error('Error getting all highways:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
