let enc = '/api/encrypt'
let dec = '/api/decrypt'

const encrypt = document.getElementById('encrypt')
const decrypt = document.getElementById('decrypt')


encrypt.addEventListener('click',async e=>{
    e.preventDefault()
    let inp = e.target.parentElement.children[0]
    console.log(inp.value)
    await fetch(enc,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({encrypt:!inp.value?undefined:inp.value})})
    .then(r=>r.json())
    .then(d=>console.log(d.message))
})
decrypt.addEventListener('click',async e=>{
    e.preventDefault()
    let inp = e.target.parentElement.children[0]
    await fetch(dec,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({decrypt:!inp.value?undefined:inp.value})})
    .then(r=>r.json())
    .then(d=>console.log(d.message))
})