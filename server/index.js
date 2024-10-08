require("dotenv").config();
const express = require("express");
const app = express();
PORT = 3423;
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const cookiesesh = require("cookie-session");
const genKeys = require("../encryption/genKeys.js");
const {
  createCipheriv,
  createHmac,
  createDecipheriv,
  randomBytes,
} = require("crypto");
const crypto = require("crypto");
// generage pub key
genKeys();
// read pub key file and allocate 32 bytes from the file
// store buffer in pubKey variable
let secKey = Buffer.alloc(32, process.env.SECRETY);
let privKey = fs.readFileSync(
  path.resolve(__dirname, "../encryption/crypto/id_rsa_priv.pem"),
  { encoding: "utf-8" }
);
let pubKey = fs.readFileSync(
  path.resolve(__dirname, "../encryption/crypto/id_rsa_pub.pem"),
  { encoding: "utf-8" }
);
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
app.use(encryptUsers);
app.use(checksamesession);
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
  console.log("initial vector");
  res.render("index.ejs");
});

let iv;
app.route("/api/encrypt").post((req, res) => {
  const { encrypt, keylen, aes } = req.body;
  // store aes in current session
  req.session.aes = aes;
  console.log(encrypt, keylen, aes);
  // encrypt the message
  try {
    if (req.session && encrypt) {
      // utilize generated public key
      // secKey
      // hash (chop and mix) the public key
      // create a sha256 hash of the longer public key
      key = createHmac("sha256", process.env.SECRETY)
        .update(secKey)
        .digest("hex");
      console.log("hashed key: ");
      // allocate 32 bits for this scenario and use the public,hashed key

      req.session.key = Buffer.alloc(keylen, key);
      iv = randomBytes(16);
      const cipher = createCipheriv(`aes-${aes}-gcm`, req.session.key, iv);

      console.log("initial vector (encrypt)");
      console.log(iv);
      const encryptedMessage =
        cipher.update(encrypt, "utf-8", "hex") + cipher.final("hex");
      res.json({ message: encryptedMessage });
    } else {
      res.json({ message: "err" });
    }
  } catch (err) {
    if (/^ERR_INVALID_ARG_TYPE$/i.test(err.code)) {
      res.json({ message: "err" });
      throw new Error(err);
    } else if (/^ERR_CRYPTO_INVALID_KEYLEN$/i.test(err.code)) {
      res.json({ message: "inv-key-len" });
      throw new Error(err);
    } else {
      console.log(err.code);
      throw new Error(err);
    }
  }
});
app.route("/api/decrypt").post((req, res) => {
  const { decrypt, encrypt } = req.body;

  try {
    // decrypt message
    if (req.session && encrypt === decrypt) {
      const decipher = createDecipheriv(
        `aes-${req.session.aes}-gcm`,
        Buffer.from(req.session.key),
        Buffer.from(iv)
      );
      console.log("initial vector (decrypt)");
      console.log(iv);
      const decryptedMessage = Buffer.from(
        decipher.update(Buffer.from(decrypt, "hex"), "utf-8")
      );
      res.json({ message: decryptedMessage.toString() });
    } else {
      res.json({ message: "err" });
    }
  } catch (err) {
    if (/^ERR_INVALID_ARG_TYPE$/i.test(err.code)) {
      res.json({ message: "err" });
    } else if (/^ERR_CRYPTO_INVALID_KEYLEN$/i.test(err.code)) {
      res.json({ message: "inv-key-len" });
      throw new Error(err);
    } else {
      console.log(err.code);
      throw new Error(err);
    }
  }
});
// encrypt data with public key
app.route("/api/encrypt/public").post((req, res) => {
  const message = req.body.message;
  try {
    if (message) {
      // buffer the message
      const buffer = Buffer.from(message)
      // encrypt data
      let encryptedData = crypto.publicEncrypt(
        pubKey,
        buffer
      );
      // convert encrypted data to hex
      let encData = encryptedData.toString('hex')
      res.json({
        message: encData,
      });
    } else {
      console.log(message);
      res.json({ message: undefined });
    }
  } catch (err) {
    throw new Error(err);
  }
});
// decrypt data with private key 
app.route("/api/decrypt/:message").get((req, res) => {
  const message = req.params.message;
  console.log(message)
  try {
    if (message) {
      // buffer the hex data from encrypted message
      const buffer = Buffer.from(message,'hex')
      // decrypt data with private key 
      let decData = crypto.privateDecrypt(
        privKey,
        buffer
      );
      // send decrypted data
      res.json({ message: decData.toString('utf-8') });
    } else {
      res.json({ message: undefined });
    }
  } catch (err) {
    throw new Error(err);
  }
});

// encrypt users
function encryptUsers(req, res, next) {
  // console.log('user id!')
  // console.log(req.session.id)
  let paths = ["/api/decrypt", "/api/encrypt"];
  // if (!paths.includes(req.path)) {
  let newdate = new Date();
  let id = newdate.getTime().toString();
  // encrypt the date with a cipher
  let key = randomBytes(32);
  let salt = randomBytes(16);
  if (req.session) {
    req.session.id = createId(id, key, salt);
  }
  // }
  next();
}
// check if session is current or expired
function checksamesession(req, res, next) {
  if (req.session) {
    if (req.session.isNew) {
      console.log("NEW SESSION");
    } else {
      console.log("CURRENT/SAME SESSION");
    }
  }
  next();
}

app.listen(PORT, () => {
  console.log("listening on port " + PORT);
});

// ref
// aes-256: key length(32)
// aes-128: key length(16)
// aes-192: key length(24)
