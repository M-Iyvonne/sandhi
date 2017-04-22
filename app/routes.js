var User = require('./models/user');
var Blast = require('./models/post');
var Comment = require('./models/comments');
var Event = require('./models/events');

var googleApi = require('./models/post');
const fetch = require('node-fetch');
const http = require('http');
const request = require('request');


module.exports = function(app, passport) {

// normal routes ===============================================================

// show the home page (will also have our login links)
app.get('/', function(req, res) {
    res.render('index.ejs', { user: req.user });

});

// PROFILE SECTION =========================
app.get('/profile', isLoggedIn, function(req, res) {
    Event.find({}).sort('-date').exec(function(err, event) {
        res.render('profile.ejs', { user: req.user, event: event });
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
app.post('/event/:id', isLoggedIn, function(req, res) {
    if (req.body.eventId) {
        Event.findOne({ '_id': req.body.eventId }, function(err, event) {
            if (!err) {
                event.remove();
                res.redirect('/profile');
            } else {
                console.log(err);
            }
        })
    }
});

app.get('/event/id', isLoggedIn, function(req, res) {
    Event.find({ userId: req.user._id }, function(err, event) {
        if (!err) {
            res.render("profile.ejs", { user: req.user, event: event });
        };
    });
});
app.post('/event', isLoggedIn, function(req, res) {
    var userDate = req.body.date;
    var mongooseDate = new Date(userDate);
    var newEvent = new Event({
        eventName: req.body.eventName,
        location: req.body.location,
        date: mongooseDate,
        userId: req.user._id,
        about: req.body.about,
        createdBy: req.user.local.name,
        imageUrl: req.body.imageUrl
    });
    newEvent.save(function(err) {
        if (!err) {
            res.redirect('profile');
        }
    });
});

app.get("/event/search", function(req, res) {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Event.find({ "createdBy": regex }, function(err, event) {
            if (err) {
                console.log(err);
            } else {
                // console.log(event);
                res.render("profile.ejs", { user: req.user, event: event });
            }
        });
    }
});

//============================
//Posts Page ========================
//=================

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
            Blast.findOne({ _id: req.body.blast_id.trim()}, function(err2, blast) {
                console.log(err2);
                blast.comments.push(newComment._id);
                blast.save(function(err) {
                    res.redirect('/post');
                });
            });
        }
    });

});

app.post('/post/update', isLoggedIn, function(req, res){
    if(req.body.comment_id){
        Comment.findOne({_id: req.body.comment_id}, function(err, comment){
           if(!err){
            comment.subject = req.body.comment;
            comment.save(function(err, comment2){
                if(!err){
                    res.redirect('/post');
                }else{
                    res.status(500).send(err);
                }
             })
            }
        })
    }
});
app.get('/post/delete', isLoggedIn, function(req, res){
    if(req.query.id){
        Comment.findOne({_id: req.query.id}, function(err, comment){
            Blast.findOne({ 'comments': {"$elemMatch":{"$in":[req.query.id]}}}, function(err2, comment2){
                comment.remove();
                comment2.remove();
                res.redirect('/post');
            })
        })
    }
});

