const genKeys = require('./genKeys.js')
const fs = require('fs')
const crypto = '/crypto'

genKeys();


// get public key
// get private key
const readDir = fs.readdirSync(__dirname+crypto,{withFileTypes:true})
// console.log(readDir)
let public,private;
readDir.forEach((d,i)=>{
    if(/pub/.test(d.name)){
        public = fs.readFileSync(__dirname+crypto+`/${d.name}`,{encoding:'utf-8'})
    }
    if(/priv/.test(d.name)){
        private = fs.readFileSync(__dirname+crypto+`/${d.name}`,{encoding:'utf-8'})
    }
})
console.log(public)
console.log(private)

