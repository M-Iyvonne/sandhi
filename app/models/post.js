
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our Blast model
var blastSchema = mongoose.Schema(
    {
        author:   String,
        title:    String,
        subject:  String,
        date:     {type :Date, default: Date.now},
        comments: [String]
    });

var Blast = mongoose.model('Blast', blastSchema);

// create the model for Blast and expose it to our app
module.exports = Blast;
