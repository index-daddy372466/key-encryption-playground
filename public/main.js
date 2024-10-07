let enc = '/api/encrypt'
let dec = '/api/decrypt'

const encrypt = document.getElementById('encrypt')
const decrypt = document.getElementById('decrypt')
const formwrapper = document.getElementById('form-wrapper')
let paras = [...document.querySelectorAll('.para')]
let shadows = [...document.querySelectorAll('.shadow')]
const epara = document.getElementById('encrypt-para')
const dpara = document.getElementById('decrypt-para')
const dtextarea = document.getElementById('decrypt-input')
const etextarea = document.getElementById('encrypt-input')
const radiocontainer = document.querySelectorAll('.radio-container')
const aescontainer = document.querySelectorAll('.aes-container')
let radiobtns = document.querySelectorAll('.radiobtn')
let clear;

// onload listen event
window.onload = e => {
    // set paragraph pos
    const elemX = formwrapper.clientWidth / 2
    paras.forEach(x=>x.style = `left:${elemX-(x.clientWidth/2)}px`)
    shadows.forEach(x=>x.style = `left:${elemX-(x.clientWidth/2)}px`)

    // set radio container pos
    let rads = [...radiocontainer]
    rads.forEach((rad,idx) => {
        // set radio buttons same size as encrypt button
        rad.style = `right:${0}px;top:${(idx) * rad.clientHeight}px;width:${encrypt.clientWidth}px`
        
    })
     // set aew container pos
     let aess = [...aescontainer]
     aess.forEach((rad,idx) => {
         rad.style = `left:-${rad.clientWidth}px;top:${(idx) * rad.clientHeight}px`
     })
        

}
let rads = [...radiocontainer]
rads.forEach((r,idx)=>r.onclick = e =>{ 
    // unpress currently pressed btn-container
    rads.map(g=>{
        if(g.classList.contains('chosen')){
            g.classList.remove('chosen')
        }
    })
    // locate radio button & set it to true
    let radio = e.currentTarget.children[0]
    radio.checked = true
    // add chosen class
    r.classList.add('chosen')    
})

let aess = [...aescontainer]
aess.forEach((r,idx)=>r.onclick = e =>{ 
    // unpress currently pressed btn-container
    aess.map(g=>{
        if(g.classList.contains('chosen')){
            g.classList.remove('chosen')
        }
    })
    // locate radio button & set it to true
    let radio = e.currentTarget.children[0]
    radio.checked = true
    // add chosen class
    r.classList.add('chosen')    
})
window.onresize = e => {
    const elemX = formwrapper.clientWidth / 2
    paras.forEach(x=>x.style = `left:${elemX-(x.clientWidth/2)}px`)
    shadows.forEach(x=>x.style = `left:${elemX-(x.clientWidth/2)}px`)

    // set radio container pos
    let rads = [...radiocontainer]
    rads.forEach((rad,idx) => {
        // set radio buttons same size as encrypt button
        rad.style = `right:${0}px;top:${(idx) * rad.clientHeight}px;width:${encrypt.clientWidth}px`
        
    })
     // set aew container pos
     let aess = [...aescontainer]
     aess.forEach((rad,idx) => {
         rad.style = `left:-${rad.clientWidth}px;top:${(idx) * rad.clientHeight}px`
     })
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
let areas = [dtextarea,etextarea]
areas.forEach((d,idx)=>{
    d.oninput = e => {
        if(e.currentTarget == areas[idx]){
            clearTimeout(clear)
            clearTextarea(d)
        }
    }
})

// encrypt and decrypt onclick events
encrypt.addEventListener('click',async e=>{
    clearTimeout(clear)
    e.preventDefault()
    let inp = e.target.parentElement.children[0]
    let checked = [...radiobtns].filter(r=>r.checked)
    let len,aes
    checked.forEach((ch,ix)=>{
        if(ix==0){
            len = +[...checked[ix].classList][1]
        } else {
            aes = +[...checked[ix].classList][1]
        }
    })
    console.log(len)
    console.log(aes)
    await fetch(enc,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({encrypt:!inp.value?undefined:clearWhiteSpaces(inp.value),keylen:len,aes})})
    .then(r=>r.json())
    .then(d=>{
        console.log(d.message)
        // store encryption value
        epara.textContent = !d.message || d.message == 'err' ? 'No data entered' : d.message == 'inv-key-len' ? 'invalid key length' : d.message
        d.message == 'err' ? errText(epara) : regText(epara)
    })
    clearTextarea(etextarea)
    etextarea.focus()
    
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
        dpara.textContent = d.message == 'err' ? 'Either your session ended, or the encryption key needs attention' : d.message == 'inv-key-len' ? 'invalid key length' : d.message
        d.message == 'err' ? errText(dpara) : regText(dpara)
    })
    clearTextarea(dtextarea)
})

let decAndenc = [decrypt,encrypt]
decAndenc.forEach(btn =>{
    btn.onfocus = e => {
        if(e.currentTarget == btn)
        e.currentTarget.classList.add('focus-true')
    }
    btn.onblur = e => {
        if(e.currentTarget == btn)
         e.currentTarget.classList.remove('focus-true')
    }
})

