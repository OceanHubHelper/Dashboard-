import express from "express"
import fetch from "node-fetch"

const app = express()

app.use(express.json())
app.use(express.static("."))

const API_KEY = process.env.OPENAI_API_KEY

app.post("/ai", async (req,res)=>{

const msg=req.body.message

const response=await fetch("https://api.openai.com/v1/chat/completions",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+API_KEY
},

body:JSON.stringify({

model:"gpt-4o-mini",

messages:[{role:"user",content:msg}]

})

})

const data=await response.json()

res.json({reply:data.choices[0].message.content})

})

app.listen(3000,()=>console.log("server running"))
