const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utilities/ExpressError');
const campgroundRouter = require('./routes/campgroundRoutes.js');
const reviewRouter = require('./routes/reviewRoutes.js');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

// connect to DB
mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp')
.then(() => {
    console.log("Connected to the Database!");
})
.catch(err => {
    console.log("OH NO ERROR!");
    console.log(err);
})

const app = express();

// set up templating(ejs)
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// serve public folder
app.use(express.static(path.join(__dirname, 'public')));

// set up middleware
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(session({
    secret: 'developmentsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    }
}));

// configure passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeuser', async (req, res) => {
    const user = new User({
        email: 'gx@gmail.com',
        username: 'gexu13',
    })
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
})

/**
 * RESTful routes
**/
app.get('/', (req, res) => {
    res.render('home');
})

/***** CAMPGROUND ROUTES *****/
app.use('/campgrounds', campgroundRouter);
/*****************************/


/***** REVIEW ROUTES *****/
app.use('/campgrounds/:cid/reviews', reviewRouter);
/*************************/


// no matching url middleware(404)
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

// error handling middleware
app.use((err, req, res, next) => {
    const {status = 500} = err;
    if (!err.message) {
        err.message = "Something went wrong";
    }
    // console.log(err.stack);
    res.status(status).render('error', {err});
    // res.send('oh boy, something happened!');
})

app.listen(3000, () => {
    console.log('APP IS LISTENING ON PORT 3000!');
})

