//Server for a reddit.com/r/place botnet. The goal of this application is to distribute
//work across a number of users in order to more effectively preserve /r/place images
//In the future the plan is to allow the goal to be customized, or perhaps even service
//multiple /r/place initiatives with some sort of web interface and customization options
//Currently, in order to connect to the botnet and get work, users must add the userscript
//"client.js" To their browser.

var express = require('express'),
    bodyParser = require("body-parser"),
    https = require("https"),
    http = require("http");

var board = require("./board.js"),
    config = require("./config.js");

var app = express();

app.set('port', (process.env.PORT || 443));

//Update the board every 5 min
var updater = setInterval(board.update, 1000 * 60 * 5);
board.update();

//Allow CORS requests
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

app.use(express.static('public'));

app.get('/next.json', function (req, res) {
  res.status(200).json(board.getNextTile());
});

app.get('/', function (req, res) {
  res.send("github.com/aierou/placeworkerpool -- get the userscript at /client.js");
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
