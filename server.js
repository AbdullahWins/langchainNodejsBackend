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
    const memory = new ConversationSummaryMemory({
      memoryKey: "chat_history",
      llm: new OpenAI({ modelName: "gpt-3.5-turbo", temperature: 0 }),
    });

    const model = new OpenAI({ temperature: 0.9 });
    const prompt =
      PromptTemplate.fromTemplate(`The following is a friendly conversation between a human and an AI. 
      The AI is talkative and provides lots of specific details from its context. 
      If the AI does not know the answer to a question, it truthfully says it does not know.

  Current conversation:
  {chat_history}
  Human: {input}
  AI:`);
    const chain = new LLMChain({ llm: model, prompt, memory });

    const res1 = await chain.call({ input: "Hi! I'm Jim." });
    console.log({ res1, memory: await memory.loadMemoryVariables({}) });

    const res2 = await chain.call({ input: "What's my name?" });
    console.log({ res2, memory: await memory.loadMemoryVariables({}) });

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
