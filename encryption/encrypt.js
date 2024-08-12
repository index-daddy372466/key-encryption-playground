const crypto = require('crypto')

// encrypt with public key
function encryptWithPublic(publicKey,message){
// encode key with buffer
const buffer = Buffer.from(message,'utf8')

// return
return crypto.publicEncrypt(publicKey,buffer)
}



module.exports.encryptWithPublic = encryptWithPublic