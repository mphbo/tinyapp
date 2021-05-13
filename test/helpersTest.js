const { assert } = require('chai');

const { returnUserWithEmail } = require('../helperFunction');

const testUsers = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user20@example.com',
    password: 'dishwasher-funk'
  }
};

// My returnUserWithEmail helper function was intended to return the entire user to increase reusability. Therefore if other parts of the user were needed they could easily be accessed. That is why .id is appended to the call below.

describe('returnUserWithEmail', () => {
  it('should return a user with valid email', () => {
    const user = returnUserWithEmail('user@example.com', testUsers).id;
    const expectedOutput = 'userRandomID';
    assert.equal(user, expectedOutput);
  });

  it('should return undefined if user is not in database', () => {
    const user = returnUserWithEmail('notAUser@example.com', testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
})