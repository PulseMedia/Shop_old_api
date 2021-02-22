# BlueLunar NodeJs Webhook Http-Server Client

Simple NodeJS Http-Server BlueLunar Integration

### Requirements

The Integration has the following requirements:

* BlueLunar Seller Account
* Server with NodeJs (12.18.4 LTS+) (Should be online 24/7)
-- NodeJS Http-Server (BuiltIn)
-- NPM [cli-color](https://www.npmjs.com/package/cli-color) (Optional, for Colored Console outputs)
* Any Database or something else
--to store the User Payments/Subscriptions eg(MongoDB (NPM mongoose))

### Useage

##### Initialization - Example
Import the BlueLunar-NodeJs Module and Initialize the Client
```js
var BlueLunarNode = require('./nodeBlueLunar');
var BlueLunar = new BlueLunarNode.client({
  token: "<Your-Token>",
  auth: "<Your-Auth>",
  webhook: "/bl/webhook/" //Route to Webhook
});
if(BlueLunar.ready){
    //Client Ready
    //Start HttpServer or do other Actions
}
```
##### Http-Server - Example


```js
http.createServer(function (request, response) {
    if(BlueLunar.isWebhookRequest(request)){ //Check if request is an BlueLunar Webhook
        BlueLunar.handleWebhook(request, response, (type, status, payload, user, actions) => { //Handle the Webhook
            //type (string) == "PAYMENT" or "SUBSCRIPTION"
            
            //status (string) == "PAYMENT": type
                // - "DONE" Payment is Done
            //status (string) == "SUBSCRIPTION": type
                // - "ACTIVE" Subscription Activated (After first Payment)
                // - "CANCELLED" Subscription Cancelled by User
                // - "SUSPENDED" Subscription Suspended by user (Maybe not Payed)
                // - "EXPIRED" Subscription Expired (eg: Subscription only runs 3 Months)
                
            //payload (object)
                //oid (string) - Unique Order ID
                //article (string) - Article SKU
                //quantity (number) - Buyed Quantity (on Subscription always 1)
                
            //user (object)
                //<Dynamic Key/Value> User-Input Fields of the Product Page
                
            //actions (object)
                //reject (function) execute if webhook was not successfully handelt
                //resolve (function) execute if webhook was successfully handelt
                    //pass string to resolve function to display infos in the bluelunar web dashboard (eg. virtual product key)
                
            //EXAMPLE Payment Webhook Handling with DONE Status & ArticleID
            if(type == "PAYMENT" && status == "DONE"){
                if(payload.article == "123"){
                    //Actions, eg: Save payment with user-data to database
                    
                    //Note its import to save the OrderID (payload.oid)
                    //This is Important for Later Reference to the BlueLunar Payment/Subscription
                    actions.resolve(); //Webhook Done
                } else {
                    //Invalid ArticleID
                    actions.reject(); //Webhook Failed
                }
            } else {
                //Invalid PaymentType/Status
                actions.reject(); //Webhook Failed
            }
        }
    } else {
        //Do something else if it's not a webhook
        response.end("Not A Webhook");
    }
}).listen(8080);

//from above "Initialization"-Example, your WebHook url will be:
//http://<YourIp/Domain>:8080/bl/webhook/
```

### Client Props & Methods

The "parse"-Method returns the following Object with Keys/Values

| Client.<Key> | Method/Returns |
| ------ | ------ |
| ready | Boolean - Check if Client is ready |
| isWebhookRequest | Boolean - Check if Http-Server Request is an Webhook |
| handleWebhook | Function - Handle the Webhook |