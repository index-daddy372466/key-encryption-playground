const express = require("express");
const app = express();
PORT = 3423;
const cors = require("cors");
const path = require("path");
const cookiesesh = require("cookie-session");
const { createCipheriv, createDecipheriv, randomBytes } = require("crypto");

// middleware
app.set("views", path.resolve(__dirname, "../public"));
app.set("view engine", "ejs");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "../public")));
app.use(
  cookiesesh({
    name: "session",
    maxAge: 60000,
    secret: "dont use this secret example",
    priority: "medium",
    secure: false,
    httpOnly: false,
  })
);
// on each refresh, the id changes
app.use(encryptUsers)
app.use(checksamesession)
// app.use(encryptUsers);

// create an id on create time (date.now())
const createId = (id, key, salt) => {
  const cipher = createCipheriv("aes-256-gcm", key, salt);
  const encryptId = cipher.update(id, "utf-8", "hex") + cipher.final("hex");
  // decrypt id to check
  // create decipher with (alg, key, iv)
  const decipher = createDecipheriv("aes-256-gcm", key, salt);
  // buffering the encrypted data as 'hex' and reading it as plain text, store into variable
  let decrypted = decipher.update(Buffer.from(encryptId, "hex"), "utf-8");
  // buffer from decipher
  decrypted = Buffer.from(decrypted);
  // return encrypted id
  return encryptId;
}; // store user into array (fake database) after creating their id

// home
app.route("/").get((req, res) => {
    console.log(req.session)
  res.render("index.ejs");
});

app.route("/api/encrypt").post((req, res) => {
    const { encrypt } = req.body
    console.log(encrypt)
  // encrypt the message

  if(req.session){
    req.session.key = randomBytes(32)
    req.session.iv = randomBytes(16)
    console.log(req.session.key)
    console.log(req.session.iv)
    const cipher = createCipheriv('aes-256-gcm',req.session.key,req.session.iv)
    const encryptedMessage = cipher.update(encrypt,'utf-8','hex')+cipher.final("hex");
    res.json({message:encryptedMessage})
  }
});

app.route("/api/decrypt").post((req, res) => {
    const { decrypt, encrypt } = req.body
    

  try{
    // decrypt message
    if(req.session && encrypt === decrypt){
    const decipher = createDecipheriv('aes-256-gcm',Buffer.from(req.session.key),Buffer.from(req.session.iv))
    const decryptedMessage = Buffer.from(decipher.update(Buffer.from(decrypt,'hex'),'utf-8'))
    res.json({message:decryptedMessage.toString()})
  }  else {
    res.json({message:'err'})
  }
  }
  catch(err){
    console.log(err.code)
    res.json({message:'err'})
  }
});


// encrypt users
function encryptUsers(req, res, next) {
    let paths = ['/api/decrypt','/api/encrypt']
    if(!paths.includes(req.path)){
        let newdate = new Date()
        let id = newdate.getTime().toString();
        // encrypt the date with a cipher
        let key = randomBytes(32);
        let salt = randomBytes(16);
        if(req.session){
            req.session.id = createId(id,key,salt)
        }
    }
    next()
}
// check if session is current or expired
function checksamesession(req,res,next){
    if(req.session){
        if(req.session.isNew){
            console.log('NEW SESSION')
        }
        else {
            console.log('CURRENT/SAME SESSION')
        }
    }
    next();
}

app.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
