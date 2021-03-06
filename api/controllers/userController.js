'use strict';

var util = require('util');
var db = require('../db')
var bcrypt = require('bcrypt');
var crypto = require('crypto');
const uuidV4 = require('uuid/v4');

module.exports = {
  userGet: userGet,
  usersGet: usersGet,
  usersPut: usersPut,
  usersLogin: usersLogin,
  usersSignup: usersSignup,
  usersLogout: usersLogout
};

function usersGet(req, res) {
  db.users
    .findAll({
      attributes: [
        'firstName',
        'lastName',
        'birthDate',
        'email',
        'bio',
        'address1',
        'address2',
        'city',
        'state',
        'zip',
        'weight',
        'id'
      ]
    })
    .then(users => {
      var formattedUsers = users.map(user => ({
          firstName: user.firstName,
          lastName: user.lastName,
          birthMonth: parseInt(user.birthDate.slice(5,7)),
          birthDay: parseInt(user.birthDate.slice(8,10)),
          birthYear: parseInt(user.birthDate.slice(0,4)),
          email: user.email,
          bio: user.bio || "",
          address1: user.address1 || "",
          address2: user.address2 || "",
          city: user.city || "",
          state: user.state || "",
          zip: user.zip || "",
          weight: user.weight || -1,
          id: parseInt(user.id)
      }));
      res.json(formattedUsers);
    })
    .catch(err => {
      console.log(err);
      res.json({'message': 'ERROR'}, 500);
    })
}

function userGet(req, res) {
  var id = req.swagger.params.userId.value;
  
  db.users.findById(id)
    .then(user => {
      if (user) {
        res.status(200).json({
            'firstName': user.firstName,
            'lastName': user.lastName,
            'birthMonth': parseInt(user.birthDate.split('-')[0]),
            'birthDay': parseInt(user.birthDate.split('-')[1]),
            'birthYear': parseInt(user.birthDate.split('-')[2]),
            'email': user.email,
            'bio': user.bio || "",
            'address1': user.address1 || "",
            'address2': user.address2 || "",
            'city': user.city || "",
            'state': user.state || "",
            'zip': user.zip || "",
            'weight': user.weight || -1,
            'id': parseInt(user.id)
        });
      } else {
        res.json({'message': 'User not found'}, 404);
      }
    });
}

function usersPut(req, res) {
  var id = req.swagger.params.userId.value;
  var firstName = req.swagger.params.userInfo.value.firstName;
  var lastName = req.swagger.params.userInfo.value.lastName;
  var birthMonth = req.swagger.params.userInfo.value.birthMonth;
  var birthDay = req.swagger.params.userInfo.value.birthDay;
  var birthYear = req.swagger.params.userInfo.value.birthYear;
  var birthDate = util.format('%d-%d-%d,', birthYear, birthMonth, birthDay);
  var email = req.swagger.params.userInfo.value.email;
  var password = req.swagger.params.userInfo.value.password;
  var bio = req.swagger.params.userInfo.value.bio;
  var address1 = req.swagger.params.userInfo.value.address1;
  var address2 = req.swagger.params.userInfo.value.address2;
  var city = req.swagger.params.userInfo.value.city;
  var state = req.swagger.params.userInfo.value.state;
  var zip = req.swagger.params.userInfo.value.zip;
  var weight = req.swagger.params.userInfo.value.weight;

  //authorisation: check if ids match
  if (id != req.auth_token.user_id) {
    res.json({'message': 'User not authorized'}, 403);
  } else {
    if ((birthDay>0 && birthDay<32) && (birthMonth>0 && birthMonth<13) && birthYear) {

      db.users.findById(id)
        .then(user => {
          if (user) {
            let newInfo = {
              firstName: firstName,
              lastName: lastName,
              birthDate: Date.parse(birthDate)
            };
            if (password) {
              bcrypt.hash(password, 10)
                .then(hash => {
                  newInfo.hashword = hash;
                });
            }
            if (email) {
              newInfo.email = email;
            }
            if (bio) {
              newInfo.bio = bio;
            }
            if (address1) {
              newInfo.address1 = address1;
            }
            if (address2) {
              newInfo.address2 = address2;
            }
            if (city) {
              newInfo.city = city;
            }
            if (state) {
              newInfo.state = state;
            }
            if (zip) {
              newInfo.zip = zip;
            }
            if (weight) {
              newInfo.weight = weight;
            }
            console.log(newInfo);
            user.update(newInfo)
            .then(() => {
              res.status(200).json({
                'firstName': user.firstName,
                'lastName': user.lastName,
                'birthMonth': parseInt(user.birthDate.split('-')[0]),
                'birthDay': parseInt(user.birthDate.split('-')[1]),
                'birthYear': parseInt(user.birthDate.split('-')[2]),
                'email': user.email,
                'bio': user.bio || "",
                'address1': user.address1 || "",
                'address2': user.address2 || "",
                'city': user.city || "",
                'state': user.state || "",
                'zip': user.zip || "",
                'weight': user.weight || -1,
                'id': parseInt(user.id),
                'token': token
              });
            })
            .catch(err => {
              console.log(err);
              res.json({'message': 'ERROR'}, 500);
            });
          } else {
            res.json({'message': 'User not found'}, 401);
          }
        });
    } else {
      res.json({'message': 'Wrong date'}, 401);
    }
  }
}

