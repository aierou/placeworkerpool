//Client script to be added to a user's browser

var url = "https://bluearmypool.herokuapp.com" //For testing right now
var delay = 1000*60*5;
var modhash = "";

function getTile(){
  var request = new XMLHttpRequest();
  request.open("GET", url+"/next.json");
  request.send();
  request.onload = function(){
    if(this.status == 200){
      var tile = JSON.parse(this.response);
      sendTile(tile);
    }
  }
}

function init(){
  var request = new XMLHttpRequest();
  request.open("GET", "/api/me.json");
  request.send();
  request.onload = function(){
    if(this.status != 200) alert("Authentication error");
    var data = JSON.parse(this.response);
    modhash = data.data.modhash;
    getTile();
  }
}

function sendTile(tile){
  var request = new XMLHttpRequest();
  request.open("POST", "/api/place/draw.json");
  request.setRequestHeader("X-Modhash", modhash);
  request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  var data = "x="+tile.x+"&y="+tile.y+"&color="+tile.color;
  request.send(data);
  request.onload = function(){
    var data = JSON.parse(this.response);
    if(data.wait_seconds){
      delay = (data.wait_seconds+5)*1000;
    }
    setTimeout(getTile, delay);
  }
}

init();
