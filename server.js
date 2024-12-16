// /server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Lead = require('./models/Lead');
const { MONGO_URI, PORT } = process.env;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection setup
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Webhook route (for local testing)
app.post('/webhook/zoho/leads', async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('Received webhook data:', webhookData);
    const lead = new Lead(webhookData);
    await lead.save();
    console.log('Lead saved successfully:', lead);
    res.status(200).send('Success');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server locally
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
