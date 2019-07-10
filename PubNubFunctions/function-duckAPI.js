/*
    PubNub Functions Pirate Duck Bot
    Copyright 2019, Mark D. F. Williams, All rights reserved

    Part of the PubNub Pirate Duck Chat Demo project.     

*/
export default (request, response) => {
    const pubnub = require('pubnub');
    const kvstore = require('kvstore');
    const xhr = require('xhr');

    let headersObject = request.headers;
    let paramsObject = request.params;
    let methodString = request.method;
    let bodyString = request.body;
    
	var pubNub = new pubnub({
        subscribeKey: "sub-c-95c7247c-9117-11e9-90d9-8a9dabba299e",
        publishKey: "pub-c-d9bf9d00-f741-4c61-b93f-7515d30719dc",
        ssl: true,
    })

    console.log(pubNub);
   // bobsyouruncle();
    console.log('request',request); // Log the request envelope passed
    // Query parameters passed are parsed into the request.params object for you
    // console.log(paramsObject.a) // This would print "5" for query string "a=5

    if (request.params.count === 'y') {
        console.log("ASK COUNT");
    }
    // Set the status code - by default it would return 200
    response.status = 200;
    // Set the headers the way you like
   // response.headers['X-Custom-Header'] = 'CustomHeaderValue';

    return pubNub.hereNow({
        channels: ['duckcolor'],
        includeUUIDs: false,
        includeState: false
    }).then((hereNowResponse) => { 
        console.log(hereNowResponse) 
        return response.send("lol");
    }).catch((error) => { 
        console.log(error)
        return response.send("Malformed JSON body.");
    });

 /*
    return request.json().then((body) => {
        return response.send(body);
    }).catch((err) => {
        // console.log(err)
        return response.send("Malformed JSON body.");
    });
*/
};