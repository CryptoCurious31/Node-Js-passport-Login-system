// Main server js

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const passport = require('passport');
const express = require('express');
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');
const methodOverRide = require('method-override');
const intializePassport = require('./passport-config');
intializePassport(
    passport , 
    email => Users.find( user => user.email === email) ,
    id => Users.find( user => user.id === id)  
    );
const Users = [];

const PORT = 5000;
const app = express();
app.set('view-engine', 'ejs');

app.use(express.urlencoded({extended: false }))
app.use(flash());
app.use(session({secret: process.env.SESSION_SECRET , resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverRide('_method'))


// main route
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name});
})

// Login
app.get('/login', checkNoAuthenticate,  (req, res) => {
    res.render('login.ejs');
})

// Register
app.get('/register', checkNoAuthenticate,  (req, res) => {
    res.render('register.ejs');
})

// Login Post route
app.post('/login', checkNoAuthenticate, passport.authenticate( 'local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

// Register Post route
app.post('/register', checkNoAuthenticate, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash( req.body.password, 10);
        Users.push({
            id: Date.now().toString(),
            name : req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        console.log(Users);
        res.redirect('/login')
    } catch (error) {
        res.redirect('/register');
    }
})

app.delete('/logout',(req, res) => {
    req.logOut(() => {
        res.redirect('/login')
    })
    
})


function checkAuthenticated  (req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
}

function checkNoAuthenticate(req, res, next) {
    if (req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

app.listen(PORT, () => {
    console.log(`The Server in running on http://localhost:${PORT}`);
});