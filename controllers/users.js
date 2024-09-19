const User = require('../models/user')

exports.getRegisterForm =  (req, res) => {
    res.render('users/register');
}

exports.registerUser = async (req, res, next) => {
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
}

exports.getLoginForm = (req, res) => {
    res.render('users/login');
}

exports.login = async (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}

exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/login');
    });
}