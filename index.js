const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
import { OpenAI } from "langchain/llms/openai";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { PlaywrightWebBaseLoader } from "langchain/document_loaders/web/playwright";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} from "langchain/prompts";

// Middleware
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

//chat history reminder
const chat = new ChatOpenAI({ temperature: 0 });
const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    "The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know."
  ),
  new MessagesPlaceholder("history"),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
]);

const chain = new ConversationChain({
  memory: new BufferMemory({ returnMessages: true, memoryKey: "history" }),
  prompt: chatPrompt,
  llm: chat,
});

//checking if the server is up or not
app.get("/", (req, res) => {
  res.send("Lmao.......");
});

//sends back any json file that is linked, in this case package.json
app.get("/package", async (req, res) => {
  const loader = new JSONLoader("./package.json");
  const packageData = await loader.load();
  res.send(packageData);
});

//docx
app.get("/docx", async (req, res) => {
  const loader = new DocxLoader("./banana.DOCX");
  const packageData = await loader.load();
  console.log(packageData);
  //   res.send(packageData);
});

//link
app.get("/link", async (req, res) => {
  const loader = new PlaywrightWebBaseLoader(
    "https://naimurnoyon.github.io/dreampathPrivacyPolicy/"
  );
  const packageData = await loader.load();
  console.log(packageData);
  res.send(packageData);
});

//pdf
app.get("/pdf", async (req, res) => {
  //   const loader = new PDFLoader("./things.pdf");
  const loader = new PDFLoader("./things.pdf", {
    splitPages: false,
  });
  const packageData = await loader.load();
  console.log(packageData);
  res.send(packageData);
});

//business name generator
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

//chat system
app.post("/chat", async (req, res) => {
  try {
    const inputData = req.body.data;
    console.log("Input data:", inputData);
    const response = await chain.call({
      input: inputData,
    });

    console.log(response);
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
