const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  return res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.get('/urls.json', (req, res) => {
  return res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  return res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  return res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  return res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  return res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  console.log(urlDatabase[req.params.shortURL])
  delete urlDatabase[req.params.shortURL];
  return res.redirect(`/urls`);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  return res.redirect(longURL);
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  return res.redirect(`/urls/${shortURL}`);
});


const generateRandomString = () => {
  const string = Math.random().toString(16).substr(2, 6);
  return string;
};