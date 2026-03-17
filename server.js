import express from "express"

const app = express()

app.use(express.json())
app.use(express.static("."))

const API_KEY = process.env.OPENAI_API_KEY

// AI endpoint
app.post("/ai", async (req, res) => {

try {

const message = req.body.message

if (!API_KEY) {
return res.json({ reply: "API key missing. Add OPENAI_API_KEY in Railway variables." })
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

})

const data = await response.json()

console.log("AI RESPONSE:", data)

// handle API errors
if (data.error) {
return res.json({ reply: "AI API Error: " + data.error.message })
}

const reply = data?.choices?.[0]?.message?.content || "AI returned empty response"

res.json({ reply })

} catch (error) {

console.log("SERVER ERROR:", error)

res.json({ reply: "Server crashed. Check Railway logs." })

}

})


// server start
const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
console.log("Server running on port " + PORT)
})
