var User = require('./models/user');
var Blast = require('./models/post');
var Comment = require('./models/comments');
var Event   =require('./models/events')


module.exports = function(app, passport) {

    // normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs', { user: req.user });
    });



    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        Event.find({}, function(err, event ){
        res.render('profile.ejs', {user: req.user, event:event});
        console.log({event:event});
        });
    });

    app.post('/profile', isLoggedIn, function(req, res) {
        User.findOne({ _id: req.user._id }, function(err, user) {
            if (!err) {
                user.local.name = req.body.name;
                user.local.aboutMe = req.body.aboutMe;
                user.save(function(err) {
                    if (!err) {
                        res.redirect('profile');
                    }
                });
            }
        });
    });
     //============================
    //Event Posting ========================
    //=================
   app.post('/event', isLoggedIn, function(req, res) {
        var newEvent = new Event({
            eventName: req.body.eventName,
            location: req.body.location,
            date: req.body.date,
            about: req.body.about
        });
        newEvent.save(function(err) {
            if (!err) {
                res.redirect('profile');
            }
        });
    });

   // app.get('/profile', isLoggedIn, function(req,res){
   //  Event.find({}).exec(function(err, data) {
   //          if (!err) {
   //              res.render('profile.ejs', {events: data })
   //          } else {
   //              console.log(err);
   //          }
   //      })
   //  });



    //============================
    //Posts Page ========================
    //=================
    app.get('/post', isLoggedIn, function(req, res) {

        var blasts;
        var commentArray = [];
        var comments = {};
        var authorsArray = [];
        var authors = {};

        Blast.find({}).sort('-date').exec()
            .then(function(blastData){
                blasts = blastData;
                blasts.forEach(function(blast){
                    blast.comments.forEach(function(comment){
                        commentArray.push(comment);
                    });
                });

                return Comment.find({'_id': {$in: commentArray}}).exec();
            })
            .then(function(commentData){
                commentData.forEach(function(comment){
                    comments[comment._id] = comment;
                    if(authorsArray.indexOf(comment.author)===-1){
                        authorsArray.push(comment.author);
                    }
                });
                // console.log('---Comments---',comments);
                console.log('---authorsArray---',authorsArray);
                return User.find({'local.name': {$in: authorsArray}}).exec();
            })
            .then(function(authorData){
                authorData.forEach(function(author){
                    authors[author._id] = author;
                });
                console.log('---authors---',authors);
                return res.render('post.ejs',{user: req.user, blasts: blasts, comments: comments, authors: authors});
            });

        // Blast.find({}).sort('-date').exec(function(err, data) {
        //     if (!err) {
        //         res.render('post.ejs', { user: req.user, blasts: data })
        //     } else {
        //         console.log(err);
        //     }
        // })

    });

    app.post('/post', isLoggedIn, function(req, res) {
        var newBlast = new Blast({
            author: req.user.local.name,
            title: req.body.title,
            subject: req.body.subject,
            date: req.body.date
        });

        newBlast.save(function(err) {
            if (!err) {
                res.redirect('post');
            }

        });
    });
    // ==========================
    // setting up Comments
    //===========================

    app.post('/comment', isLoggedIn, function(req, res) {
        

        var newComment = new Comment({
            blast: req.body.blast_id,
            subject: req.body.comment,
            author: req.user.local.name
        });
        newComment.save(function(err) {
            if (!err) {
                Blast.findOne({_id:req.body.blast_id},function(err2,blast){
                    blast.comments.push(newComment._id);
                    blast.save(function(err){
                        res.redirect('/post');
                    });
                });
            }
        });
            
        
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================

    // locally --------------------------------
    // LOGIN ===============================
    // show the login form
    app.get('/login', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureResdirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // SIGNUP =================================
    // show the signup form
    app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));


    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================

    // locally --------------------------------
    app.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', { scope: 'email' }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));



    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user = req.user;
        user.local.email = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
