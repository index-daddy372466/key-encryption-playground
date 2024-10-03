let enc = '/api/encrypt'
let dec = '/api/decrypt'

const encrypt = document.getElementById('encrypt')
const decrypt = document.getElementById('decrypt')
const formwrapper = document.getElementById('form-wrapper')
let paras = document.querySelectorAll('.para')
let shadows = document.querySelectorAll('.shadow')
const epara = document.getElementById('encrypt-para')
const dpara = document.getElementById('decrypt-para')
const dtextarea = document.getElementById('decrypt-input')
const etextarea = document.getElementById('encrypt-input')
let clear;
window.onload = e => {
    const elemX = formwrapper.clientWidth / 2
    paras = [...paras].map(x=>x.style = `left:${elemX-(x.clientWidth/2)}px`)
    shadows = [...shadows].map(x=>x.style = `left:${elemX-(x.clientWidth/2)}px`)
}
window.onresize = e => {
    const elemX = formwrapper.clientWidth / 2
    paras = [...paras].map(x=>x.style = `left:${elemX-(x.clientWidth/2)}px`)
    shadows = [...shadows].forEach(x=>x.style = `left:${elemX-(x.clientWidth/2)}px`)
}

function clearTextarea(textarea){
   clear = setTimeout(()=>textarea.value = '',5000)
}
function clearWhiteSpaces(text){
    return text.replace(/(^\s+|\s+$)/g,'')
}
function errText(elem){
    elem.classList.remove('black-text')
    elem.classList.add('red-text')
}
function regText(elem){
    elem.classList.add('black-text')
    elem.classList.remove('red-text')
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
        epara.textContent = !d.message || d.message == 'err' ? 'No data entered' : d.message
        d.message == 'err' ? errText(epara) : regText(epara)
    })
    clearTextarea(etextarea)
    
})
decrypt.addEventListener('click',async e=>{
    clearTimeout(clear)
    e.preventDefault()
    let inp = e.target.parentElement.children[0]
    await fetch(dec,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({decrypt:!inp.value?undefined:clearWhiteSpaces(inp.value),encrypt:epara.textContent})})
    .then(r=>r.json())
    .then(d=>{
        console.log(d.message)
        // store decryption value
        dpara.textContent = d.message == 'err' ? 'Either your session ended, or the encryption key needs attention' : d.message
        d.message == 'err' ? errText(dpara) : regText(dpara)
    })
    clearTextarea(dtextarea)
})

// copy paragraphs

shadows.forEach((par,i)=>{
    let realparas = [epara,dpara]
    const copy = [...document.querySelectorAll('.fa-copy')]
    par.onclick = e => {
        console.log('paragraph clicked!')
        console.log(realparas[i].value)
        navigator.clipboard.writeText(realparas[i].value);
        copy[i].classList.add('copy-click')
        setTimeout(()=>{
            copy[i].classList.remove('copy-click')
        },150)
    }
})

