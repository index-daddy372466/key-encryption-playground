const genKeys = require("./genKeys.js");
const { encryptWithPublic } = require("./encrypt.js");
const { decryptWithPrivate } = require("./decrypt.js");
const fs = require("fs");
const crypto = "/crypto";
const  { createHmac, createSign, createVerify, scryptSync, randomBytes, createCipheriv, createDecipheriv, timingSafeEqual } = require('crypto')


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
const sampleobj = JSON.stringify({ok:'wow'})
const ky = randomBytes(32)
const iv = randomBytes(16)
const cipher = createCipheriv('aes-256-gcm', ky, iv);
// encryption blender - basic concept of encrypting and decrypting data
const encryptionBlender = cipher.update(sampleobj, 'utf-8','hex') + cipher.final('hex');
// console.log(encryptionBlender)
console.log("")


const encryptedData = encryptWithPublic(public,Buffer.from(sampleobj))
console.log('ciphered data')
console.log(encryptedData.toString('hex'))
console.log("")

// decrypt the encrypted data
const decryptedData = decryptWithPrivate(private,encryptedData)
console.log('deciphered data')
console.log(JSON.parse(decryptedData.toString('utf-8')))
console.log("")


// const randomtext = "random-text";
const encode = encryptWithPublic(public, Buffer.from(sampleobj));
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
console.log("")

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
console.log("signature")
console.log(signature)

// verify signatures

const verifier  = createVerify('rsa-sha256');
verifier.update(data2Sign)
const isVerified = verifier.verify(public, signature, 'hex')
console.log(isVerified)


// login with salt and hash
const users = []
console.log('signup')
function signup(email,password){
  const salt = randomBytes(16).toString('hex')
  // console.log('salt = '+salt)
  const hashed = scryptSync(password,salt,64).toString('hex')
  // console.log('hashed = '+hashed)
  const user = {email,password:`${salt}:${hashed}`}
  users.push(user)
  console.log(users)
}
console.log("")
console.log('login')
function login(email,password){
  const getUsers = [...users].find(u=>u.email===email)

  if(getUsers){
    const [salt,key] = getUsers.password.split(':')
    const hashedBuff = scryptSync(password,salt,64)
    const keyBuffer = Buffer.from(key,'hex')
    const match = timingSafeEqual(hashedBuff,keyBuffer)
    if(!match){
      console.log('username of password failed')
    } else {
      console.log('login success!')
    }
  }
  else {
    console.log('username of password failed')
  }

}
const failureExample = () => {
  signup('kyle@user.net','pw123')
  login('kyle@user.net','wrongpassword')
}
const successExample = () => {
  signup('kyle@user.io','newpw123')
  login('kyle@user.io','newpw123')
}
failureExample()
successExample()