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


//function to generate and return a random string with 6 alphanumeric characters
function generateRandomString() {
  let result = "";
  let possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( let i=0; i < 6; i++ ) {
      result += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }

  return result;
}

//function that look for a user in database and return your login, if find it
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

//Login
app.get("/login", (req, res) => {
  let userID = req.cookies["user_id"];
  let userData = user[userID];
  let templateVars = {
    user: userData
  };
  res.render("login_user", templateVars);
});

app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let userID = findUser(userEmail);

  if (userID && (user[userID].password === userPassword)) {
    //informations are corrected
    res.cookie('user_id', userID).redirect("/urls");
  } else if ((!userEmail || userEmail === '') || (!userPassword || userPassword === '')) {
    //email is empty or password is empty
    res.status(403).send('We need your e-mail and password!');
  } else {
    //password is incorrect
    res.status(403).send('Sorry... You are not registered or your e-mail / password is wrong.');
  }

});


//Logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id').redirect("/urls");
});


//Register a new user
app.get("/register", (req, res) => {
  let userID = req.cookies["user_id"];
  let userData = user[userID];

  let templateVars = {
    user: userData
  };
  res.render("register_user", templateVars);
});

app.post("/register", (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
  let id = generateRandomString();

  if((!name || name === '') || (!email || email === '') || (!password || password === '')) {
    //all informations are required
    res.status(400).send('Sorry... we need your name, email and password.');
  } else if (findUser(email)) {
    //user is already registered
    res.status(400).send('Sorry... your email is already registered. Try to login!');
  } else {
    //data is ok, user will be included in database
    user[id] = {
      id: id,
      name: name,
      email: email,
      password: password
    };
    res.cookie('user_id', id).redirect("/urls");
  }
});


//Create a new short URL
app.get("/urls/new", (req, res) => {
  let userID = req.cookies["user_id"];
  let userData = user[userID];
  let templateVars = {
    user: userData
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
  let userID = req.cookies["user_id"];
  let userData = user[userID];
  let templateVars = {
    urls: urlDatabase ,
    user: userData
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
    let userID = req.cookies["user_id"];
    let userData = user[userID];

    let templateVars = {
      shortURL: req.params.id,
      fullURL: urlDatabase[id],
      user: userData
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


//Start to listen events
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});