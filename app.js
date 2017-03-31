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

//Update the board every 5 min
var updater = setInterval(board.update, 1000 * 60 * 5);
board.update();

//Allow CORS requests
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

app.get('/next.json', function (req, res) {
  res.status(200).json(board.getNextTile());
});

var lex = require('greenlock-express').create({
  // set to https://acme-v01.api.letsencrypt.org/directory in production
  server: "staging",
  approveDomains: config.ssl.domains,
  agreeTos: true,
  email: config.ssl.email,
  debug: true
});

http.createServer(lex.middleware(require('redirect-https')())).listen(80, function () {
  console.log("Listening for ACME http-01 challenges");
});

var start = function(){
  https.createServer(lex.httpsOptions, lex.middleware(app)).listen(443, function () {
    console.log("Listening for connections");
  });
}

start();
