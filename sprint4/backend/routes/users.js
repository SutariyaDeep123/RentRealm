var express = require('express');
var router = express.Router();

const User = require('../models/userModel'); // Adjust path to your User model
const { fakeUsers } = require('./fakeuser');

// // Insert the fake users
// async function insertFakeUsers() {
//  await new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve();
//     }
//     , 2000);
//   }
//   );
//   try {
//     console.log('Inserting fake users...');
//     console.log(fakeUsers[0]);
//     await User.insertMany(fakeUsers);
//     console.log('50 fake users inserted successfully');
//   } catch (error) {
//     console.error('Error inserting fake users:', error);
//   }
// }

// insertFakeUsers();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
