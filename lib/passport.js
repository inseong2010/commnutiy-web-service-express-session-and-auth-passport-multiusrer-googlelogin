var db  = require('../lib/db');
var bcrypt = require('bcrypt');

module.exports = function (app) {
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        var user = db.get('users').find({id: id}).value();
        done(null, user);
    });

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'pw'
    },
    (email, password, done) => {
        var user = db.get('users').find({ email: email}).value();
        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Password is not corrrct.'
                    });
                }
            });
        } else {
            return done(null, false, {
                message: 'there is no email.'
            });
        }
    }));

    /* passport.use(new GoogleStrategy({
        clientID: '',
        clientSecret: '',
        callbackURL: '',
    }, (accessToken, refreshToken, profile, done) => {
        User.findOrCreate({ googleId: profile.id}, (err, user) => {
            return done(err, user);
        });
    })); */

    var googleCredentials = require('../config/google.json');
    passport.use(new GoogleStrategy({
        clientID: googleCredentials.web.client_id,
        clientSecret: googleCredentials.web.clientSecret,
        callbackURL: googleCredentials.web.redirect_uris
      },
      (accessToken, refreshToken, profile, done) => {
           User.findOrCreate({ googleId: profile.id }, (err, user) => {
             return done(err, user);
           });
        }
    ));
    return passport;
}