app.get('/post', isLoggedIn, function(req, res) {

    var blasts;
    var commentArray = [];
    var comments = {};
    var authorsArray = [];
    var authors = {};
    var results = [];

    Blast.find({}).sort('-date').exec()
        .then(function(blastData) {
            blasts = blastData;
            blasts.forEach(function(blast) {
                blast.comments.forEach(function(comment) {
                    commentArray.push(comment);
                });
            });

            return Comment.find({ '_id': { $in: commentArray } }).exec();
        })
        .then(function(commentData) {
            commentData.forEach(function(comment) {
                comments[comment._id] = comment;
                if (authorsArray.indexOf(comment.author) === -1) {
                    authorsArray.push(comment.author);
                }
            });
            // console.log('---Comments---',comments);
            // console.log('---authorsArray---',authorsArray);
            // return User.find({'local.name': {$in: authorsArray}}).exec();
        })

            var options = {
                host: 'maps.googleapis.com',
                port: 80,
                path: '/maps/api/place/textsearch/json?query=yoga+in+roswell+georgia&key=AIzaSyC_vkYwtmG26_b08J_a1CJa_PQax8wkJis'
            };
            request(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=youga+in+roswell&key=AIzaSyC_vkYwtmG26_b08J_a1CJa_PQax8wkJis`,
                function(err, g, data) {
                    data = JSON.parse(data);

            var results = [];
            for (var i = 0; i < 5; i++) {

                var result = data.results[i];
                var name = result.name;
                var address = result.formatted_address;
                var rating = result.rating;
                var id = result.id;
                var photoRef = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=500&photoreference=' + photo + '&key=AIzaSyC_vkYwtmG26_b08J_a1CJa_PQax8wkJis';
                var photo = (function() {
                    try {
                        return result.photos[0].photo_reference;

                    } catch (err) {
                        return undefined;
                    }
                })();
                // console.log("this is the photoId", photo);
                // console.log(results);

                results.push({ name: name, address: address, rating: rating, id: id, photo: photo, photoRef: photoRef });
            }
            // console.log("------RESULTS DATA-----", results);
            // console.log("-------BLASTS DATA-----",{blasts: blasts});
            return res.render('post.ejs', { user: req.user, blasts: blasts, comments: comments, authors: authors, results: results });
        });
});
// console.log('---authors---', json.name);
// .then(function(authorData){
// authorData.forEach(function(author){
//     authors[author._id] = author;
// });



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

// =========
// ==== Setting up Google googleApi
// ==========

app.post('/post/places', isLoggedIn, function(req, res) {
    var blasts;
    var commentArray = [];
    var comments = {};
    var authorsArray = [];
    var authors = {};
    var results = [];

    Blast.find({}).sort('-date').exec()
        .then(function(blastData) {
            blasts = blastData;
            blasts.forEach(function(blast) {
                blast.comments.forEach(function(comment) {
                    commentArray.push(comment);
                });
            });

            return Comment.find({ '_id': { $in: commentArray } }).exec();
        })
        .then(function(commentData) {
            commentData.forEach(function(comment) {
                comments[comment._id] = comment;
                if (authorsArray.indexOf(comment.author) === -1) {
                    authorsArray.push(comment.author);
                }
            });
        })
    var userInput = req.body.location;
    // console.log(userInput);
    // var googleAPI = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=yoga+in+${userInput}&key=AIzaSyC_vkYwtmG26_b08J_a1CJa_PQax8wkJis`;
    var options = {
        host: 'maps.googleapis.com',
        port: 80,
        path: '/maps/api/place/textsearch/json?query=yoga+in+roswell+georgia&key=AIzaSyC_vkYwtmG26_b08J_a1CJa_PQax8wkJis'
    };
    request(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=youga+in+${userInput}&key=AIzaSyC_vkYwtmG26_b08J_a1CJa_PQax8wkJis`,
        function(err, g, data) {
            data = JSON.parse(data);

            var results = [];
            for (var i = 0; i < 5; i++) {

                var result = data.results[i];
                var name = result.name;
                var address = result.formatted_address;
                var rating = result.rating;
                var id = result.id;
                var photoRef = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=500&photoreference=' + photo + '&key=AIzaSyC_vkYwtmG26_b08J_a1CJa_PQax8wkJis';
                var photo = (function() {
                    try {
                        return result.photos[0].photo_reference;

                    } catch (err) {
                        return undefined;
                    }
                })();
                // console.log("this is the photoId", photo);

                results.push({ name: name, address: address, rating: rating, id: id, photo: photo, photoRef: photoRef });
            }
            // console.log(results);
            // console.log(photo);
            res.render('post.ejs', { results: results, user: req.user, blasts: blasts, comments: comments });
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
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
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


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
