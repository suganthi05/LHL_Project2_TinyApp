const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

const app = express();

const PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['encrypted cookies']
}));

app.use(methodOverride('_method'));


//databases
var urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userID: "",
    howManyVisitor: 0,
    howManyUniqueVisitors: [],
    track: {}
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: "",
    howManyVisitor: 0,
    howManyUniqueVisitors: [],
    track: {}
  }
};

const user = {};


//function to generate and return a random string with 6 alphanumeric characters
function generateRandomString() {
  //set the variable to return the string as empty
  let result = "";

  //set the string with all possible values in the random string
  let possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  //generate a random number between 0 and the length of possible values
  //this number will be used as index to get a character in the possible values string
  //repeat steps 6 times (the length of the random required) and concatenate on result
  for( let i=0; i < 6; i++ ) {
      result += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }

  return result;
}

//function that look for a user in database and return your login, if find it
function findUser (email) {
  //get an array with all users ids
  let userKeys = Object.keys(user);

  //set the variable to return the result as empty
  let userFound = "";

  //go throw each element the array and use this id (= index of array) to look for user in object (user database)
  //compare the email from database and email receiving as argument
  //if match, set the variable with the id found and return
  //if no match, return empty variable
  for (let userID in userKeys){
    let id = userKeys[userID];
    if (email === user[id].email) {
      userFound = id;
      return userFound;
    }
  }
  return userFound;
}

//function that returns all URLs of a especific user
function urlsForUser(id) {
  //get an array with all urls
  let URLsKeys = Object.keys(urlDatabase);

  //set the object to return the result as empty. this object should have only the URLs added by user (id)
  let userURLs = {};

  //para cada shortURL (= elementos da array), compare the id receiving as argument with id from database
  //if match, include the data in the object to return
  for(element in URLsKeys) {
    let shortURL = URLsKeys[element];

    if (urlDatabase[shortURL].userID === id){

      userURLs[shortURL] = {
        url: urlDatabase[shortURL].url,
        userID: id
      }

    }
  }

  //return an empty object (if the user haven't created any URL) or an object that have all urls created by user
  return userURLs;
}


//Login
app.get("/login", (req, res) => {
  //get the user id from cookie. if the user is looged in, we get his/her data from database, otherwise the variable will be undefined
  // let userID = req.cookies["user_id"];
  let userID = req.session.user_id;
  let userData = user[userID];

  //create the object to send to page
  let templateVars = {
    user: userData
  };

  if (userID) {
    //the user is logged in, redirect to /url
    res.redirect("/urls");
  } else {
    //the user is not logged in, redirect to login page
    //call the register page, sending the user data or an object with property user undefined
    res.render("login_user", templateVars);
  }

});

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  //get the user data from form
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  //get the user id. call a function that receive the email and return the id or empty
  let userID = findUser(userEmail);

  //validate data. check if the user exists in database and the password is correct
  if (userID && (bcrypt.compareSync(userPassword, user[userID].password))) {

    //informations are corrected
    // res.cookie('user_id', userID).redirect("/urls");
  let userID = findUser(userEmail);
    req.session.user_id = userID;
    res.redirect("/urls");


  } else if ((!userEmail || userEmail === '') || (!userPassword || userPassword === '')) {

    //email is empty or password is empty
    res.status(403).send('We need your e-mail and password!');

  } else {

    //password is incorrect
    res.status(403).send('Sorry... You are not registered or your e-mail / password is wrong.');

  }

});


//Logout and clear cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


//Register a new user
app.get("/register", (req, res) => {
  //get the user id from cookie. if the user is looged in, we get his/her data from database, otherwise the variable will be undefined
  let userID = req.session.user_id;
  let userData = user[userID];

  //create the object to send to page
  let templateVars = {
    user: userData
  };

  if (userID) {
    //the user is logged in, redirect to /url
    res.redirect("/urls");
  } else {
    //call the register page, sending the user data or an object with property user undefined
    res.render("register_user", templateVars);
  }
});

