const crypto = require('crypto')

function decryptWithPrivate(privateKey,message){
    return crypto.privateDecrypt(privateKey,message)
}


module.exports.decryptWithPrivate = decryptWithPrivate