var http = require('http'),
    request = require("request");

var config = require("./config.js");

this.palette = ["#FFFFFF", "#E4E4E4", "#888888", "#222222", "#FFA7D1", "#E50000", "#E59500", "#A06A42", "#E5D900", "#94E044", "#02BE01", "#00D3DD", "#0083C7", "#0000EA", "#CF6EE4", "#820080"];
this.users = {};
var goal_image;
var work;

//Taken from page source. Don't know exactly what conversions are happening here yet.
var r, state = new Uint8Array(config.place_canvas_width * config.place_canvas_height), s = 0;
function buildState(e) {
  s=0;//s += e.byteLength * 2
  r = null;
  state = new Uint8Array(config.place_canvas_width * config.place_canvas_height)
  r || (r = (new Uint32Array(e.buffer,0,1))[0], e = new Uint8Array(e.buffer,4));
  for (var t = 0; t < e.byteLength; t++){
    state[s + 2 * t] = e[t] >> 4;
    state[s + 2 * t + 1] = e[t] & 15;
  }
  getWork();
}
function getWork(){
  work = [];
  for(var i = 0; i < state.length; i++){
    if(goal_image[i] != 100 && state[i] != goal_image[i]) work.push(i); //Blue army
  }
  console.log("Jobs: " + work.length);
}

this.setImage = function(image){
  goal_image = image;
}

this.indexToPos = function(index){
  var x = index % config.place_canvas_width;
  var y = Math.floor(index / config.place_canvas_width);
  return {x:x, y:y};
}

this.posToIndex = function(x, y){
  var index = y * config.place_canvas_width;
  index += x;
  return index;
}

this.getRGBPalette = function(){
  var ret = [];
  for(var i = 0; i < this.palette.length; i++){
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.palette[i]);
    ret.push(result ? {
        R: parseInt(result[1], 16),
        G: parseInt(result[2], 16),
        B: parseInt(result[3], 16),
        id: i
    } : null);
  }
  return ret;
}

var thisRound = 0;
var lastRound = 0;
this.update = function(){
  this.users = {};
  lastRound = thisRound;
  thisRound = 0;
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

this.getStats = function(){
  return {current: thisRound, last: lastRound};
}
this.getNextTile = function(){
  thisRound++;
  var index = work.pop();
  var color = goal_image[index];
  var pos = this.indexToPos(index);
  return {color: color, x: pos.x, y: pos.y};
}

module.exports = this;
