var tools = require('../lib/tools.js');

var redisConfig = {
    host: process.env.DOTCLOUD_REDIS_REDIS_HOST || '127.0.0.1',
    port: process.env.DOTCLOUD_REDIS_REDIS_PORT || 6379,
    pass: process.env.DOTCLOUD_REDIS_REDIS_PASSWORD || null
};

// Never trust your users, this modules is great for protecting yourself
//var check = require('validator').check;
//var sanitize = require('validator').sanitize;
//var check = require('express-express-validator').Validator;
//use it like validator.check('email', "Email is not valid").len(6, 64).isEmail();
//var sanitize = require('express-express-validator').Filter;
// use it like this sanitize.trim();

// Let's add some fun into this
var gravatar = require('../lib/gravatar.js').avatar;

// Redis client use for the admin page
var red = require('redis').createClient(redisConfig.port, redisConfig.host);

redisConfig.pass && 
    red.auth(redisConfig.pass, function(err) {
        if (err)
            throw err;
    });

// Root route :D
exports.index = function(req, res){
  res.render('index', {title: "Home page"});
};

// Home page
exports.welcome = function(req, res){
  res.render('welcome', { title: 'Welcome', session: req.session });
};

//My registration Form
exports.registration = function (req,res) {
    //TODO validation of user input
    req.assert("fname", "Fname is Empty").notEmpty();
    req.assert("lname", "Lname is empty").notEmpty();
    req.assert("email", "Email is not valid").notEmpty().len(6,64).isEmail();
    req.assert("passwd", "Password is not proper").len(2);
    req.assert("passwd", "Error password confirmation").equals(req.body.conpasswd);
    var mappedErrors = req.validationErrors(true);
    if (mappedErrors){
        res.render('registration', {title: "Registration"});

    } else {
        //TODO save user data to DB
        exports.initSession(req, res);
    }
};

//Login form
/*exports.signin = function(req, res){
    //TODO validation
    if(req.body.email && req.body.pass){
       res.redirect('/usergallery');
    }
}*/

//Gallery page
exports.gallery = function(req, res) {
    res.render('gallery', {title: "Gallery page"});
};

// Login form
exports.login = function(req, res){
    //tools.log(req.body);
    res.render('login', { title: 'Sign in'});
}

// Process auth
exports.initSession = function(req, res){

  // If the session is empty let's init one with an empty array
  if (!req.session) {
    req.session = {};
  }

  // let's log what the user sent us
  tools.log(req.body);

  // check if an email is given
  if(!req.body || !req.body.email) {
    req.session.error = "No email address given";
    res.redirect('/signin');
    return;
  }

  // clean the email from XSS exploits
  var email = req.sanitize('email', "Email is not valid").trim();
  email = req.sanitize(email).xss();

  // is this a valid email ?
  try{
    req.assert('email').len(6).isEmail();
  }
  catch(e) {
    req.session.error = "The given email address does not seems to be correct!";
    res.redirect('/signin');
    return;
  }

  req.session.email = req.body.email;
  req.session.gravatar = gravatar(req.body.email , 300);
  
  res.redirect('/usergallery');
}


// admin page
exports.admin = function(req, res){
  red.keys('myfirstapp:' + '*', function(err, sessionKeys) {
      if (err) throw err;
      red.mget(sessionKeys, function (error, data){

        // the redis result is an array of JSON string, let's get the object from the strings
        var d = data.map(JSON.parse);
        res.render('admin', {title: 'Super secret admin page :D', users: d})
      })
  });
}
