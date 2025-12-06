// Made by Kyle (https://github.com/kt946)
import express from 'express';
import { ApolloServer } from 'apollo-server-express'; // import ApolloServer for GraphQL
import * as dotenv from 'dotenv';
import path from 'path';

import connectDB from './config/connection.js'; // import connection to MongoDB
import { typeDefs, resolvers } from './schemas/index.js'; // import typeDefs and resolvers
import { authMiddleware } from './utils/auth.js'; // import authMiddleware for authentication

dotenv.config(); // Load environment variables from .env file

const PORT = process.env.PORT || 3001;

// Create a new instance of an Apollo server with the GraphQL schema
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware, // This ensures that every request performs an authentication check, and the updated request object will be passed to the resolvers as the context.
});

import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express(); // Create a new instance of an Express server
app.use(express.urlencoded({ extended: true })); // This sets up middleware to parse incoming requests with urlencoded payloads
app.use(express.json()); // This sets up middleware to parse incoming requests with JSON payloads

// Proxy /api requests to Python server
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true
}));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(new URL('../client/dist', import.meta.url).pathname)));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(new URL('../client/dist/index.html', import.meta.url).pathname));
});

const startServer = async (typeDefs, resolvers) => {
  try {
    await server.start(); // Start the Apollo server
    server.applyMiddleware({ app }); // integrate our Apollo server with the Express application as middleware
    connectDB(process.env.MONGODB_URI); // connect to MongoDB
    app.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer(typeDefs, resolvers); // Start server

import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const upload = multer({ dest: 'uploads/' });

app.post('/api/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdf(dataBuffer);
    const text = data.text;

    // Initialize Gemini
    // Make sure GEMINI_API_KEY is set in your .env file
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate 10 multiple choice questions based on the following text. 
    Return the response as a JSON array of objects, where each object has:
    - "question": The question text
    - "options": An array of 4 possible answers
    - "answer": The correct answer (must be one of the options)
    
    Text: ${text.substring(0, 30000)}`; // Limit text length to avoid token limits

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Clean up the response to ensure it's valid JSON
    const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    let questions;
    try {
      questions = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON from LLM:", textResponse);
      return res.status(500).json({ message: 'Failed to generate valid JSON from LLM' });
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ questions });
  } catch (error) {
    console.error(error);
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error processing PDF' });
  }
});
