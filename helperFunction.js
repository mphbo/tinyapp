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


const returnUserFromEmail = (email, object) => {
  for (let user in object) {
    if (object[user].email === email) {
      return user;
    }
  }
  return false;
};

module.exports = { generateRandomString, checkForEmail, returnUserWithEmail};