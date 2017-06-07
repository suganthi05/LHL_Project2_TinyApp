var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//function to generate a random string with 6 alphanumeric characters
function generateRandomString() {
  let result = "";
  let possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( let i=0; i < 6; i++ )
      result += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));

  return result;
}


//Create a new short URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  // res.redirect(`http://localhost:8080/urls/${shortURL}`);
  res.redirect("/urls");
});


//Read list of all short URLs
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
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
    let templateVars = { shortURL: req.params.id, fullURL: urlDatabase[id] };
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

//General guide
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//Start to listen events
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
