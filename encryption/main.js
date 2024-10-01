const genKeys = require("./genKeys.js");
const { encryptWithPublic } = require("./encrypt.js");
const { decryptWithPrivate } = require("./decrypt.js");
const fs = require("fs");
const crypto = "/crypto";
const  { createHmac, createSign, createVerify } = require('crypto')

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

// hash based message authentication code
const getHmac = () => {
  const key = 'hMac-K3y'
  const data = 'Hello World this is data'
  const hmac = createHmac('sha256',key).update(data).digest('hex')

  console.log(hmac)
  return hmac
}

getHmac()

// Hash function H	b, bytes	L, bytes
// MD5	             64	16
// SHA-1	           64	20
// SHA-224	         64	28
// SHA-256         	 64	32
// SHA-512/224	     128	28
// SHA-512/256	     128	32
// SHA-384	         128	48
// SHA-512	         128	64[5]
// SHA3-224	         144	28
// SHA3-256	         136	32
// SHA3-384	         104	48
// SHA3-512	         72	64[6]

// creating signatures
const data2Sign = 'data 2 sign'
const signer = createSign('rsa-sha256')
signer.update(data2Sign)
const signature = signer.sign(private,'hex')

console.log(signature)

// verify signatures

const verifier  = createVerify('rsa-sha256');
verifier.update(data2Sign)
const isVerified = verifier.verify(public, signature, 'hex')
console.log(isVerified)


