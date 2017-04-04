//This was a standalone tool to update the goal image

var http = require('http'),
    request = require("request"),
    Jimp = require("jimp");

var config = require("../config.js");

if(process.argv.length < 3){
  console.log("You must specify a key for authentication.");
  process.exit();
}

var key = process.argv[2];
var filename = process.argv[3] || "in.png";

Jimp.read(filename, function (err, image) {
  image.getBase64(Jimp.MIME_PNG, function(err, image){
    var options = {
      uri: config.url + "/goal",
      method: "POST",
      json: {
        key: key,
        image: image.replace(/^data:image\/\w+;base64,/, '')
      }
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log("Image uploaded");
      }else{
        console.log(response.statusCode + " " + error);
      }
    });
  });
});
