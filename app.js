var createError = require('http-errors');//added by express generator
var express = require('express');//added by express generator
var path = require('path');//added by express generator
var logger = require('morgan');//added by express generator
const passport = require('passport'); //Added for Passport authenticaiton use
const config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter'); //imported router created from week 1
const promotionRouter = require('./routes/promotionRouter');//imported router created from week 1
const partnerRouter = require('./routes/partnerRouter');//imported router created from week 1
const uploadRouter = require('./routes/uploadRouter'); //imported router created in week 4
const favoriteRouter = require('./routes/favoriteRouter'); //imported router created in week 4


const mongoose = require('mongoose'); //Require Mongoose so we can connect the application to the MongoDB server through the Mongoose wrapper methods around the MongoDB node driver

const url = config.mongoUrl;
const connect = mongoose.connect(url, { //Set up a Mongoose connection to the MongoDB
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'), //"mongoose.connect" returns a promise, chain ".then" to it so if the promise resolves, the console log will run.   
    err => console.log(err) //Pass an optional 2nd argument to the ".then" method & it will automatically handle the rejected case. This is another way to catch promise rejection errors other than ".catch", good to use if you are not chaining anything to it. 
);

var app = express();

//Update this file for the transition to HTTPS. Redirect any traffic coming to the insecure port to the secure one
// Secure traffic only
app.all('*', (req, res, next) => { //"app.all" method is a routing method that catches every type of request that comes into the server. Wildcard for the path will catch for any path on the server. Give it a middleware function
  if (req.secure) { //check the request object's property "secure". The "secure" property is set automatically by Express as true when the connection that the request was sent over is through HTTPS. 
    return next(); //If so, move on to next middleware function.
  } else { //If connection is not HTTPS
      console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
      res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`); //redirect to the secure. "redirect" first argument is a status code, second argument is the message ?
  }
});

// view engine setup
//When a request comes from client, it is sent to these "app.use" middleware functions in the order the appear below
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321')); //To use signed cookies, must provide cookie parser with secret key as an argument. It can be any string, it will be used by the cryptographer

app.use(passport.initialize()); 

app.use('/', indexRouter); //Logged out users are directed to the index page, so we want un-authenticated users to access this

app.use('/users', usersRouter); //Line created automatically Express Generator, but is used for this project. This router contains a way to create a new user, so it needs to be above the authentication function so that user has a chance to create a name and password before being asked for it.

app.use(express.static(path.join(__dirname, 'public')));

//Add routers and specify the paths they handle
app.use('/campsites', campsiteRouter); //Direct the '/campsites' path to the "campsiteRouter"
app.use('/promotions', promotionRouter);//Direct the '/promotions' path to the "promotionRouter"
app.use('/partners', partnerRouter);//Direct the '/partners' path to the "partnerRouter"
app.use('/imageUpload', uploadRouter); //Direct the '/imageUpload' path to the "uploadRouter"
app.use('/favorites', favoriteRouter); //Direct the '/favorites' path to the "favoriteRouter"



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
