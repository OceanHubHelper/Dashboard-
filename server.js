import express from "express"
import sqlite3 from "sqlite3"
import { open } from "sqlite"

const app = express()

app.use(express.json())
app.use(express.static("."))

const HF_API_KEY = process.env.HF_API_KEY

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

CREATE TABLE IF NOT EXISTS chats(
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT,
role TEXT,
content TEXT
);

`)

}

initDB()

/* SIGNUP */

app.post("/signup", async(req,res)=>{

const {username,password}=req.body

try{

await db.run(
"INSERT INTO users (username,password) VALUES (?,?)",
[username,password]
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
"SELECT * FROM users WHERE username=? AND password=?",
[username,password]
)

if(!user){
return res.json({error:"Invalid login"})
}

res.json({success:true})

})

/* AI CHAT WITH MEMORY */

app.post("/ai", async(req,res)=>{

try{

const {username,message}=req.body

await db.run(
"INSERT INTO chats (username,role,content) VALUES (?,?,?)",
[username,"user",message]
)

let memory = await db.all(
"SELECT role,content FROM chats WHERE username=? ORDER BY id DESC LIMIT 10",
[username]
)

memory.reverse()

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
