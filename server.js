import express from "express"
import fs from "fs"

const app = express()

app.use(express.json())
app.use(express.static("."))

const HF_API_KEY = process.env.HF_API_KEY

const USERS_FILE = "users.json"
const CHATS_FILE = "chats.json"

/* create files if missing */

if(!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE,"{}")
if(!fs.existsSync(CHATS_FILE)) fs.writeFileSync(CHATS_FILE,"{}")

/* helpers */

function loadUsers(){
return JSON.parse(fs.readFileSync(USERS_FILE))
}

function saveUsers(data){
fs.writeFileSync(USERS_FILE,JSON.stringify(data,null,2))
}

function loadChats(){
return JSON.parse(fs.readFileSync(CHATS_FILE))
}

function saveChats(data){
fs.writeFileSync(CHATS_FILE,JSON.stringify(data,null,2))
}

/* SIGNUP */

app.post("/signup",(req,res)=>{

const {username,password}=req.body

let users=loadUsers()

if(users[username]){
return res.json({error:"User already exists"})
}

users[username]={password}

saveUsers(users)

res.json({success:true})

})

/* LOGIN */

app.post("/login",(req,res)=>{

const {username,password}=req.body

let users=loadUsers()

if(!users[username] || users[username].password!==password){
return res.json({error:"Invalid login"})
}

res.json({success:true})

})

/* AI CHAT WITH MEMORY */

app.post("/ai",async(req,res)=>{

try{

const {username,message}=req.body

let chats=loadChats()

if(!chats[username]) chats[username]=[]

chats[username].push({role:"user",content:message})

/* keep last 10 messages */

let memory=chats[username].slice(-10)

const response=await fetch(
"https://router.huggingface.co/v1/chat/completions",
{
method:"POST",
headers:{
"Authorization":"Bearer "+HF_API_KEY,
"Content-Type":"application/json"
},
body:JSON.stringify({
model:"meta-llama/Meta-Llama-3-8B-Instruct",
messages:memory
})
}
)

const data=await response.json()

let reply=data?.choices?.[0]?.message?.content || "AI failed"

chats[username].push({role:"assistant",content:reply})

saveChats(chats)

res.json({reply})

}catch(err){

console.log(err)

res.json({reply:"Server error"})

}

})

const PORT = process.env.PORT || 8080

app.listen(PORT,()=>{
console.log("Server running on "+PORT)
})
