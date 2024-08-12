const crypto = "../encryption/crypto";
const fs = require('fs')
const { encryptWithPrivate } = require('../encryption/encrypt.js')
const { decryptWithPublic } = require('../encryption/decrypt.js')

const path = require('path')

// get public key
// get private key
const readDir = fs.readdirSync(path.resolve(__dirname,crypto), { withFileTypes: true });
// console.log(readDir)
let public, private;
readDir.forEach((d, i) => {
  if (/pub/.test(d.name)) {
    public = fs.readFileSync(path.resolve(__dirname,crypto) + `/${d.name}`, {
      encoding: "utf-8",
    });
  }
  if (/priv/.test(d.name)) {
    private = fs.readFileSync(path.resolve(__dirname,crypto) + `/${d.name}`, {
      encoding: "utf-8",
    });
  }
});

const encode = encryptWithPrivate(private,'secret message')
const decode = decryptWithPublic(public,encode)

let verificationProcess = [encode,decode].reduce((a,b)=>{
    console.log(a+"\n\n"+b)
    return a+"\n\n"+b
})
