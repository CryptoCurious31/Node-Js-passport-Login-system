// User Authentication with right credentials 

const bcrypt = require('bcrypt');
const localStrategy = require('passport-local').Strategy

function intialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email)
            if (user == null) {
                return done(null, false, {message: 'No user with that email'});
            }

        try {
            if ( await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, {message: 'Password Incorrect'});
            }
        } catch (error) {
            return done(error);   
        }
    }

    passport.use( new localStrategy({usernameField: 'email'}, authenticateUser));
    passport.serializeUser( (user, done) => {
        return done(null, user.id)}); 
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}

module.exports = intialize;