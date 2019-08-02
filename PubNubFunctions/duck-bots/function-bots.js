/*
    PubNub Functions Pirate Duck Bot
    Copyright 2019, Mark D. F. Williams, All rights reserved

    Part of the PubNub Pirate Duck Chat Demo project. 

    Add this to a PubNub function slot and pretend you have more Pirate Ducks in your chatroom than you have connected.
*/

const pubnub = require('pubnub');

const ALL_MESSAGES = [{buttonText: "Down!",
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
        ]

const CHANNEL_NAME_COLOR = 'ducks.color';
const CHANNEL_NAME_TALK = 'ducks.talk';
const CHANNEL_KEY_TEXT = "text";
const CHANNEL_KEY_COLOR = "color";
const CHANNEL_KEY_DUCKNAME = 'duckName';

/**
 * If you change the number of items in the DUCK_BOTS array, change the 
 *   CLOUD_DUCK_BOT_COUNT in pubnub-keys.js.
 */
const DUCK_BOTS = ["Nearly Headless Duck", "Captain Jack Duck", "Ducky Jones"];

export default (request) => { 
    // console.log('request',request); // Log the request envelope passed 
    
    /* This call to fetchMessages will return, in the status property, 
        the last item from each of the two channels listed. 
        Return will be in the 'channels' property as an object.
        That object will contain, as keys, the channel names.
        Each name property will have an associated array of messages.
        Each message will have 'message' and 'timetoken' keys.
    */
    return pubnub.fetchMessages({
        'channels' : [CHANNEL_NAME_COLOR, CHANNEL_NAME_TALK],
        'count' : 1,
    }).then((status, response) => {
        let mostRecentMessageTime = 0;
        for (var channel in status.channels) {
            let thisMessageTime = status.channels[channel][0].timetoken;
            if (thisMessageTime > mostRecentMessageTime) {
                mostRecentMessageTime = thisMessageTime;
            }
        }
        return mostRecentMessageTime;
    }).then((mostRecentMessageTimeIn) =>{
        return pubnub.time().then((timetoken) => {
            let diff = timetoken - mostRecentMessageTimeIn;
            let diffsecs = diff / 10000000;
            if (diffsecs > 60) {
                return canPublish(request);
            }
            return request.ok();

        });
    });
 }

function canPublish (request) {
    var randBot = DUCK_BOTS[Math.floor(Math.random() * DUCK_BOTS.length)];
    let messageObject = {
        "channel": CHANNEL_NAME_COLOR,
        "message": {
            [CHANNEL_KEY_COLOR]: '#'+Math.floor(Math.random()*16777215).toString(16), //https://www.paulirish.com/2009/random-hex-color-code-snippets/
            [CHANNEL_KEY_DUCKNAME]: randBot
        }
    };
    if (Math.random() >= 0.5) {
        var randText = ALL_MESSAGES[Math.floor(Math.random() * ALL_MESSAGES.length)];
        messageObject = {
            "channel": CHANNEL_NAME_TALK,
            "message": {
                [CHANNEL_KEY_TEXT]: randText.fullText,
                [CHANNEL_KEY_DUCKNAME]: randBot
            }
        };
    }
    return pubnub.publish(messageObject).then((publishResponse) => {
        return request.ok();
    });

}