function rbPlayer(){

rbPanel.innerHTML=`
<input id="rbUser" placeholder="Username">
<button onclick="lookupPlayer()">Search</button>
<div id="rbResult"></div>
`

}

async function lookupPlayer(){

let username=document.getElementById("rbUser").value

let res=await fetch(
"https://users.roproxy.com/v1/usernames/users",
{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({usernames:[username]})
})

let data=await res.json()

if(!data.data.length){
rbResult.innerText="User not found"
return
}

let id=data.data[0].id

rbResult.innerText="User ID: "+id

}

function rbAvatar(){

rbPanel.innerHTML=`
<input id="rbAvatarUser" placeholder="Username">
<button onclick="loadAvatar()">Load</button>
<div id="avatarResult"></div>
`

}

async function loadAvatar(){

let username=document.getElementById("rbAvatarUser").value

let res=await fetch(
"https://users.roproxy.com/v1/usernames/users",
{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({usernames:[username]})
})

let data=await res.json()

let id=data.data[0].id

let img=`https://thumbnails.roproxy.com/v1/users/avatar?userIds=${id}&size=420x420&format=Png`

avatarResult.innerHTML=`<img src="${img}" width="200">`

}

function rbGame(){

rbPanel.innerHTML=`
<input id="gameName" placeholder="Game Name">
<button onclick="searchGame()">Search</button>
<div id="gameResult"></div>
`

}

async function searchGame(){

let name=document.getElementById("gameName").value

let res=await fetch(
"https://games.roproxy.com/v1/games/list?model.keyword="+name+"&model.maxRows=10"
)

let data=await res.json()

if(!data.games.length){
gameResult.innerText="Game not found"
return
}

let game=data.games[0]

gameResult.innerHTML=`
<b>${game.name}</b><br>
Creator: ${game.creatorName}<br>
Players: ${game.playerCount}<br>
Visits: ${game.visits}
`

}
