const express = require('express');
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
app.set('view engine', 'ejs');
app.use(cookieParser());

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.use(bodyParser.urlencoded({extended: true}));





//Global Functions
const generateRandomString = () => {
  const string = Math.random().toString(16).substr(2, 6);
  return string;
};

const checkForEmail = (email, object) => {
  let emailList = [];
  for (let user in object) {
    emailList.push(object[user].email);
  }
  if (emailList.includes(email)) {
    return true;
  }
};

const returnUserWithEmail = (email, object) => {
  for (let user in object) {
    if (email === object[user].email) {
      return object[user].id;
    }
  }
};





//Global Objects
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: 'asdfas' },
  "9sm5xK": { longURL: "http://www.google.com", userID: 'ifakej' }
};

const users = {
  tempID: {
    id: 'tempID',
    email: 'temp@example.com',
    password: 'tempPassword'
  },
}

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
  
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']]};
  return res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (!req.cookies['user_id']) {
    return res.redirect('/login');
  }
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
  return res.render('urls_new', templateVars)
});


app.get('/urls/:shortURL', (req, res) => {  
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies['user_id']] };
  return res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  return res.render('register', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL);
  return res.redirect(longURL);
});

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  return res.render('login', templateVars)
})




//All post requests
app.post('/urls', (req, res) => {
  // console.log(req.body);
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    userID: req.cookies['user_id']
  };
  // console.log(urlDatabase);
  return res.redirect(`/urls/`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.cookies['user_id']) {
    return res.redirect(`/urls/${req.params.shortURL}`)
  }
  // console.log(urlDatabase[req.params.shortURL])
  delete urlDatabase[req.params.shortURL];
  return res.redirect(`/urls`);
});

app.post('/urls/:shortURL/update', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.cookies['user_id']) {
    return res.redirect(`/urls/${req.params.shortURL}`)
  }
  urlDatabase[req.params.shortURL].longURL = req.body.update;
  return res.redirect(`/urls/${req.params.shortURL}`);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  return res.redirect('/urls');
});

app.post('/login', (req, res) => {
  if (!checkForEmail(req.body.email, users)) {
    // console.log(req.body.email, users);
    return res.status(403).end();
  }

  const id = returnUserWithEmail(req.body.email, users);

  if (req.body.password !== users[id].password) {
    return res.status(403).end();
  }

  res.cookie('user_id', id);

  return res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  
  if (!req.body.email || !req.body.password) {
    return res.status(400).end();
  }

  if (checkForEmail(req.body.email, users)) {
    return res.status(400).end();
  }
  
  users[id] = {
    id: id,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie('user_id', users[id].id);
  // console.log(req.cookies['user_id']);
  return res.redirect('/urls');
});

