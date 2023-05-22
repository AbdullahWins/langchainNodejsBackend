const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const { OpenAI } = require("langchain");

dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

app.post("/", async (req, res) => {
  try {
    const inputData = req.body.data;
    console.log("Input data:", inputData);
    const model = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.9,
    });

    const response = await model.call(
      `What would be a good company name a company that makes ${inputData}?`
    );
    
    console.log("Response data:", response);
    res.send(response);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
