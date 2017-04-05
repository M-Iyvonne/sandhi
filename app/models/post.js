
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


exports.googleApi = function(req, res){
  var key = req.query.key;
  var location = encodeURIComponent(req.query.location);
  var radius = 16000;
  var sensor = false;
  var types = "restaurant";
  var keyword = "fast";

  var https = require('https');
  var url = "https://maps.googleapis.com/maps/api/place/search/json?" +
		   "key=" + key + "&location=" +
		    location + "&radius=" + radius 
		    + "&sensor=" + sensor + "&types=" + types + 
		    "&keyword=" + keyword;
		 console.log(url);
  https.get(url, function(response) {
    var body ='';
    response.on('data', function(chunk) {
      body += chunk;
    });

    response.on('end', function() {
      var places = JSON.parse(body);
      var locations = places.results;
      var randLoc = locations[Math.floor(Math.random() * locations.length)];

      res.json(randLoc);
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
};