function usersLogin(req, res) {
  var email    = req.swagger.params.userCredentials.value.email;
  var password = req.swagger.params.userCredentials.value.password;
  if (email && password) {
    db.users.findOne({ where: {email: email} })
      .then(user => {
        if (user) {
          bcrypt.compare(password, user.hashword)
            .then(result => {
             if (result) {
              //Create token
              let token = uuidV4();
              //Store token in auth_token table
              db.authtokens.create({
                  user_id: user.id,
                  token: token
                })
                .then(item => {
                    res.status(200).json({
                      'firstName': user.firstName,
                      'lastName': user.lastName,
                      'birthMonth': parseInt(user.birthDate.split('-')[0]),
                      'birthDay': parseInt(user.birthDate.split('-')[1]),
                      'birthYear': parseInt(user.birthDate.split('-')[2]),
                      'email': user.email,
                      'bio': user.bio || "",
                      'address1': user.address1 || "",
                      'address2': user.address2 || "",
                      'city': user.city || "",
                      'state': user.state || "",
                      'zip': user.zip || "",
                      'weight': user.weight || -1,
                      'id': parseInt(user.id),
                      'token': token
                  });
                })
                .catch(err => {
                  console.log(err);
                  res.json({'message': 'ERROR'}, 500);
              });
            } else {
              console.log('ERROR (email or) password is wrong');
              res.json({'message': 'ERROR (email or) password is wrong'}, 401);
            }
          });
        } else {
          console.log('User not found', 401);
          res.json({'message': 'ERROR (email or) password is wrong'}, 401);
          //TODO go to /signup instead?
        }
    });
  } else {
    res.json({'message': 'ERROR email are password are required'}, 401);
  }
}

function usersSignup(req, res) {
  var firstName  = req.swagger.params.userInfo.value.firstName;
  var lastName   = req.swagger.params.userInfo.value.lastName;
  var birthMonth = req.swagger.params.userInfo.value.birthMonth;
  var birthDay   = req.swagger.params.userInfo.value.birthDay;
  var birthYear  = req.swagger.params.userInfo.value.birthYear;
  var birthDate  = util.format('%d-%d-%d,', birthYear, birthMonth, birthDay);
  var email      = req.swagger.params.userInfo.value.email;
  var password   = req.swagger.params.userInfo.value.password;

  if (email && password && firstName && lastName && ((birthDay>0 && birthDay<32) && (birthMonth>0 && birthMonth<13) && birthYear)) {
    //Create hash from password
    bcrypt.hash(password, 10)
      .then(hash => {
        //Find if already exists or create user and store hash
        db.users.findOrCreate({
            where: {email: email},
            defaults: {
              firstName: firstName,
              lastName: lastName,
              birthDate: Date.parse(birthDate),
              hashword: hash
            }
          })
          .spread(function(user, created){
            // this userId was either created or found depending upon whether the argment 'created' is true or false
            if (created) {
              res.json({'message': 'User created.'}, 200);
            } else {
              res.json({'message': 'Email already in use.'}, 400);
            }
          })
          .catch(err => {
            console.log(err);
            res.json({'message': 'Server error.'}, 500);
        });
      });
  } else {
    res.status(401).json({'message': 'ERROR email and password are required'});
  }
}

function usersLogout(req, res) {
  let token = req.auth_token.token; //was req.headers.authorization;
  if (token) {
    //Delete token from auth_token table
    db.authtokens.destroy({ where: {token: token} })
      .then(item => {
        if (item) {
          res.json({'message': 'User logged out.'}, 200);
        } else {
          res.json({'message': 'Token not found.'}, 401);
        }
      })
      .catch(err => {
          console.log(err);
          res.json({'message': 'Server error.'}, 500);
      });
  } else {
    res.json({'message': 'Invalid token.'}, 401);
  }
}
