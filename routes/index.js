const express = require('express')
const {ensureAuth, ensureGuest} = require('../middleware/auth') 
const Story = require('../models/Story')
const routes = express.Router()


//login page
routes.get('/', ensureGuest, (req, res) => {
    res.render("login", {
        layout: 'login'
    })
})

// dashboard page
routes.get('/dashboard',ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({user: req.user.id}).lean()
        res.render('dashboard', {
            name: req.user.firstName,
            stories: stories
        })
        
    } catch (error) {
        console.error(error)
        res.render('errors/500')
    }
})



module.exports = routes