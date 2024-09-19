const express = require('express');
const route = express.Router();
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users')

// user register form route 
route.get('/register', users.getRegisterForm)

// user register route 
route.post('/register', users.registerUser)

// login form route
route.get('/login', users.getLoginForm)

// login route
route.post('/login', storeReturnTo, 
                    passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),
                    users.login)

// logout route
route.get('/logout', users.logout)

module.exports = route;