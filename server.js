import express from "express"

const app = express()

app.use(express.json())
app.use(express.static("."))

const HF_API_KEY = process.env.HF_API_KEY

app.post("/ai", async (req,res)=>{

try{

const message = req.body.message

if(!HF_API_KEY){
return res.json({reply:"Missing HuggingFace API key"})
}

const response = await fetch(
"https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
{
method:"POST",
headers:{
"Authorization":"Bearer "+HF_API_KEY,
"Content-Type":"application/json"
},
body:JSON.stringify({
inputs: message
})
}
)

const data = await response.json()

console.log("HF RESPONSE:",data)

let reply = "AI failed"

if(Array.isArray(data) && data[0]?.generated_text){
reply = data[0].generated_text
}

res.json({reply})

}catch(err){

console.log("SERVER ERROR:",err)

res.json({reply:"Server error"})

}

})

const PORT = process.env.PORT || 8080

app.listen(PORT,()=>{
console.log("Server running on port "+PORT)
})
