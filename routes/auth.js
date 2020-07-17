const express = require('express')
const passport = require('passport')

const routes = express.Router()

//Auth with google
routes.get('/google', passport.authenticate('google', { scope: ['profile'] }));


//Google auth callback
routes.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/dashboard');
  });

//logout
routes.get('/logout', (req, res ) => {
  req.logout()
  res.redirect('/')
})
module.exports = routes