/*
    PubNub Functions Pirate Duck Bot
    Copyright 2019, Mark D. F. Williams, All rights reserved

    Part of the PubNub Pirate Duck Chat Demo project.     

*/

// Woof!, Red, Woof!
const DANCE_KEY = "duck_dance_key";
const DEFINED_SECRET_SETS = [{
            // Blue, Yellow, Red
            secret: ["color:#4421D0", "color:#FECE53", "color:#D02129"],
            dance: "bounce"
        }, {
            // Yellow, Red, Blue
            secret: ["color:#FECE53", "color:#D02129", "color:#4421D0"],
            dance: "shake"
        }, {
            // Quacks... , Blue, Woof!(Quack!)
            secret: ["text:If it quacks like a duck, is it a duck?", "color:#4421D0", "text:Quack!"],
            dance: "swing"
        }, {
            // Yellow
            secret: ["color:#FECE53", "text:A duck without Ahab is just a duck.", "text:Quack!"],
            dance: "tada"
        }
    ];

const pubnub = require('pubnub');

export default (request) => { 
    if (!(request.channels.includes("ducktalk") || request.channels.includes("duckcolor"))) {
        return request.ok();
    }
    const kvstore = require('kvstore');
    let currentStep = deriveCurrentStep(request);
    if (!currentStep) {
        //console.log("Skipping - no step.");
        return request.ok();

    } else {
        return kvstore.get(DANCE_KEY).then((storedSteps) => {
            // Build out the steps
            //console.log("1. StoredSteps: " + JSON.stringify(storedSteps));
            return buildSteps(storedSteps, currentStep);
        }).then((steps) => {
            // Test the steps
            //console.log("2: " + JSON.stringify(steps));
            return matchDanceMoves(steps);
 
        }).then((steps) => {
            // Save
            //console.log("3: " + JSON.stringify(steps));
            kvstore.set(DANCE_KEY, steps);
            return request.ok();
        });
    }
    return request.ok(); // Return a promise when you're done 
}

function deriveCurrentStep(request) {
    let currentStep = null;
    if (request.channels.includes("ducktalk")) {
        let speech = request.message.text;
        if (speech) {
            currentStep = "text:" + speech;
        }
    } else if (request.channels.includes("duckcolor")) {
        let color = request.message.color;
        if (color) {
            currentStep = "color:" + color;
        }
    }
    //console.log("currentStep :: " + currentStep);
    return currentStep;
}

function buildSteps(inStoredSteps, inCurrentStep) {
    let steps = null;
    //console.log("inStoredSteps", JSON.stringify(inStoredSteps));
    if (inStoredSteps) {
        steps = inStoredSteps
    } else {
        steps = [];
    }
    steps.push(inCurrentStep);
    if (steps.length > 3) {
        let removed = steps.shift();
    }
    //console.log("New steps..." + JSON.stringify(steps));
    return steps;
}


function matchDanceMoves(steps) {
    let didMatchASecretSet = false;
    let matchedDanceMove = null;
    for (let i = 0; i < DEFINED_SECRET_SETS.length; i++) {
        let thisSet = DEFINED_SECRET_SETS[i];
        let thisSecret = thisSet.secret;
        //console.log("Starting match for :" + JSON.stringify(thisSecret));
        let didAllMatch = false;

        for (let j = 0; j < thisSecret.length; j++) {
            didAllMatch = true;
            if (thisSecret[j] !== steps[j]) {
                //console.log("[" + i + "][" + j +"] NO match: " + thisSecret[j] + " and " + steps[j]);
               didAllMatch = false;
               break;
            } else {
                //console.log("[" + i + "][" + j +"] matched: " + thisSecret[j] + " and " + steps[j]);
            }
        }
        if (didAllMatch) {
            //console.log("Found a match for " + JSON.stringify(steps) + " ::" + JSON.stringify(thisSet));
            didMatchASecretSet = true;
            matchedDanceMove = thisSet.dance;
            break;
        }
    }
    
    if (didMatchASecretSet) {
        // console.log("Tried to dance - and will send " + matchedDanceMove);
        return callTheDance(matchedDanceMove);
    } else {
        //console.log("Tried to dance - and did not");
        return steps;
    }
}

function callTheDance(danceMove) {
    return pubnub.publish({
        "channel": "duckdance",
        "message": {
            "style": danceMove
        }
    }).then((publishResponse) => {
        //console.log(`Publish Status: ${publishResponse[0]}:${publishResponse[1]} with TT ${publishResponse[2]}`);
        return [];
    });

}