app.post("/register", (req, res) => {
  //get the user data from form
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;

  //validate the usar data: all data are required (name, email and password), and the email cannot br already registered
  if((!name || name === '') || (!email || email === '') || (!password || password === '')) {

    //one or more information is empty
    res.status(400).send('Sorry... we need your name, email and password.');

  } else if (findUser(email)) {

    //user is already registered
    res.status(400).send('Sorry... your email is already registered. Try to login!');

  } else {
    //data is ok, user can be included in database

    //hash password
    let hashed_password = bcrypt.hashSync(password,10);

    //get a new id for the user
    let id = generateRandomString();


    //add the new user to database
    user[id] = {
      id: id,
      name: name,
      email: email,
      password: hashed_password
    };

    //save the id in cookie and redirect the user to main page
    req.session.user_id = id;
    res.redirect("/urls");
    // res.cookie('user_id', id).redirect("/urls");
  }
});


//Create a new short URL
app.get("/urls/new", (req, res) => {
  //get the id from cookie and the data of user
  let userID = req.session.user_id;
  let userData = user[userID];

  if (userData) {
    //the user is logged in, go to page to create a new short URL
    let templateVars = {
      user: userData
    };

    res.render("urls_new", templateVars);
  } else {
    //the user is not logged in, redirect to login page
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  //get a new random short URL
  let shortURL = generateRandomString();

  //get the data from form and cookie
  let longURL = req.body.longURL;
  let ID = req.session.user_id;

  //includ the data on database
  urlDatabase[shortURL] = {
    url: longURL,
    userID: ID,
    howManyVisitor: 0,
    howManyUniqueVisitors: [],
    track: []
  };

  res.redirect("/urls");
});


//Read list of all short URLs
app.get("/urls", (req, res) => {
  //identify the user logged in
  let userID = req.session.user_id;
  let userData = user[userID];

  //get a list of all urls created by user
  let userURLs = urlsForUser(userID);

  //set the data to send
  let templateVars = {
    urls: userURLs,
    user: userData
  };

  res.render("urls_index", templateVars);
});


//Read a given short URL
app.get("/urls/:id", (req, res) => {
  //identify the user logged in
  let userID = req.session.user_id;
  let userData = user[userID];

  //get an array of keys of url = all short urls
  let keys = Object.keys(urlDatabase);

  //make id = given short URL
  let id = req.params.id;

  //look for the id in the array
  if ( keys.indexOf(id) === -1){
    res.status(404).send('Sorry... shortURL was not found in database.');
  } else if (userID !== urlDatabase[id].userID){
    res.status(401).send('Sorry... you cannot edit a URL created by another person, or you are not logged in.');
  } else {
    let templateVars = {
      shortURL: req.params.id,
      fullURL: urlDatabase[id].url,
      user: userData,
      tracking: urlDatabase[id]
    };
    if (userData) {
      //user is logged in
      res.render("urls_show", templateVars);
    } else {
      //user is not logged in, redirect to login page
      res.redirect("/login");
    }
  }
});


//Redirect to full URL
app.get("/u/:shortURL", (req, res) => {
  //get the short url from form
  let shortURL = req.params.shortURL;
  //get the long url from database
  let longURL = urlDatabase[shortURL].url;

  //identify the user logged in
  let userID = (req.session.user_id) ? req.session.user_id : "User unknown";

  //increment the total visitors of short URL
  urlDatabase[shortURL].howManyVisitor ++;

  //if the user have not accessed the short URL before, include he/she in array of unique users
  if (!urlDatabase[shortURL].howManyUniqueVisitors.includes(userID)) {
    urlDatabase[shortURL].howManyUniqueVisitors.push(userID);
  }

  //include the timestamp and user id on database
  let timestamp = new Date();
  urlDatabase[shortURL].track.push([timestamp,userID]);

  res.redirect(longURL);
});


//Delete a given short URL
app.delete("/urls/:id", (req, res) => {
  let id = req.params.id;
  if ( delete urlDatabase[id] ) {
    res.redirect("/urls");
  } else {
    res.status(404).send('Sorry... shortURL was not found in database.');
  }
});


//Update a given short URL
app.put("/urls/:id", (req, res) => {
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
    urlDatabase[id].url = newLongURL;
    res.redirect("/urls");
  }
});


//Start to listen events
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});