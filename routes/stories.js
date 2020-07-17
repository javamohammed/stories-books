const express = require('express')
const {ensureAuth } = require('../middleware/auth') 
const Story = require('../models/Story')
const routes = express.Router()


//Add story page
routes.get('/add', ensureAuth, (req, res) => {
    res.render("stories/add")
})

//Add story  Form Post
routes.post('/add', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id
        await Story.create(req.body)
        res.redirect('/dashboard')
    } catch (error) {
        console.error(error)
        res.render('errors/500')
    }
    res.render("stories/add")
})

routes.get('/', ensureAuth, async (req, res) => {
    try {
      const stories = await Story.find({ status: 'public' })
        .populate('user')
        .sort({ createdAt: 'desc' })
        .lean()
  
      res.render('stories/index', {
        stories,
      })
    } catch (err) {
      console.error(err)
      res.render('error/500')
    }
  })

// Find Stories by user
routes.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: 'public', user: req.params.userId })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

    res.render('stories/index', {
      stories,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


// edit page   GET /stories/:id
routes.get('/:id', ensureAuth, async (req, res) => {
    try {
      let story = await Story.findById(req.params.id).populate('user').lean()
  
      if (!story) {
        return res.render('error/404')
      }
  
      res.render('stories/show', {
        story,
      })
    } catch (err) {
      console.error(err)
      res.render('error/404')
    }
  })
  
//Show edit page
routes.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({
      _id: req.params.id,
    }).lean()

    if (!story) {
      return res.render('error/404')
    }

    if (story.user != req.user.id) {
      res.redirect('/stories')
    } else {
      res.render('stories/edit', {
        story,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

//Show Single Story GET
routes.get('/:id', ensureAuth, async (req, res) => {
  try {
    const story = await Story.findById(
      req.params.id,
    ).populate('user')
    .lean()

    if (!story) {
      return res.render('error/404')
    }

    res.render('stories/show', {
      story,
    })
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})


//Update story method PUT
routes.put('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean()

    if (!story) {
      return res.render('errors/404')
    }

    if (story.user != req.user.id) {
      res.redirect('/stories')
    } else {
      story = await Story.findOneAndUpdate({_id:req.params.id}, req.body, {
        new: true,
        runValidators:true
      })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('errors/500')
  }
})

//Delete story method DELETE
routes.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean()

    if (!story) {
      return res.render('errors/404')
    }

    if (story.user != req.user.id) {
      res.redirect('/stories')
    } else {
      story = await Story.findByIdAndDelete(req.params.id)
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('errors/500')
  }
})
module.exports = routes