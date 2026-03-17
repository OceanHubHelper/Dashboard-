import express from "express";

const app = express();

app.use(express.json());
app.use(express.static("."));

const API_KEY = process.env.OPENAI_API_KEY;

app.post("/ai", async (req, res) => {
  try {
    const message = req.body.message;

    if (!API_KEY) {
      return res.json({ reply: "API key missing." });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    console.log("AI response:", data);

    const reply = data?.choices?.[0]?.message?.content || "AI failed to respond.";

    res.json({ reply });

  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.json({ reply: "Server error." });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
