import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js';
import crypto from 'crypto';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ email: profile.emails[0].value });
            if(user){
                return done(null, user);
            }
            else{
                let baseUsername = profile.emails[0].value.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').substring(0, 15);
                if(baseUsername.length < 3) baseUsername = `user${baseUsername}`;

                let newUsername = baseUsername;
                let userExists = await User.findOne({ username: newUsername });
                let attempts = 0;
                while (userExists && attempts < 5) {
                    newUsername = `${baseUsername}${crypto.randomBytes(2).toString('hex')}`;
                    userExists = await User.findOne({ username: newUsername });
                    attempts++;
                }
                if (userExists) {
                     newUsername = `user${crypto.randomBytes(6).toString('hex')}`;
                }

                const newUser = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    username: newUsername
                });
                return done(null, newUser);
            }
        } catch (error) {
            return done(error, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});