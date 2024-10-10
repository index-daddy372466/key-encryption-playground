let enc = "/api/encrypt";
let dec = "/api/decrypt";

const encrypt = document.getElementById("encrypt");
const decrypt = document.getElementById("decrypt");
const formwrapper = document.getElementById("form-wrapper");
let paras = [...document.querySelectorAll(".para")];
let shadows = [...document.querySelectorAll(".shadow")];
const epara = document.getElementById("encrypt-para");
const dpara = document.getElementById("decrypt-para");
const dtextarea = document.getElementById("decrypt-input");
const etextarea = document.getElementById("encrypt-input");
const radiocontainer = document.querySelectorAll(".radio-container");
const aescontainer = document.querySelectorAll(".aes-container");
let radiobtns = document.querySelectorAll(".radiobtn");
const mailentry = document.querySelector(".mail-entry");
const mailexit = document.querySelector(".mail-exit");
const pubkey = document.querySelector(".pubkey");
const mailfob = document.querySelector(".keyhole");
const mailboxinput = document.getElementById("env-input");

const instructionset = {
  message: document.querySelector(".ins1"),
  key: document.querySelector(".ins2"),
  status: document.querySelector(".ins3"),
  hexstr: document.querySelector(".ins4"),
};
let inpval,
  dragging = false,
  securedMessage,
  current_drag,
  encrypted,
  startPos = {},
  clear,
  aess = [...aescontainer];


instructionset.hexstr.onclick = (e) => {
  copyText(e.target.textContent);
  copyAlert(e.target);
  setTimeout(() => {
    e.target.classList.remove("copy-click");
  }, 150);
  setTimeout(() => {
    removeAlert(e.target);
  }, 1750);
};
// onload listen event
window.onload = (e) => {
  document.querySelector(".env").classList.remove("key-hidden");
  document.querySelector(".env").style = `left: 50px;top:75px;`;
  document.querySelector("#privkey-container").style = `right: 50px;bottom:100px`;
  // set paragraph pos
  const elemX = formwrapper.clientWidth / 2;
  paras.forEach((x) => (x.style = `left:${elemX - x.clientWidth / 2}px`));
  shadows.forEach((x) => (x.style = `left:${elemX - x.clientWidth / 2}px`));

  // set radio container pos
  let rads = [...radiocontainer];
  rads.forEach((rad, idx) => {
    // set radio buttons same size as encrypt button
    rad.style = `right:${0}px;top:${idx * rad.clientHeight}px;width:${
      encrypt.clientWidth
    }px`;
  });
  // set aew container pos
  let aess = [...aescontainer];
  aess.forEach((rad, idx) => {
    rad.style = `left:-${rad.clientWidth}px;top:${idx * rad.clientHeight}px`;
  });
};
let rads = [...radiocontainer];
rads.forEach(
  (r, idx) =>
    (r.onclick = (e) => {
      // unpress currently pressed btn-container
      rads.map((g) => {
        if (g.classList.contains("chosen")) {
          g.classList.remove("chosen");
        }
      });
      // locate radio button & set it to true
      let radio = e.currentTarget.children[0];
      radio.checked = true;
      // add chosen class
      r.classList.add("chosen");
    })
);

aess.forEach(
  (r, idx) =>
    (r.onclick = (e) => {
      // unpress currently pressed btn-container
      aess.map((g) => {
        if (g.classList.contains("chosen")) {
          g.classList.remove("chosen");
        }
      });
      // locate radio button & set it to true
      let radio = e.currentTarget.children[0];
      radio.checked = true;
      // add chosen class
      r.classList.add("chosen");
    })
);
window.onresize = (e) => {
  const elemX = formwrapper.clientWidth / 2;
  paras.forEach((x) => (x.style = `left:${elemX - x.clientWidth / 2}px`));
  shadows.forEach((x) => (x.style = `left:${elemX - x.clientWidth / 2}px`));

  // set radio container pos
  let rads = [...radiocontainer];
  rads.forEach((rad, idx) => {
    // set radio buttons same size as encrypt button
    rad.style = `right:${0}px;top:${idx * rad.clientHeight}px;width:${
      encrypt.clientWidth
    }px`;
  });
  // set aew container pos
  let aess = [...aescontainer];
  aess.forEach((rad, idx) => {
    rad.style = `left:-${rad.clientWidth}px;top:${idx * rad.clientHeight}px`;
  });
};

