let enc = '/api/encrypt'
let dec = '/api/decrypt'

const encrypt = document.getElementById('encrypt')
const decrypt = document.getElementById('decrypt')
const formwrapper = document.getElementById('form-wrapper')
const paras = document.querySelectorAll('.para')
const epara = document.getElementById('encrypt-para')
const dpara = document.getElementById('decrypt-para')
const dtextarea = document.getElementById('decrypt-input')
const etextarea = document.getElementById('encrypt-input')
let clear;
window.onload = e => {
    const elemX = formwrapper.clientWidth / 2
    return [...paras].map(x=>x.style = `left:${elemX-(x.clientWidth/2)}px`)
}

function clearTextarea(textarea){
   clear = setTimeout(()=>textarea.value = '',5000)
}
function clearWhiteSpaces(text){
    console.log(text.replace(/(^\s{0,2}|\s{0,2}$)/g,''))
    return text.replace(/(^\s{0,2}|\s{0,2}$)/g,'')
}



// input event
[dtextarea,etextarea].forEach(d=>{
    d.oninput = e => {
        clearTimeout(clear)
        clearTextarea(d)
    }
})

// encrypt and decrypt onclick events
encrypt.addEventListener('click',async e=>{
    clearTimeout(clear)
    e.preventDefault()
    let inp = e.target.parentElement.children[0]
    await fetch(enc,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({encrypt:!inp.value?undefined:clearWhiteSpaces(inp.value)})})
    .then(r=>r.json())
    .then(d=>{
        console.log(d.message)
        // store encryption value
        epara.textContent = d.message
    })
    clearTextarea(etextarea)
    
})
decrypt.addEventListener('click',async e=>{
    clearTimeout(clear)
    e.preventDefault()
    let inp = e.target.parentElement.children[0]
    await fetch(dec,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({decrypt:!inp.value?undefined:clearWhiteSpaces(inp.value),encrypt:epara.textContent})})
    .then(r=>{
        return r.json()
    })
    .then(d=>{
        console.log(d.message)
        // store decryption value
        dpara.textContent = d.message == 'err' ? 'Either your session ended, or the encryption key needs attention' : d.message
    })
    clearTextarea(dtextarea)
})