// copy paragraphs

shadows.forEach((par,i)=>{
    let realparas = [epara,dpara]
    const copy = [...document.querySelectorAll('.fa-copy')]
    par.onclick = e => {
        console.log('paragraph clicked!')
        console.log(realparas[i].value)
        copyText(realparas[i].value);
        copy[i].classList.add('copy-click')
        if(par.children.length < 2){
            copyAlter(par)
        }

        setTimeout(()=>{
            copy[i].classList.remove('copy-click')
        },150)
        setTimeout(()=>{
            removeAlter(par)
        },1750)
    }
})

async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error(error.message);
    }
  }

  function copyAlter(par){
    par.classList.add('no-pointer')
    const p = document.createElement('p');
    p.classList.add('copy-para');
    p.textContent = 'copied!'
    par.appendChild(p);
  }
  function removeAlter(par){
    par.classList.remove('no-pointer')
    let p = par.children[1]
    console.log(p)
    par.removeChild(p)
  }


// mailbox
const mailentry = document.querySelector('.mail-entry')
const pubkey = document.querySelector('.pubkey')
// mailentry.onmouseenter = e => {
//     mailentry.classList.remove('close-mail-entry');
//     mailentry.classList.add('open-mail-entry');
//     setTimeout(()=>{
//         pubkey.classList.remove('key-hidden')
//     },150)
// }

// mailbox input
let inpval, dragging = false, securedMessage;
const mailboxinput = document.getElementById('env-input')
mailboxinput.onblur = e => {
    if(e.target.value){
        inpval = e.target.value
    } else {
        inpval = undefined
    }
    readyMessage(mailboxinput,inpval)
    console.log('fired!')
}
mailboxinput.ondragstart = e => {
    // enable dragging
    dragging = true
    securedMessage = !inpval ? 'Undefined data (click)' : 'Secured Message'
    mailboxinput.value = securedMessage
    mailboxinput.classList.add('ondrag')
}
document.ondragenter = e => {
    if(e.target == mailentry){
        document.querySelector('.handle').classList.add('mail-glow')
        console.log('you entered')
        mailentry.classList.remove('close-mail-entry');
        mailentry.classList.add('open-mail-entry');
    }
}
document.ondragleave = e => {
    if(e.target == mailentry){
        document.querySelector('.handle').classList.remove('mail-glow')
        console.log('you exited')
    }
}
document.ondragover = e => {
   e.preventDefault();
}
document.ondrop = async e => {
    mailentry.classList.remove('open-mail-entry')
    mailentry.classList.add('close-mail-entry')
    pubkey.classList.add('key-hidden')
    if(e.target == mailentry){
        restoreInput(mailboxinput,inpval)
        document.querySelector('.handle').classList.remove('mail-glow')
        console.log('you dropped a deuce')
        // post message to the server (if not undefined)
        if(!inpval){
            console.log('enter data before dropping')
        } else {
            await fetch('/api/encrypt/public',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:inpval})})
    .then(r=>r.json())
    .then(d=>{
        console.log(d.message)
    })
        }
    }
}
mailboxinput.ondragend = e => {
    // enable dragging
    dragging = false
}
mailboxinput.previousElementSibling.onsubmit = e => {
e.preventDefault()
}

window.onclick = e =>{
    console.log(mailboxinput.draggable)
    mailboxinput.disabled = false
    dragging = false;
    let x1,x2,y1,y2;
    x1 = mailboxinput.getBoundingClientRect().x
    x2 = mailboxinput.getBoundingClientRect().x + mailboxinput.clientWidth;
    y1 = mailboxinput.getBoundingClientRect().y;
    y2 = mailboxinput.getBoundingClientRect().y + mailboxinput.clientHeight;

    // console.log(e.pageX,e.pageY)
    if((e.pageX <= x2 && e.pageX >= x1) &&
          (e.pageY <= y2 && e.pageY >= y1)){
            if(mailboxinput.draggable == true){
                // console.log(dragging)
                // console.log('clicked')
                mailboxinput.classList.add('red-border')
                // console.log('inside the input true')
                setTimeout(()=>{
                    restoreInput(mailboxinput,inpval)
                },1250)
            } 
    }

}

// restore input to original state
function restoreInput(inp,inpval){
    inp.classList.remove('red-border')
    inp.setAttribute('draggable',false)
    inp.classList.remove('dragging')
    inp.classList.remove('minimize-env')
    inp.classList.add('no-border')
    inp.value = !inpval ? '' : inpval;
    console.log(inpval)
    inp.disabled = false
    inp.focus();
}
// ready the input for public key encryption
function readyMessage(inp,inpval){
    securedMessage = !inpval ? 'Undefined data (click)' : 'Secured Message'
    inp.classList.remove('no-border')
    inp.setAttribute('draggable',true)
    inp.classList.add('dragging')
    inp.classList.add('minimize-env')
    inp.classList.remove('nodrag')
    // send secured message to the server
   inp.value = securedMessage
}