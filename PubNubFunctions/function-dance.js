/*
    Pirate Duck Chat Demo - Dance move function
    Copyright 2019, Mark D. F. Williams, All rights reserved

    PubNub Function for demonstrating "After Publish or Fire" event type and the KV Store.
    1. Listens to all messages on the ducks.color and ducks.talk channels.
    2. When a new message is received, the previous messages are accessed from the KV store.
    3. Matches the most recent 3 messages against the defined secrets
    4. If a match is made, a message is sent through the dance channel and then an empty set is stored in the KV store.
    5. If a match is not made, the last 3 sent messages are stored in the KV store.
*/

const CHANNEL_NAME_COLOR = 'ducks.color';
const CHANNEL_NAME_TALK = 'ducks.talk';
const CHANNEL_NAME_DANCE = 'ducks.dance';
const CHANNEL_KEY_DANCE = "style";
const KV_KEY_DANCE = "duck_dance_key";

const DEFINED_SECRET_SETS = [{
            // Blue, Yellow, Red
            secret: ["color:#4421D0", "color:#FECE53", "color:#D02129"],
            dance: "bounce"
        }, {
            // Yellow, Red, Blue
            secret: ["color:#FECE53", "color:#D02129", "color:#4421D0"],
            dance: "shake"
        }, {
            // Shiver , Blue, Woof!(Quack!)
            secret: ["text:Shiver me tail feathers!", "color:#4421D0", "text:Quack!"],
            dance: "swing"
        }, {
            // Red, Duckie, Red
            secret: ["color:#D02129", "text:Duckie was robbed!", "color:#D02129"],
            dance: "tada"
        }, {
            // Quack! Quack! Quack!
            secret: ["text:Quack!", "text:Quack!", "text:Quack!"],
            dance: "lightSpeedOut"
        }
    ];

const pubnub = require('pubnub');

/** 
 * The core function that is called by the block. 
 * 'Request' contains the information we need to make decisions about our dance.
 */
export default (request) => { 
    // If the channels are not the talk or color channels, ignore the event and return the resolved promise.
    if (!(request.channels.includes(CHANNEL_NAME_TALK) || request.channels.includes(CHANNEL_NAME_COLOR))) {
        return request.ok();
    }
    // Load the kvstore
    const kvstore = require('kvstore');

    let currentStep = deriveCurrentStep(request);
    if (!currentStep) {
        return request.ok();
    } else {
        return kvstore.get(KV_KEY_DANCE).then((storedSteps) => {
            // Build out the steps
            return buildSteps(storedSteps, currentStep);
        }).then((steps) => {
            // Test the steps
            return matchDanceMoves(steps);
        }).then((steps) => {
            // Save
            kvstore.set(KV_KEY_DANCE, steps);
            return request.ok();
        });
    }
    return request.ok();
}

function deriveCurrentStep(request) {
    let currentStep = null;
    if (request.channels.includes(CHANNEL_NAME_TALK)) {
        let speech = request.message.text;
        if (speech) {
            currentStep = "text:" + speech;
        }
    } else if (request.channels.includes(CHANNEL_NAME_COLOR)) {
        let color = request.message.color;
        if (color) {
            currentStep = "color:" + color;
        }
    }
    return currentStep;
}


function buildSteps(inStoredSteps, inCurrentStep) {
    let steps = null;
    if (inStoredSteps) {
        steps = inStoredSteps
    } else {
        steps = [];
    }
    steps.push(inCurrentStep);
    if (steps.length > 3) {
        let removed = steps.shift();
    }
    return steps;
}


function matchDanceMoves(steps) {
    let didMatchASecretSet = false;
    let matchedDanceMove = null;
    for (let i = 0; i < DEFINED_SECRET_SETS.length; i++) {
        let thisSet = DEFINED_SECRET_SETS[i];
        let thisSecret = thisSet.secret;
        let didAllMatch = false;

        for (let j = 0; j < thisSecret.length; j++) {
            didAllMatch = true;
            if (thisSecret[j] !== steps[j]) {
               didAllMatch = false;
               break;
            } else {
            }
        }
        if (didAllMatch) {
            didMatchASecretSet = true;
            matchedDanceMove = thisSet.dance;
            break;
        }
    }
    
    if (didMatchASecretSet) {
        return callTheDance(matchedDanceMove);
    } else {
        return steps;
    }
}

function callTheDance(danceMove) {
    return pubnub.publish({
        "channel": CHANNEL_NAME_DANCE,
        "message": {
            [CHANNEL_KEY_DANCE]: danceMove
        }
    }).then((publishResponse) => {
        return [];
    });
}