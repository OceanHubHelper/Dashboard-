import express from "express"
import sqlite3 from "sqlite3"
import { open } from "sqlite"
import bcrypt from "bcrypt"
import crypto from "crypto"
import multer from "multer"
import fs from "fs"

const app = express()

app.use(express.json())
app.use(express.static("."))

const HF_API_KEY = process.env.HF_API_KEY

/* CREATE UPLOADS FOLDER */

if(!fs.existsSync("uploads")){
fs.mkdirSync("uploads")
}

/* FILE UPLOAD CONFIG */

const storage = multer.diskStorage({
destination:"uploads/",
filename:(req,file,cb)=>{
cb(null,Date.now()+"_"+file.originalname)
}
})

const upload = multer({storage})

/* DATABASE */

let db

async function initDB(){

db = await open({
filename:"database.db",
driver:sqlite3.Database
})

await db.exec(`

CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT UNIQUE,
password TEXT
);

CREATE TABLE IF NOT EXISTS sessions(
token TEXT,
username TEXT
);

CREATE TABLE IF NOT EXISTS chats(
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT,
role TEXT,
content TEXT
);

CREATE TABLE IF NOT EXISTS uploads(
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT,
filename TEXT
);

`)

}

initDB()

/* RATE LIMIT */

const messageLimit = {}
const LIMIT = 10
const WINDOW = 60000

function checkRateLimit(username){

if(!messageLimit[username]){
messageLimit[username]={count:1,time:Date.now()}
return true
}

let user = messageLimit[username]

if(Date.now()-user.time>WINDOW){
user.count=1
user.time=Date.now()
return true
}

if(user.count>=LIMIT){
return false
}

user.count++
return true

}

/* SIGNUP */

app.post("/signup", async(req,res)=>{

const {username,password}=req.body

const hash = await bcrypt.hash(password,10)

try{

await db.run(
"INSERT INTO users (username,password) VALUES (?,?)",
[username,hash]
)

res.json({success:true})

}catch{

res.json({error:"Username already exists"})

}

})

/* LOGIN */

app.post("/login", async(req,res)=>{

const {username,password}=req.body

let user = await db.get(
"SELECT * FROM users WHERE username=?",
[username]
)

if(!user){
return res.json({error:"Invalid login"})
}

const match = await bcrypt.compare(password,user.password)

if(!match){
return res.json({error:"Invalid login"})
}

/* CREATE SESSION TOKEN */

const token = crypto.randomBytes(24).toString("hex")

await db.run(
"INSERT INTO sessions (token,username) VALUES (?,?)",
[token,username]
)

res.json({success:true,token})

})

/* AUTO LOGIN */

app.post("/autologin", async(req,res)=>{

const {token}=req.body

let session = await db.get(
"SELECT username FROM sessions WHERE token=?",
[token]
)

if(!session){
return res.json({error:"Invalid session"})
}

res.json({username:session.username})

})

/* FILE UPLOAD */

app.post("/upload", upload.single("file"), async(req,res)=>{

const username = req.body.username

await db.run(
"INSERT INTO uploads (username,filename) VALUES (?,?)",
[username,req.file.filename]
)

res.json({file:req.file.filename})

})

/* AI CHAT */

app.post("/ai", async(req,res)=>{

try{

const {username,message}=req.body

/* RATE LIMIT */

if(!checkRateLimit(username)){
return res.json({reply:"Rate limit reached. Please wait."})
}

/* SAVE USER MESSAGE */

await db.run(
"INSERT INTO chats (username,role,content) VALUES (?,?,?)",
[username,"user",message]
)

/* LOAD MEMORY */

let memory = await db.all(
"SELECT role,content FROM chats WHERE username=? ORDER BY id DESC LIMIT 10",
[username]
)

memory.reverse()

/* CALL AI */

const response = await fetch(
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

const data = await response.json()

let reply = data?.choices?.[0]?.message?.content || "AI failed"

/* SAVE AI MESSAGE */

await db.run(
"INSERT INTO chats (username,role,content) VALUES (?,?,?)",
[username,"assistant",reply]
)

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
