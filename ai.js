let username="guest"

function addMessage(text,type){

let msg=document.createElement("div")

msg.className="msg "+type
msg.innerText=text

document.getElementById("chat").appendChild(msg)

document.getElementById("chat").scrollTop=
document.getElementById("chat").scrollHeight

}

async function send(){

let input=document.getElementById("aiInput")
let text=input.value

if(!text) return

addMessage(text,"user")

input.value=""

let res=await fetch("/ai",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
username:username,
message:text
})
})

let data=await res.json()

addMessage(data.reply || "AI failed","ai")

}
