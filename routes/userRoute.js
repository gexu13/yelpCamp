const User = require('../models/user');
const express = require('express');
const route = express.Router();
const passport = require('passport');
const { storeReturnTo } = require('../middleware');


route.get('/register', (req, res) => {
    res.render('users/register');
})

route.post('/register', async (req, res, next) => {
    try {
        const {username, email, password} = req.body.user;
        const user = new User({username, email});
        const registedUser = await User.register(user, password);
        // console.log(registedUser);
        req.login(registedUser, (err) => {
            if (err) {
                return next(err);
            }
            else {
                req.flash('success', 'Welcome to YelpCamp!');
                res.redirect('/campgrounds');
            }
        })
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/register');
    }
})

route.get('/login', (req, res) => {
    res.render('users/login');
})

route.post('/login', storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), 
    async (req, res) => {
        req.flash('success', 'Welcome back!');
        const redirectUrl = req.returnTo || '/campgrounds';
        res.redirect(redirectUrl);
})

route.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/login');
    });
    
})

module.exports = route;