// input event
let areas = [dtextarea, etextarea];
areas.forEach((d, idx) => {
  d.oninput = (e) => {
    if (e.currentTarget == areas[idx]) {
      clearTimeout(clear);
      clearTextarea(d);
    }
  };
});
// encrypt and decrypt onclick events
encrypt.addEventListener("click", async (e) => {
  clearTimeout(clear);
  e.preventDefault();
  let inp = e.target.parentElement.children[0];
  let checked = [...radiobtns].filter((r) => r.checked);
  let len, aes;
  checked.forEach((ch, ix) => {
    if (ix == 0) {
      len = +[...checked[ix].classList][1];
    } else {
      aes = +[...checked[ix].classList][1];
    }
  });
  console.log(len);
  console.log(aes);
  await fetch(enc, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      encrypt: !inp.value ? undefined : clearWhiteSpaces(inp.value),
      keylen: len,
      aes,
    }),
  })
    .then((r) => r.json())
    .then((d) => {
      console.log(d.message);
      // store encryption value
      epara.textContent =
        !d.message || d.message == "err"
          ? "No data entered"
          : d.message == "inv-key-len"
          ? "invalid key length"
          : d.message;
      d.message == "err" ? errText(epara) : regText(epara);
    });
  clearTextarea(etextarea);
  etextarea.focus();
});
decrypt.addEventListener("click", async (e) => {
  clearTimeout(clear);
  e.preventDefault();
  let inp = e.target.parentElement.children[0];
  await fetch(dec, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      decrypt: !inp.value ? undefined : clearWhiteSpaces(inp.value),
      encrypt: epara.textContent,
    }),
  })
    .then((r) => r.json())
    .then((d) => {
      console.log(d.message);
      // store decryption value
      dpara.textContent =
        d.message == "err"
          ? "Either your session ended, or the encryption key needs attention"
          : d.message == "inv-key-len"
          ? "invalid key length"
          : d.message;
      d.message == "err" ? errText(dpara) : regText(dpara);
    });
  clearTextarea(dtextarea);
});
let decAndenc = [decrypt, encrypt];
decAndenc.forEach((btn) => {
  btn.onfocus = (e) => {
    if (e.currentTarget == btn) e.currentTarget.classList.add("focus-true");
  };
  btn.onblur = (e) => {
    if (e.currentTarget == btn) e.currentTarget.classList.remove("focus-true");
  };
});
shadows.forEach((par, i) => {
  let realparas = [epara, dpara];
  const copy = [...document.querySelectorAll(".fa-copy")];
  par.onclick = (e) => {
    console.log("paragraph clicked!");
    console.log(realparas[i].value);
    copyText(realparas[i].value);
    copy[i].classList.add("copy-click");
    if (par.children.length < 2) {
      copyAlert(par);
    }

    setTimeout(() => {
      copy[i].classList.remove("copy-click");
    }, 150);
    setTimeout(() => {
      removeAlert(par);
    }, 1750);
  };
});

// envelope input
// onblur envelope input
mailboxinput.onblur = (e) => {
  if (e.target.value) {
    inpval = e.target.value;
  } else {
    inpval = undefined;
  }
};
// envelope-form onsubmit
mailboxinput.previousElementSibling.onsubmit = (e) => {
  e.preventDefault();
};

