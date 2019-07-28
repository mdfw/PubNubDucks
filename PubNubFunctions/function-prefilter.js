/*
    PubNub Functions Pirate Duck Bot
    Copyright 2019, Mark D. F. Williams, All rights reserved

    Part of the PubNub Pirate Duck Chat Demo project.
    Shows two possible interceptions. One is a bad word filter, the other a translation filter. For ducks. 
    Install as a "Before publish or subscribe message" type Function.
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
        console.log(request.message);

        // If the text field in the message contains "woof", we change it to "quack"
        // We also add a note to the message that could be optionally shown to the user.
        var woofIndex = request.message.text.toLowerCase().indexOf("woof");
        if (woofIndex > -1) {
            var textToFix = request.message.text;
            textToFix = textToFix.substring(0, woofIndex) + 'quack' + textToFix.substring(woofIndex+4);
            request.message.text = textToFix;
            request.message.note = "Note: Content was changed to align with community standards."
            return resolve(request);
        }
        resolve(request);
    });
}

var alphabet = {
    'a': '.-',    'b': '-...',  'c': '-.-.', 'd': '-..',
    'e': '.',     'f': '..-.',  'g': '--.',  'h': '....',
    'i': '..',    'j': '.---',  'k': '-.-',  'l': '.-..',
    'm': '--',    'n': '-.',    'o': '---',  'p': '.--.',
    'q': '--.-',  'r': '.-.',   's': '...',  't': '-',
    'u': '..-',   'v': '...-',  'w': '.--',  'x': '-..-',
    'y': '-.--',  'z': '--..',  ' ': '/',
    '1': '.----', '2': '..---', '3': '...--', '4': '....-', 
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', 
    '9': '----.', '0': '-----', 
}

/**
 * Translate the message to morse code. This isn't used fully in our demo yet, but we have plans.
 * @param {*} request 
 */
let translate = function(request) {
    return new Promise(function(resolve, reject) {
        //From https://stackoverflow.com/a/26059399/1134731
        let translated = request.message.text
            .split('')            // Transform the string into an array: ['T', 'h', 'i', 's'...
            .map(function(e){     // Replace each character with a morse "letter"
                return alphabet[e.toLowerCase()] || ''; // Lowercase only, ignore unknown characters.
            })
            .join(' ')            // Convert the array back to a string.
            .replace(/ +/g, ' '); // Replace double spaces that may occur when unknow characters were in the source string.

        console.log(translated);
        request.message.morse = translated;
        resolve(request);
    });
}


