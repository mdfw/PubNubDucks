/*
    Pirate Duck Language Filter using PubNub Functions
    Copyright 2019, Mark D. F. Williams, All rights reserved

    Part of the PubNub Pirate Duck Chat Demo project.
    Shows two possible interceptions using "Before publish or subscribe message" function. One is a bad word filter, the other a translation filter. For ducks. 
*/

/** 
 * The main function is declared with the export syntax. The incoming message is called request.
 * Our function first calls a language filter then a translation. Both modify and return the request object.
 * Be careful with "before publish" functions. They block delivery until the promise is resolved.
 * Although these functions return quickly because all logic is local, if you do call out to external
 *   helpers (see PubNub Blocks catalog), your external call must finish before delivery continues.
 */
export default (request) => {
    // Require console module to display variables for troubleshooting
    // var console = require("console");
    return filter(request).then(translate).then(function(result) {
        return result;
    })
};

/**
 * Filter the request message for any bad words in the Pirate Duck language.
 * @param {*} request 
 */
let filter = function(request) {
    return new Promise(function(resolve, reject) {
        //console.log(request.message);

        // If the text field in the message is "Woof!", we change it to "Quack!"
        // We also add a note to the message that could be optionally shown to the user.
        if (request.message.text === "Woof!") {
            request.message.text = "Quack!";
            request.message.note = "Note: Content was changed to align with community standards."
            return resolve(request);
        }
        resolve(request);
    });
}

/**
 * Translate the message to morse code. This isn't used fully in our demo yet, but we have plans.
 * @param {*} request 
 */
let translate = function(request) {
    return new Promise(function(resolve, reject) {
        if (request.message.text === "Quack!") {
            request.message.morse = "beep beep";
        }
        resolve(request);
    });
}
