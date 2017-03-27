
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our Blast model
var eventSchema = mongoose.Schema(
    {
        eventName:   String,
        location:    String,
        date:        String,
        about: 		 String 
    });

var Event = mongoose.model('Event', eventSchema);

// create the model for Blast and expose it to our app
module.exports = Event;