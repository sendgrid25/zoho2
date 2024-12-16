import mongoose from 'mongoose';
import Lead from '../models/Lead';

let isConnected = false;  // Track connection state

// MongoDB connection handler
async function connectToDB() {
  if (isConnected) return;  // Skip if already connected

  try {
    // Try to connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('MongoDB connection failed');
  }
}

// Webhook handler for incoming Zoho leads
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await connectToDB();  // Ensure DB connection is established

      const webhookData = req.body;
      console.log('Received webhook data:', webhookData);

      // Create and save the lead in MongoDB
      const lead = new Lead(webhookData);
      await lead.save();

      console.log('Lead saved successfully:', lead);
      res.status(200).send('Success');
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
