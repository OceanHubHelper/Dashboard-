import express from "express"

const app = express()

app.use(express.json())
app.use(express.static("."))

const HF_API_KEY = process.env.HF_API_KEY

app.post("/ai", async (req,res)=>{

try{

const message = req.body.message

if(!HF_API_KEY){
return res.json({reply:"HF_API_KEY missing in Railway variables"})
}

const response = await fetch(
"https://router.huggingface.co/v1/chat/completions",
{
method:"POST",
headers:{
"Authorization":"Bearer " + HF_API_KEY,
"Content-Type":"application/json"
},
body:JSON.stringify({
model:"meta-llama/Meta-Llama-3-8B-Instruct",
messages:[
{role:"user",content:message}
]
})
}
)

const data = await response.json()

console.log("HF RESPONSE:",data)

if(data.error){
return res.json({reply:"HF Error: "+data.error.message})
}

const reply = data?.choices?.[0]?.message?.content || "AI failed"

res.json({reply})

}catch(err){

console.log("SERVER ERROR:",err)

res.json({reply:"Server error — check Railway logs"})

}

})

const PORT = process.env.PORT || 8080

app.listen(PORT,()=>{
console.log("Server running on port "+PORT)
})
