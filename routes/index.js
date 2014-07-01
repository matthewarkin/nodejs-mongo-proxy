var express = require('express');
var router = express.Router();
var request = require('request');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/wikiApps');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("connected to db");
});

var contentScheme = mongoose.Schema({
    url: String,
    content: Buffer,
    headers: String,
    date: Date,
    statusCode: Number,
})
var Content = mongoose.model('Content', contentScheme);


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/:url', function(req, res) {
  var url = decodeURI(req.params.url);
	Content.find({'url': url}, function (err, content){
    if(content.length == 0){
      console.log("hello");
      request({url: url, encoding: null, followRedirect: false}, function (error, response, body) {
        if(err){
          res.statusCode=500;
          res.send(err);
          return;
        }
        var newContent = new Content({
          url: url,
          content: body,
          headers: JSON.stringify(response.headers),
          date: new Date(),
          statusCode: response.statusCode
        });
        console.log(response.headers);
        newContent.save(function (err, savedContent) {
          if (err) console.error(err);
          res.statusCode = response.statusCode
          res.set(response.headers);
          res.send(body);
        });
      });
    }
    else{
      console.log("hello2");
      res.statusCode = content[0].statusCode;
      res.set(JSON.parse(content[0].headers));
      res.send(content[0].content);
    }
  });
});

module.exports = router;
