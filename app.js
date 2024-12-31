if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

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
const userRouter = require('./routes/userRoute.js');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');


const cloudDB = process.env.MONGODB_URL;
const localDB = 'mongodb://127.0.0.1:27017/yelpCamp'
// connect to local mongoDB
mongoose.connect(localDB)
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


// set up session
app.use(session({
    store: MongoStore.create({ mongoUrl: localDB }),
    touchAfter: 24 * 3600, // time period in seconds
    name: "session",
    // secure: true,
    secret: 'developmentsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    }
}));

// sanitize user input to prevent mongo injection
app.use(mongoSanitize());

// set up helmet
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.maptiler.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/daigovpbf/",
                "https://api.maptiler.com/resources/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


// configure passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// configure flash
app.use(flash());
app.use((req, res, next) => {
    if (!['/login', '/', '/register'].includes(req.originalUrl)) {
        // if the request is not from ['/login', '/', '/register']
        // store the url the user is requesting.
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// to be deleted
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

/***** AUTH ROUTES *****/
app.use('/', userRouter);
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