// drag element function
dragElement(document.querySelector(".env"));
dragElement(document.querySelector("#privkey-container"));
mailboxinput.onclick = (e) => activateInput(mailboxinput);
function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  elmnt.onmousedown = (e) => dragMouseDown(e);
  elmnt.ontouchstart = e => dragMouseDown(e)
  startPos.x = elmnt.getBoundingClientRect().x;
  startPos.y = elmnt.getBoundingClientRect().y;

  function dragMouseDown(e) {
    if(e.currentTarget == mailboxinput.parentElement){
      if(!document.querySelector('.privkey').classList.contains('key-hidden')){
        document.querySelector('.privkey').classList.add('key-hidden')
        instructionset.key.classList.add('key-hidden')
      }
    }
    dragging = true;
    current_drag = e.currentTarget;
    if (e.target !== mailboxinput) {
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = (e) => closeDragElement(e);
      // call a function whenever the cursor moves:
      document.onmousemove = (e) => elementDrag(e);
      document.addEventListener('touchmove',elementDrag)
    }
    if (elmnt == mailboxinput.parentElement || mailboxinput.focus()) {
      mailfob.classList.remove("unlock-mailbox");
      mailfob.classList.add("lock-mailbox");
      mailexit.classList.add("close-mail-exit");
      mailexit.classList.remove("open-mail-exit");
      mailfob.classList.add("no-keyglow");
      mailfob.classList.remove("yes-keyglow");
      document.querySelector(".decoded-word").classList.add("key-hidden");
      document.querySelector(".decoded-word").textContent = "";
    }
  }

  function elementDrag(e) {
    console.log(e.clientX,e.clientY)
    // if drag == mailbox (yellow borders)
    if (current_drag == mailboxinput.parentElement) {
      current_drag.classList.remove("indicate-border");
      readyMessage(mailboxinput, inpval);
      if (dragging == true) {
        if (insideElement(current_drag, mailentry)) {
          hoverOverMailboxTop();
        } else {
          mailboxinput.disabled = false;
          hoverOutMailboxTop();
        }
      } else {
        hoverOutMailboxTop();
      }

    }
    // if drag == red private key
    if(current_drag == document.querySelector('#privkey-container')){
      if(insideElement(current_drag,mailfob)){
        mailfob.classList.add('yes-keyglow');
        mailfob.classList.remove('no-keyglow');
      } else {
        mailfob.classList.add('no-keyglow');
        mailfob.classList.remove('yes-keyglow');
      }
    }
    // startX = e.changedTouches[0].pageX;
    // startY = e.changedTouches[0].pageY;
    // new X,Y position:
    pos1 = pos3 - e.clientX|e
    pos2 = pos4 - e.clientY|e
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  async function closeDragElement(e) {
    dragging = false;
    hoverOutMailboxTop();
    // if current_drag == .env element
    if (current_drag == mailboxinput.parentElement) {
      // set mailbox value
      mailboxinput.value = !inpval ? "" : inpval;
      // restore input
      restoreInput(mailboxinput, inpval);
      /* stop moving when mouse button is released:*/
      if (insideElement(current_drag, mailentry)) {
        mailboxinput.disabled = true;
        hoverOutMailboxTop();
        // post message to the server (if not undefined)
        instructionset.hexstr.classList.remove('key-hidden')
        // if input is undefined
        if (!inpval) {
          mailentry.classList.remove('reg-border')
          mailentry.classList.add('mail-fail')
          console.log("enter data before dropping");
          const noData = "No data inserted";
          instructionset.status.textContent = noData;
          instructionset.hexstr.textContent = noData;
        } else {
          // reveal public key
          mailentry.classList.remove('mail-fail')
          mailentry.classList.remove("mail-glow");
          mailentry.classList.add('reg-border');
          const yesData = "mail encrypted";
          instructionset.status.textContent = yesData;
          instructionset.key.classList.remove("key-hidden");
          document.querySelector(".privkey").classList.remove("key-hidden");
          document.querySelector("#privkey-container").classList.add("spring-key");
          
          document.querySelector(".env").style = `left: 50px;top:50px;`;
          document.querySelector("#privkey-container").style = `right: 50px;bottom:100px`;
          console.log(document.querySelector("#privkey-container"))
          await fetch("/api/encrypt/public", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: inpval }),
          })
            .then((r) => r.json())
            .then((d) => {
              console.log(d.message);
              // show encrypted data
              instructionset.hexstr.textContent = d.message;
              return !d.message ? null : (encrypted = d.message);
            });
        }
      }
    }
    // if private key enters keyhole
    if (
      current_drag.id == "privkey-container" &&
      insideElement(current_drag, mailfob)
    ) {
      const yesKey = "mail decrypted";
      instructionset.status.textContent = yesKey;
      mailfob.classList.remove("lock-mailbox");
      mailfob.classList.add("unlock-mailbox");
      mailfob.classList.add("mail-glow");
      mailfob.classList.remove("no-keyglow");
      mailfob.classList.add("yes-keyglow");
      mailfob.classList.add("mail-glow");
      document.querySelector("#privkey-container").classList.remove("spring-key");
      document.querySelector(".privkey").classList.add("key-hidden");
      
      document.querySelector("#privkey-container").style = `right: 50px;bottom:100px`;

      mailboxinput.parentElement.classList.add("no-pointer");
      await fetch(`/api/decrypt/${encrypted}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then((r) => r.json())
        .then((d) => {
          console.log(d.message);
          document.querySelector(".decoded-word").textContent = d.message;
        });

      setTimeout(() => {
        mailboxinput.parentElement.classList.toggle("indicate-border");
        mailexit.classList.remove("close-mail-exit");
        mailexit.classList.add("open-mail-exit");
        document.querySelector(".decoded-word").classList.remove("key-hidden");
        mailboxinput.parentElement.classList.remove("no-pointer");
      }, 2250);
    }

    document.onmousemove = null;
  }
}

// signatures
const signForm = document.querySelector('#form-sign')
const verifyForm = document.querySelector('#form-verify')
const formTextareas = [...document.querySelectorAll('.sign-child-container>textarea')]
const verifyBtn = document.querySelector('#verify-button')
const boolarea = document.getElementById('boolarea')
const plainarea2 = document.querySelector('#plainarea2')
let rsa = document.getElementById('rsaarea')
let signatureForms = [signForm,verifyForm]
signatureForms.forEach(form=>{
  form.onsubmit = e => {
    e.preventDefault()
  }
})
formTextareas.forEach(area=>{
  let signarea = /^plainarea$/.test(area.id)

  if(signarea){
    console.log(area)
    area.oninput = async e => {
      if(e.target.value==''||!e.target.value){
          rsa.value = ''
      }
      boolarea.classList.remove('redbg')
      boolarea.classList.remove('greenbg')
      boolarea.textContent = ''
      e.target.value = releaseBeast(e.target.value)
      await fetch(`/api/sign/${e.target.value}`,{
        method:'POST',
        headers:{
        'Content-Type':'application/json',
      },
    body:JSON.stringify({message:e.target.value})}).then(r=>r.json()).then(d=>{
      if(d.message){
        rsa.value = d.message
        plainarea2.value = e.target.value

      }
    })
    }
  }
})
// verify signature
verifyBtn.onclick = async e => {
  if(rsa.value){
    await fetch(`/api/verify/${rsa.value}`,{
      method:'POST',
      headers:{
      'Content-Type':'application/json',
    },
    body:JSON.stringify({plain:plainarea2.value})}).then(r=>r.json()).then(d=>{
      boolarea.textContent = d.bool
      if(!d.bool){
        boolarea.classList.remove('greenbg')
        boolarea.classList.add('redbg')
      } else { 
        boolarea.classList.add('greenbg')
        boolarea.classList.remove('redbg')
      }
    })
  }
  if(plainarea2.value && !rsa.value){
    boolarea.textContent = 'data has not been signed'
    boolarea.classList.add('redbg')
  }
  if(!plainarea2.value && rsa.value){
    boolarea.textContent = 'no message to verify'
    boolarea.classList.add('redbg')
  }
  
}





// functions
// restore input to original state
function releaseBeast(text){
  return text.replace(/[\/|\\|~|*|\r|\n]/gi,'')
}
function restoreInput(inp, inpval) {
  inp.classList.remove("red-border");
  inp.setAttribute("draggable", false);
  inp.classList.remove("minimize-env");
  inp.classList.add("no-border");
  inp.value = !inpval ? "" : inpval;
  console.log(inpval);
  inp.disabled = false;
}
function readyMessage(inp, inpval) {
  inp.disabled = true;
  securedMessage = !inpval ? "Undefined data" : "Secured Message";
  inp.classList.remove("no-border");
  inp.classList.add("minimize-env");
  // send secured message to the server
  inp.value = securedMessage;
}
function hoverOverMailboxTop() {
  document.querySelector(".handle").classList.add("handle-glow");
  mailentry.classList.remove('reg-border')
  if(!inpval){
    mailentry.classList.add('mail-fail')
    mailentry.classList.remove('mail-glow')
  } else {
    mailentry.classList.remove('mail-fail')
    mailentry.classList.add('mail-glow')
  }
  mailentry.classList.remove("close-mail-entry");
  mailentry.classList.add("open-mail-entry");
  pubkey.classList.remove("key-hidden");
}
function hoverOutMailboxTop() {
  document.querySelector(".handle").classList.remove("handle-glow");
  mailentry.classList.add("close-mail-entry");
  mailentry.classList.remove("open-mail-entry");
  pubkey.classList.add("key-hidden");
}
function insideElement(curr, elem) {
  let x1, y1, x2, y2;
  x1 = elem.getBoundingClientRect().x;
  y1 = elem.getBoundingClientRect().y;
  x2 = x1 + elem.clientWidth;
  y2 = y1 + elem.clientHeight;
  return (
    (curr.getBoundingClientRect().x + curr.clientWidth/2) <= x2 &&
    (curr.getBoundingClientRect().x + curr.clientWidth/2) >= x1 &&
    curr.getBoundingClientRect().y + (curr.clientHeight/2) <= y2 &&
    curr.getBoundingClientRect().y + (curr.clientHeight/2) >= y1
  );
}
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error(error.message);
  }
}
function copyAlert(par) {
  par.classList.add("no-pointer");
  const p = document.createElement("p");
  p.classList.add("copy-para");
  p.textContent = "copied!";
  par.appendChild(p);
}
function removeAlert(par) {
  par.classList.remove("no-pointer");
  let p = par.children[1] || par.children[0];
  console.log(p);
  par.removeChild(p);
}
function clearTextarea(textarea) {
  clear = setTimeout(() => (textarea.value = ""), 5000);
}
function clearWhiteSpaces(text) {
  return text.replace(/(^\s+|\s+$)/g, "");
}
function errText(elem) {
  elem.classList.remove("black-text");
  elem.classList.add("red-text");
}
function regText(elem) {
  elem.classList.add("black-text");
  elem.classList.remove("red-text");
}
function activateInput(elm) {
  if (elm.disabled == true) {
    elm.clasList.add("red-border");
    setTimeout(() => {
      elm.classList.remove("minimize-env");
    }, 2000);
  }
}
