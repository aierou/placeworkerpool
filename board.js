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

var work;
//TODO: adapt this for configurable jobs based on specified image
function getWork(){
  work = [];
  for(var i = 0; i < state.length; i++){
    if(state[i] != 13) work.push(i); //Blue army
  }
  console.log("Jobs: " + work.length);
}

function indexToPos(index){
  var x = index % config.place_canvas_width;
  var y = Math.floor(index / config.place_canvas_width);
  return {x:x, y:y};
}

this.palette = ["#FFFFFF", "#E4E4E4", "#888888", "#222222", "#FFA7D1", "#E50000", "#E59500", "#A06A42", "#E5D900", "#94E044", "#02BE01", "#00D3DD", "#0083C7", "#0000EA", "#CF6EE4", "#820080"];

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

this.getNextTile = function(){
  var color = 13;
  var pos = indexToPos(work.pop());
  return {color: color, x: pos.x, y: pos.y};
}

module.exports = this;
