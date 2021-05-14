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
      return object[user];
    }
  }
  return undefined;
};

//helper function to check if a visitor is indeed unique, used below in app.get('/u/shortURL'.....)


const checkIfNewVisitor = (object, param, id) => {
  for (const visitor of object[param].uniqueVisitors) {
    if (visitor.id === id) {
      return false;
    }
  }
  return true;
};

module.exports = { generateRandomString, checkForEmail, returnUserWithEmail, checkIfNewVisitor };