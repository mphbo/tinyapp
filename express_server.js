const express = require('express');
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const { generateRandomString, checkForEmail, returnUserWithEmail, checkIfNewVisitor } = require('./helperFunction');


//setup app/server, set cookie parser, listen and start bodyParser
const app = express();
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['homeslice', 'supersauce']
}));
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.use(bodyParser.urlencoded({extended: true}));


//enable method override
app.use(methodOverride('_method'));



//helper function to check if a visitor is indeed unique, used below in app.get('/u/shortURL'.....)


//Global Objects mostly for reference not be taken literally
  
const readableDate = () => {
  const date = new Date();    const aReadableDate = date.toDateString();
  return aReadableDate;
};

const urlDatabase = {
  "b2xVn2": {
    uniqueVisits: {'f89ff3': readableDate()},
    date: 0,
    visitors: 0,
    longURL: "http://www.lighthouselabs.ca",
    userID: 'asdfas'
  },
  "9sm5xK": {
    date: 0,
    visitors: 0,
    longURL: "http://www.google.com",
    userID: 'ifakej'
  }
};

const users = {
  tempID: {
    id: 'tempID',
    email: 'temp@example.com',
    password: 'tempPassword'
  },
};

app.get("/", (req, res) => {
  return res.send("Hello!");
});






//All get requests
app.get('/urls.json', (req, res) => {
  return res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  return res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  console.log(urlDatabase);
  return res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  return res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  
  let templateVars = { doesNotExist: true, user: users[req.session.user_id], ownsURL: true };
  
  if (Object.keys(urlDatabase).includes(req.params.shortURL)) {
    templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id], visitors: urlDatabase[req.params.shortURL].visitors, date: urlDatabase[req.params.shortURL].date, uniqueVisitors: urlDatabase[req.params.shortURL].uniqueVisitors, doesNotExist: false, ownsURL: true };
  }

  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    templateVars.ownsURL = false;
  }

  return res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  return res.render('register', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    return res.redirect('/does_not_exist');
  }
  
  const longURL = urlDatabase[req.params.shortURL].longURL;
  urlDatabase[req.params.shortURL].visitors += 1;
  if (checkIfNewVisitor(urlDatabase, req.params.shortURL, req.session.user_id)) {
    urlDatabase[req.params.shortURL].uniqueVisitors.push({id: req.session.user_id, date: readableDate()});
  }
  return res.redirect(longURL);
});

app.get('/does_not_exist', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  return res.render('does_not_exist', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  return res.render('login', templateVars);
});

app.get('/doesnotexist', (req, res) => {
  return res.render('doesnotexist');
});

app.get('/user_exists', (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  return res.render('user_exists', templateVars);
});

app.get('/login_failed', (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  return res.render('login_failed', templateVars);
});




//All post requests
app.post('/urls', (req, res) => {
  // const date = new Date();
  // const readableDate = date.toDateString();
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    userID: req.session.user_id,
    visitors: 0,
    date: readableDate(),
    uniqueVisitors: []
  };
  return res.redirect(`/urls/${shortURL}`);
});

app.delete('/urls/:shortURL/delete', (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/urls');
  }
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.redirect(`/urls/${req.params.shortURL}`);
  }
  // console.log(urlDatabase[req.params.shortURL])
  delete urlDatabase[req.params.shortURL];
  return res.redirect(`/urls`);
});

app.put('/urls/:shortURL/update', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.redirect(`/urls/${req.params.shortURL}`);
  }
  urlDatabase[req.params.shortURL].longURL = req.body.update;
  return res.redirect(`/urls/`);
});

app.put('/logout', (req, res) => {
  req.session = null;
  return res.redirect('/urls');
});

app.put('/login', (req, res) => {
  if (!checkForEmail(req.body.email, users)) {
    return res.redirect('/login_failed');
  }

  const user = returnUserWithEmail(req.body.email, users);

  if (!bcrypt.compareSync(req.body.password, users[user.id].password)) {
    return res.redirect('/login_failed');
  }
  req.session.user_id = user.id;

  return res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const id = generateRandomString();

  if (!req.body.email || !req.body.password) {
    return res.redirect('/register');
  }

  if (checkForEmail(req.body.email, users)) {
    return res.redirect('user_exists');
  }
  
  const password = bcrypt.hashSync(req.body.password, 10);
  
  users[id] = {
    id: id,
    email: req.body.email,
    password: password
  };
  req.session.user_id = users[id].id;
  return res.redirect('/urls');
});

