const express = require('express')
const app = express()
PORT = 3423
const cors = require('cors')
const path = require('path')
const cookiesesh = require('cookie-session')
let users = []



// middleware
app.set('views',path.resolve(__dirname,'../public'))
app.set('view engine', 'ejs')
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname,'../public')))
app.use(cookiesesh({
    name:'session',
    maxAge:24 * 60 * 60 * 1000,
    secret:'dont use this secret example',
    priority:'medium',
    secure:false,
    httpOnly:false
}))
app.use((req,res,next)=>{
    let id = new Date().getTime().toString()
            // encrypt the date with a cipher
            let key = randomBytes(32)
            let salt = randomBytes(16)
    // verify if user is currently connected(in users array)
    if(req.session.hasOwnProperty('id')){
    
        let userfound = users.find(u=>u.id == req.session.id)
        console.log(userfound)
        if(userfound){
            console.log('user exists')
        } else {
        req.session.id = null;
        req.session.id = saveUser(users,createId(id,key,salt))
        }
    }
    else { 
        req.session.id = saveUser(users,createId(id,key,salt))
    }
    console.log(req.session)
    console.log(users)
    next()
})
// create an id on create time (date.now())
const { createCipheriv, createDecipheriv, randomBytes } = require('crypto')
const createId = (id,key,salt) => {
    const cipher = createCipheriv('aes-256-gcm', key, salt);
    const encryptId = cipher.update(id,'utf-8','hex') + cipher.final('hex')
    console.log(id)

    // decrypt id to check
    // create decipher with (alg, key, iv)
    const decipher = createDecipheriv('aes-256-gcm',key,salt)
    // buffering the encrypted data as 'hex' and reading it as plain text, store into variable
    let decrypted = decipher.update(Buffer.from(encryptId,'hex'),'utf-8')
    console.log(encryptId)
    // buffer from decipher
    decrypted = Buffer.from(decrypted);
    console.log(decrypted.toString())
    // return encrypted id
    return encryptId
}
const saveUser = (arr,user) => {
    arr.push({id:user})
    return user
}


// home
app.route('/').get((req,res)=>{
    res.render('index.ejs')
})

app.route('/api/encrypt').post((req,res)=>{
// encrypt the message
})

app.route('/api/decrypt').post((req,res)=>{
    
})

// encrypt message


// decrypt message












app.listen(PORT,()=>{
    console.log('listening on port '+PORT)
})