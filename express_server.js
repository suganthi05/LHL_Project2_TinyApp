var express = require("express");
var app = express();

var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

//databases
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const user = {};


//function to generate a random string with 6 alphanumeric characters
function generateRandomString() {
  let result = "";
  let possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( let i=0; i < 6; i++ ) {
      result += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }

  return result;
}

function findUser (email) {
  let userKeys = Object.keys(user);
  let userFound = "";
  for (let userID in userKeys){
    let id = userKeys[userID];
    if (email === user[id].email) {
      userFound = id;
      return userFound;
    }
  }
  return userFound;
}

//Create a new short URL
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});


//Read list of all short URLs
app.get("/urls", (req, res) => {
  // let userID = req.cookies["user_id"];
  // console.log(user);
  // let userData = user.userID;
  // console.log("ID: ", userID);
  // console.log("user: ", userData);
  // let templateVars = {
  //   urls: urlDatabase ,
  //   user_id: userID,
  //   user: userData
  // };
  // console.log(templateVars);
  let templateVars = {
    urls: urlDatabase ,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});


//Read a given short URL
app.get("/urls/:id", (req, res) => {
  //get an array of keys
  let keys = Object.keys(urlDatabase);

  //make id = given short RUL
  let id = req.params.id;

  //look for the id in the array
  if ( keys.indexOf(id) === -1){
    res.status(404).send('Sorry... shortURL was not found in database.');
  } else {
    let templateVars = {
      shortURL: req.params.id,
      fullURL: urlDatabase[id],
      username: req.cookies["username"]
    };
    res.render("urls_show", templateVars);
  }
});


//Redirect to full URL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});


//Delete a given short URL
app.post("/urls/:id/delete", (req, res) => {
  let id = req.params.id;
  if ( delete urlDatabase[id] ) {
    res.redirect("/urls");
  } else {
    res.status(404).send('Sorry... shortURL was not found in database.');
  }
});


//Update a given short URL
app.post("/urls/:id", (req, res) => {
  //get an array of keys
  let keys = Object.keys(urlDatabase);

  //make id = given short RUL
  let id = req.params.id;

  //get the new long URL from the form
  let newLongURL = req.body.newLongURL;

  //look for the id in the array
  if ( keys.indexOf(id) === -1){
    res.status(404).send('Sorry... shortURL was not found in database.');
  } else {
    urlDatabase[id] = newLongURL;
    res.redirect("/urls");
  }
});


//Save the login in cookie
app.post("/login", (req, res) => {
  let login = req.body.username;
  res.cookie('username', login).redirect("/urls");
});


//Clear the login in cookie
app.post("/logout", (req, res) => {
  res.clearCookie('username').redirect("/urls");
});


//Register an user
app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("register_user", templateVars);
});

app.post("/register", (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
  let id = generateRandomString();

  if(!email || !password) {
    res.status(400).send('Sorry... we need your email and your password.');
  } else if (findUser(email)) {
    res.status(400).send('Sorry... your email is already registered. Try to login!');
  } else {
    user[id] = {
      id: id,
      name: name,
      email: email,
      password: password
    };
    // console.log(user);
    res.cookie('user_id', id).redirect("/urls");
  }
});


//Start to listen events
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
