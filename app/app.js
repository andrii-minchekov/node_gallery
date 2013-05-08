// Module dependencies
var express = require('express');

// this is just like doing: var routes = require('./routes/index.js')
var routes = require('./routes');
var http = require('http');
var path = require('path');
var RedisStore = require('connect-redis')(express);
var expressValidator = require('express-validator');

// Let's group our tools together
var tools = require('./tools.js');

// Middleware are awesome, they able you to do a lt of things easily
var mid = require('./middlewares.js');

// Initialisation of Express
var app = express();

// Setup the option for the redisStore in which are saved the sessions
var redisOptions = {
    prefix: 'myfirstapp:',
    host: process.env.DOTCLOUD_REDIS_REDIS_HOST || '127.0.0.1',
    port: process.env.DOTCLOUD_REDIS_REDIS_PORT || 6379,
    pass: process.env.DOTCLOUD_REDIS_REDIS_PASSWORD || null
};


// Express configuration
app.configure(function ()//noinspection JSValidateTypes,JSValidateTypes
{
    // Setup the port from the UNIX environement with a fallback , practical for dev and prod
    //app.set('imageStoreDir', __dirname + "/image-store/");
    app.set('port', process.env.WWW_PORT || 8080);

    app.set('views', __dirname + '/views');

    // Choose you template engine, have a look at express doc for ejs, haml, and html
    app.set('view engine', 'jade');

    // Setup the favicon, if no path given a default favicon is used
    app.use(express.favicon());
    app.use(expressValidator);

    app.use(express.logger('dev'));
    app.use(express.bodyParser({
        uploadDir: __dirname + '/image-store/tmp',
        keepExtensions: true,
    }));

    app.use(express.limit('5mb'));
    app.use(express.methodOverride());

    // Setup a session store in redis, if you ever want to scale this will be needed
    app.use(express.cookieParser('My First Express App'));
    app.use(express.session({ store: new RedisStore(redisOptions) }));


    app.use(express.static(path.join(__dirname, 'public')));

    /*
     Locals are super usefull they enable you to pass a value to all you templates.
     This is super usefull for certain scenario like always giving the session.
     Or like in this case the page we are on for the menu
     */
    app.use(function (req, res, next) {
        // Let's give the requested page to the layout template to selected the right menu li as active
        res.locals.page = req._parsedUrl.pathname;

        req.session.appRootdir = __dirname;
        req.session.imageStoreDir = __dirname + "/image-store/";
        // This can also be used to handle errors
        if (req.session.errors) {
            res.locals.errors = req.session.errors;
            delete req.session.errors;
        }
        else
            res.locals.errors = undefined;

        // Something you may want to do
        res.locals.session = req.session;
        // instead of passing {session: req.session} in every routes. Nice right ?
        // if you do this way you can make routes in routes/index.js less verbose
        // for example line 21 in routes/index.js would become:
        // res.render('welcome', { title: 'Welcome'});

        next();
    });

    app.use(app.router);

});

app.configure('development', function () {
    app.use(express.errorHandler());
});


/*
 This route is the default one, the one you hit when to arrive directly on the server.
 It is "protected" by the session middleware to force the user to authenticate.
 routes.index in the exported route called index in the module route,
 here the module route is defined in routes/index.js.
 */
app.get('/', mid.auth, routes.index);
app.get('/index', routes.index);

app.get('/signup', function (req, res) {
    res.render('registration', {title: "Registration"});
});
app.post('/signup', routes.registration);

app.get('/signin', routes.login);
// Handle the authentication
app.post('/init-session', routes.initSession);

app.get('/usergallery', mid.auth, routes.gallery);
app.post('/usergallery', mid.auth, routes.gallery);
app.get('/getImage', mid.auth, routes.imageOutput);
// Actually let's have a polite url, by redirecting you to /Welcome, it looks nicer
app.get('/welcome', mid.auth, routes.welcome);

// A non protected route where to redirect the user to he can enter his email addresse
app.get('/who-are-you', routes.login);

// An admin page complety hardcoded ?
app.get('/admin', mid.auth, mid.admin, routes.admin);

app.get('/practice', function (req, res) {
    res.render('practice', {title: "It's page for practicing"})
});

// Start the Express server
http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
