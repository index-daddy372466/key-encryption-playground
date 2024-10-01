const genKeys = require("./genKeys.js");
const { encryptWithPublic } = require("./encrypt.js");
const { decryptWithPrivate } = require("./decrypt.js");
const fs = require("fs");
const crypto = "/crypto";
const  { createHmac, createSign, createVerify, randomBytes, createCipheriv, createDecipheriv } = require('crypto')


// generate keys
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

// encrypt and decrypt message
// create variables to throw in the encryption-blender
const msg = ['I am a beauiful Squirrel','eat my cheeseCake!','Life is good'][Math.floor(Math.random() * 3)]
const ky = randomBytes(32)
const iv = randomBytes(16)
const cipher = createCipheriv('aes-256-gcm', ky, iv);
// encryption blender - basic concept of encrypting and decrypting data
const encryptionBlender = cipher.update(msg, 'utf-8','hex') + cipher.final('hex');
// console.log(encryptionBlender)
console.log("")


const encryptedData = encryptWithPublic(public,Buffer.from(msg))
console.log('ciphered data')
console.log(encryptedData.toString('hex'))
console.log("")

// decrypt the encrypted data
const decryptedData = decryptWithPrivate(private,encryptedData)
console.log('deciphered data')
console.log(decryptedData.toString('utf-8'))
console.log("")


// const randomtext = "random-text";
const encode = encryptWithPublic(public, msg);
const decode = decryptWithPrivate(private, encode)

console.log("encryption process")
let encryptionProcess = [encode,decode].reduce((a,b)=>{
    console.log(a+"\n\n"+b)
})
console.log("")
// hash based message authentication code
console.log("HMAC process")
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


