/*
    PubNub Functions Pirate Duck Bot
    Copyright 2019, Mark D. F. Williams, All rights reserved

    Part of the PubNub Pirate Duck Chat Demo project.     

*/

const allMessages = [{buttonText: "Down!",
        fullText: "Down with the Geese!"},
        {buttonText: "Quack…?",
        fullText: "If I quack like a duck, am I a duck?"},
        {buttonText: "Ducky…",
        fullText: "Duckie was robbed!"},
        {buttonText: "Strait…",
        fullText: "Messier 11 and strait on 'til morning."},
        {buttonText: "Ugly?",
        fullText: "Ugly Duckling? The swans wish they could be so cool."},
        {buttonText: "Betrayal",
        fullText: "A friend may betray you, but a duck will always stay the same."},
        {buttonText: "Where…",
        fullText: "Where there is a pond, there are Pirate Ducks."},
        {buttonText: "Shiver",
        fullText: "Shiver me tail feathers!"},
        {buttonText: "Good night",
        fullText: "Good night, Duckies. Good work. Sleep well. I'll most likely kill you in the morning."},
        ]


// Declare the Function with the export syntax. The incoming message is called request
export default (request) => {
    // Require console module to display variables for troubleshooting
    var console = require("console");
    return filter(request).then(translate).then(function(result) {
        //console.log(result);
        return result;
    })
};

let filter = function(request) {
    return new Promise(function(resolve, reject) {
        console.log(request.message);
        const requestMessageText = request.message.text;

        // If the text field in the message is "Woof!", we change it to "Quack!"
        if (requestMessageText === "Woof!") {
            request.message.text = "Quack!";
            request.message.note = "Note: Content was changed to align with community standards."
            return resolve(request);
        }
        // If the message text does not equal one of our accepted texts, change it.
        let badphrase = true;
        for (const msg of allMessages) {
            if (msg.fullText === requestMessageText) {
                badphrase = false;
                break;
            }
        }
        if (badphrase) {
            request.message.text = "Quack?"
            request.message.note = "Note: Content was changed as it was not in the approved list."         
        }
        resolve(request);
    });
}

let translate = function(request) {
    return new Promise(function(resolve, reject) {
        if (request.message.text === "Quack!") {
            request.message.morse = "beep beep";
        }
        resolve(request);
    });
}
