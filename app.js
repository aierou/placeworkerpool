//Server for a reddit.com/r/place botnet. The goal of this application is to distribute
//work across a number of users in order to more effectively preserve /r/place images
//In the future the plan is to allow the goal to be customized, or perhaps even service
//multiple /r/place initiatives with some sort of web interface and customization options
//Currently, in order to connect to the botnet and get work, users must add the userscript
//"client.js" To their browser.

var express = require('express'),
    bodyParser = require("body-parser"),
    https = require("https"),
    http = require("http")
    Jimp = require("jimp"),
    diff = require('color-diff');

var board = require("./board.js"),
    config = require("./config.js");

var app = express();

app.set('port', (process.env.PORT || 443));

//Get desired pixel map
function convertImage(){
  var palette = board.getRGBPalette();
  Jimp.read("in.png", function (err, image) {
    var out = new Uint8Array(config.place_canvas_width * config.place_canvas_height).fill(100);
    var width = Math.min(image.bitmap.width, config.place_canvas_width);
    var height = Math.min(image.bitmap.height, config.place_canvas_height);
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx){
      var red   = this.bitmap.data[ idx + 0 ];
      var green = this.bitmap.data[ idx + 1 ];
      var blue  = this.bitmap.data[ idx + 2 ];
      var alpha = this.bitmap.data[ idx + 3 ];

      var approx;
      var closest;
      if(alpha == 0){
        return;
      }else{
        var color = {R:red, G:green, B:blue};
        closest = diff.closest(color, palette);
        for(var i = 0; i < palette.length; i++){
          //Costly bad comparison
          if(JSON.stringify(closest) === JSON.stringify(palette[i])){
            approx = i;
            break;
          }
        }
      }
      var index = board.posToIndex(x,y);

      out[index] = approx;
    });
    board.setImage(out);
    board.update();
  });
}
convertImage();

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
