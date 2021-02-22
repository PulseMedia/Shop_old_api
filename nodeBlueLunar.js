//Optional Package for colored console outputs:
//cli-color (https://www.npmjs.com/package/cli-color)

try {
    var clc = require('cli-color');
} catch (ex) {
    var clc = undefined;
}

function blLog(message){
  if(clc == undefined){
    console.log("[BLUELUNAR] " + message);
  } else {
    console.log("["+ clc.xterm(45)("BLUELUNAR") +"] " + message);
  }
}

var __$BlueLunar_Token = "";

class BlueLunarClient{

  constructor(settings){
    if(settings.token){
      this.Token = settings.token.trim();
      __$BlueLunar_Token = this.Token;
    } else {
      blLog("Missing Token");
      return this.notReady();
    }
    if(settings.auth){
      this.Auth = settings.auth.trim();
    } else {
      blLog("Missing Auth");
      return this.notReady();
    }
    if(settings.webhook){
      if(!settings.webhook.startsWith("/")){
        settings.webhook = "/" + settings.webhook;
      }
      if(settings.webhook.endsWith("/")){
        this.Listen = settings.webhook.substring(0, settings.webhook.length-1);
        this.ListenSlash = settings.webhook;
      } else {
        this.Listen = settings.webhook;
        this.ListenSlash = settings.webhook + "/";
      }
    } else {
      blLog("Missing Webhook path");
      return this.notReady();
    }

    if(clc == undefined){
      blLog("Client Ready");
    } else {
      blLog(clc.xterm(84)("Client Ready"));
    }
    this.ready = true;
  }

  log(message){
    blLog(message);
  }

  notReady(){
    this.ready = false;
    if(clc == undefined){
      blLog("Client Initialization Failed");
    } else {
      blLog(clc.xterm(197)("Client Initialization Failed"));
    }
  }

  resolveLog(id){
    if(clc == undefined){
      blLog(id + "RESOLVED");
    } else {
      blLog(id + clc.xterm(84)("RESOLVED"));
    }
  }

  rejectLog(id){
    if(clc == undefined){
      blLog(id + "REJECTED");
    } else {
      blLog(id + clc.xterm(198)("REJECTED"));
    }
  }

  isWebhookRequest(request){
    if(request.method == 'POST') {
      if(request.url.trim() == this.Listen || request.url.trim() == this.ListenSlash){
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  handleWebhook(request, response, callback){
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    let data = "";
    request.on("data", text => data += text);
    request.once("end", () => {
      let json = {};
      try {
        json = JSON.parse(data);
      }
      catch (err) {
        blLog("Unable to parse WebhookJson");
        response.end(JSON.stringify({ "error": "InvalidPostJson" }));
        return;
      }
      if(json.auth && json.auth == this.Auth){
        if(json.type && json.status && json.payload && json.user){

          if(clc == undefined){
            blLog(json.type + ": " + json.payload.oid);
          } else {
            blLog(clc.xterm(42)(json.type) + ": " + clc.xterm(75)(json.payload.oid));
          }
          callback(json.type, json.status, json.payload, json.user, {
            resolve(content = ""){
              response.end(JSON.stringify({ "token": __$BlueLunar_Token, "content": content }));
            },
            reject(){
              response.end(JSON.stringify({ "error": "Rejected" }));
            }
          })

        } else {
          json.auth = "<HIDDEN>";
          blLog("Invalid Webhook Json\n" + JSON.stringify(json));
          response.end(JSON.stringify({ "error": "InvalidJsonContent" }));
        }
      } else {
        blLog("Invalid Webhook Auth");
        response.end(JSON.stringify({ "error": "InvalidAuth" }));
      }

    });
  }

}

module.exports = {

  client: BlueLunarClient,

};
