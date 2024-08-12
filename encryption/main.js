const genKeys = require("./genKeys.js");
const { encryptWithPublic } = require("./encrypt.js");
const { decryptWithPrivate } = require("./decrypt.js");
const fs = require("fs");
const crypto = "/crypto";

genKeys();

// get public key
// get private key
const readDir = fs.readdirSync(__dirname + crypto, { withFileTypes: true });
// console.log(readDir)
let public, private;
readDir.forEach((d, i) => {
  if (/pub/.test(d.name)) {
    public = fs.readFileSync(__dirname + crypto + `/${d.name}`, {
      encoding: "utf-8",
    });
  }
  if (/priv/.test(d.name)) {
    private = fs.readFileSync(__dirname + crypto + `/${d.name}`, {
      encoding: "utf-8",
    });
  }
});

const encode = encryptWithPublic(public, "fuck this");
const decode = decryptWithPrivate(private, encode)

let encryptionProcess = [encode,decode].reduce((a,b)=>{
    console.log(a+"\n\n"+b)
    return a+"\n\n"+b
})

