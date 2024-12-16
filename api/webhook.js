// /api/webhook.js
import mongoose from 'mongoose';
import Lead from '../models/Lead';
import { MONGO_URI } from 'process';

// Flag to check if we have a persistent DB connection
let isConnected = false;

// Connect to MongoDB (only once)
async function connectToDB() {
  if (isConnected) return; // If already connected, skip
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw new Error('MongoDB connection failed');
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Check if DB is connected
    try {
      await connectToDB();  // Ensure DB is connected

      const webhookData = req.body;
      console.log('Received webhook data:', webhookData);

      const lead = new Lead(webhookData);  // Create a new lead document
      await lead.save();  // Save to MongoDB

      console.log('Lead saved successfully:', lead);
      res.status(200).send('Success');  // Respond with success
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
