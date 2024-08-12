const crypto = require("crypto"),
  fs = require("fs"),
  modLen = 4096,
  type = "pkcs1", // public key cryptography standards 1
  format = "pem", // common formatting choice
  path = require('path')

const encodingOptions = {
  type,
  format,
};
// function to generate key

function genKeys(){
  const keypair = crypto.generateKeyPairSync("rsa", {
    modulusLength: modLen,
    publicKeyEncoding: encodingOptions,
    privateKeyEncoding: encodingOptions,
  });

  
  const pubname = "/id_rsa_pub.pem",
        privname = "/id_rsa_priv.pem",
        dir = "/crypto";
        
    // write files
    fs.writeFileSync(path.join(__dirname,dir,pubname), keypair.publicKey);
    fs.writeFileSync(path.join(__dirname,dir,privname), keypair.privateKey);
  }

module.exports = genKeys;
