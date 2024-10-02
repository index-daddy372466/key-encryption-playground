const express = require("express");
const app = express();
PORT = 3423;
const cors = require("cors");
const path = require("path");
const cookiesesh = require("cookie-session");
const { createCipheriv, createDecipheriv, randomBytes } = require("crypto");
let users = [];

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
    maxAge: 10000,
    secret: "dont use this secret example",
    priority: "medium",
    secure: false,
    httpOnly: false,
  })
);
app.use(encryptUsers);

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
const saveUser = (arr, user) => {
  arr.push({ id: user });
  return user;
};

// home
app.route("/").get((req, res) => {
  res.render("index.ejs");
});

app.route("/api/encrypt").post((req, res) => {
  // encrypt the message
});

app.route("/api/decrypt").post((req, res) => {
  // decrypt message
});

// encrypt users & switch id's depending on new session/old session
function encryptUsers(req, res, next) {
  // check expired session
  let id = new Date().getTime().toString();
  // encrypt the date with a cipher
  let key = randomBytes(32);
  let salt = randomBytes(16);
  let currid;

  // verify if user is currently connected(in users array)
  if (!req.session.isNew) {
    currid = req.session.id;
    let userfound = users.find((u) => u.id == req.session.id);
    if (userfound) {
      console.log("user exists");
    }
  } else {
    users = users.splice(users.indexOf(users.find((x) => x.id === currid)));
    req.session.id = saveUser(users, createId(id, key, salt));
  }
  console.log(req.session);
  console.log(users);
  next();
}

app.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
