function showPanel(id){

document.querySelectorAll(".panel").forEach(p=>{
p.classList.remove("active")
})

document.getElementById(id).classList.add("active")

}
