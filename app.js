const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const passport = require('passport')
const session = require('express-session')
const exphbs  = require('express-handlebars');
const mongoose = require('mongoose')
const mongoStore = require('connect-mongo')(session)
const methodOverride = require('method-override')

const dbConnect = require('./config/db')
const { MongoStore } = require('connect-mongo')


//Load vars environment
dotenv.config({path:'./config/config.env'})

//passport config
require('./config/passport')(passport)
//connection to database
dbConnect()


const PORT = process.env.PORT || 3000

const app = express()

//Body parser
app.use(express.urlencoded({extended: false}))
app.use(express.json())


//method Override
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

//logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

//handlebars helpers
const {formatDate, truncate, stripTags, editIcon, select} = require('./helpers/hbs')

//handlebars engine 
app.engine('.hbs', exphbs({helpers:{
  formatDate,
  truncate, 
  stripTags, 
  editIcon,
  select
},defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');

//static folder
app.use(express.static(path.join(__dirname,'public')))

//session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
   // store: new MongoStore({ mongooseConnection: mongoose.connection })
   store: new  mongoStore({url:process.env.MONGO_URI})
  }))

//passport middleware
app.use(passport.initialize())
app.use(passport.session())

//Global var
app.use((req, res, next) => {
  res.locals.user = req.user || null
  next()
})

//load routes
app.use('/auth', require('./routes/auth'))
app.use('/', require('./routes/index'))
app.use('/stories', require('./routes/stories'))


app.listen(PORT, console.log(`Server running  in ${process.env.NODE_ENV} mode on port ${PORT}`))