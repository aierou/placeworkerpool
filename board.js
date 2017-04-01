var http = require('http'),
    request = require("request");

var config = require("./config.js");

//Taken from page source. Don't know exactly what conversions are happening here yet.
var r, state = new Uint8Array(config.place_canvas_width * config.place_canvas_height), s = 0;
function buildState(e) {
  r || (r = (new Uint32Array(e.buffer,0,1))[0], e = new Uint8Array(e.buffer,4));
  for (var t = 0; t < e.byteLength; t++){
    state[s + 2 * t] = e[t] >> 4;
    state[s + 2 * t + 1] = e[t] & 15;
  }
  s=0;//s += e.byteLength * 2
  getWork();
}

var goal;
this.setImage = function(image){
  goal = image;
}

var work;
//TODO: adapt this for configurable jobs based on specified image
function getWork(){
  work = [];
  for(var i = 0; i < state.length; i++){
    if(goal[i] != 100 && state[i] != goal[i]) work.push(i); //Blue army
  }
  console.log("Jobs: " + work.length);
}

function indexToPos(index){
  var x = index % config.place_canvas_width;
  var y = Math.floor(index / config.place_canvas_width);
  return {x:x, y:y};
}

this.posToIndex = function(x, y){
  var index = y * config.place_canvas_width;
  index += x;
  return index;
}

this.palette = ["#FFFFFF", "#E4E4E4", "#888888", "#222222", "#FFA7D1", "#E50000", "#E59500", "#A06A42", "#E5D900", "#94E044", "#02BE01", "#00D3DD", "#0083C7", "#0000EA", "#CF6EE4", "#820080"];

this.getRGBPalette = function(){
  var ret = [];
  for(var i = 0; i < this.palette.length; i++){
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.palette[i]);
    ret.push(result ? {
        R: parseInt(result[1], 16),
        G: parseInt(result[2], 16),
        B: parseInt(result[3], 16)
    } : null);
  }
  return ret;
}

this.update = function(){
  request({
    followAllRedirects: true,
    url: "https://reddit.com/api/place/board-bitmap",
    encoding: null
  }, function (error, response, body) {
    if (!error) {
      buildState(body);
      console.log("Board updated");
    }
  });
}
setInterval(this.update, config.update_delay);

this.getNextTile = function(){
  var index = work.pop();
  var color = goal[index];
  var pos = indexToPos(index);
  return {color: color, x: pos.x, y: pos.y};
}

module.exports = this;
