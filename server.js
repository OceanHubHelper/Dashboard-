import express from "express"

const app = express()

app.use(express.json())
app.use(express.static("."))

const API_KEY = process.env.OPENAI_API_KEY

app.post("/ai", async (req,res)=>{

try{

const message = req.body.message

if(!API_KEY){
return res.json({reply:"API key missing"})
}

const response = await fetch("https://api.openai.com/v1/chat/completions",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+API_KEY
},

body:JSON.stringify({

model:"gpt-4o-mini",

messages:[
{role:"user",content:message}
]

})

})

const data = await response.json()

console.log(data)

res.json({
reply:data?.choices?.[0]?.message?.content || "AI error"
})

}catch(err){

console.log("SERVER ERROR:",err)

res.json({reply:"Server error"})

}

})

const PORT = process.env.PORT || 8080

app.listen(PORT,()=>{

console.log("Server running on port "+PORT)

})
