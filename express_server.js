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

function generateRandomString() {
  let result = "";
  let possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( let i=0; i < 6; i++ )
      result += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));

  return result;
}

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (Object.keys(urlDatabase).indexOf(req.params.id) !== -1) {
    let templateVars = { shortURL: req.params.id, fullURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
  } else {
    res.end("Sorry... shortURL is not in database.");
  }
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.end("Please, use one of these options: '/urls/new' to create a new short URL; '/urls' to see the short URLs in our base; '/urls/shorURL' to see the full URL; '/u/shortURL' to redirect to full URL.");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
