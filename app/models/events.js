
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our Blast model
var eventSchema = mongoose.Schema(
    {
        eventName:   String,
        location:    String,
        eventDay:    {type:String },
        startTime:   {type:String },
        endTime:     {type:String },
        date:        {type:String },
        about: 		 String,
        createdBy:   String
    });

var Event = mongoose.model('Event', eventSchema);

// create the model for Events  and expose it to our app
module.exports = Event;