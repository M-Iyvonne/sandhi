// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var blastSchema = new mongoose.Schema(
    {
        author:   String,
        title:    String,
        subject:  String,
        date:     Date
    });

var Blast = mongoose.model('Blast', blastSchema);

// create the model for users and expose it to our app
module.exports = Blast;
