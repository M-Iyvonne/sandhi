var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our comment model

var commentSchema = mongoose.Schema(
    {
        blast:    String,
        subject:  String,
        author:   String, 
        date:     {type :Date, default: Date.now}
    });

var Comment = mongoose.model('Comment', commentSchema);

// create the model for Comments and expose it to our app
module.exports = Comment;


