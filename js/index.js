/*
    PubNub Functions Pirate Duck Bot
    Copyright 2019, Mark D. F. Williams, All rights reserved

    Part of the PubNub Pirate Duck Chat Demo project. 
    

*/
const CHANNEL_KEY_TEXT = "text";
const CHANNEL_KEY_COLOR = "color";
const CHANNEL_KEY_DANCE = "style";
const CHANNEL_KEY_DUCKNAME = 'duckName';
const CHANNEL_NAME_COLOR = 'ducks.color';
const CHANNEL_NAME_TALK = 'ducks.talk';
const CHANNEL_NAME_DANCE = 'ducks.dance';
const LOG_LIMIT = 29;

let pubnub = null;
let generatedDuckName = "Duck";
let loggedMessages = [];

$(document).ready(function(){   
 /*   setInterval(function() {
        console.log("bot message sent");
        sendMessageToPubNub ("bots.ducks", "send:", "now" );
    }, 30000);
    */
   setMessagesOnButtons();
    generatedDuckName = randomName();
    updateDuckMetaName(generatedDuckName);
    updateDuckStatus("Loading and subscribing to the " + CHANNEL_NAME_COLOR + " and " + CHANNEL_NAME_TALK + " channels.");

    pubnub = new PubNub({
        subscribeKey: "sub-c-95c7247c-9117-11e9-90d9-8a9dabba299e",
        publishKey: "pub-c-d9bf9d00-f741-4c61-b93f-7515d30719dc",
        ssl: true,
        uuid: generatedDuckName,
    })

    pubnub.addListener({
        status: function(statusEvent) {
            processStatusEvent(statusEvent);
        },
        message: function(envelope) {
            processReceivedMessage(envelope);
        },
        presence: function(presenceEvent) {
            processPresenceEvent(presenceEvent);
        }
    })
    pubnub.subscribe({
        channels: [CHANNEL_NAME_COLOR],
        withPresence: true, 
    });
    pubnub.subscribe({
        channels: [CHANNEL_NAME_TALK, CHANNEL_NAME_DANCE],
        withPresence: false,
    });
});

/* PubNub functions */

function processStatusEvent(statusEvent) {
    logReceivedMessage(statusEvent, "a status event");
    if (statusEvent.category === "PNDisconnectedCategory" || statusEvent.category === "PNTimeoutCategory" || statusEvent.category === "PNNetworkIssuesCategory" || statusEvent.category === "PNNetworkDownCategory") {
        hideChangeInterface();
        updateDuckStatus("<i>Internet connection is not available. The duck is sad.</i>");
    }
    if (statusEvent.category === "PNConnectedCategory" || statusEvent.category === "PNNetworkUpCategory") {
        showChangeInterface();
        requestHereNow();
        requestHistory();
    }
}

function requestHereNow() {
    pubnub.hereNow(
        {
            channels: [CHANNEL_NAME_TALK],
            includeUUIDs: false,
            includeState: false
        },
        function (status, response) {
            if (status.error === false) {
                processHereNowResponse(response);
            }
        }
    );
}

function processHereNowResponse(message) {
    var totalOccupants = message.totalOccupancy;
    if (totalOccupants && totalOccupants > -1) {
        updateConnectedDuckCount(totalOccupants);
        logReceivedMessage(message, "a hereNow (presence) update");
    }
}

function requestHistory() {
    pubnub.history(
        {
            channel: CHANNEL_NAME_COLOR,
            count: 1, // how many items to fetch
        },
        function (status, response) {
            if (status.error === false) {
                let lastColorMessage = response.messages[0].entry[CHANNEL_KEY_COLOR];
                let lastDuckName = response.messages[0].entry[CHANNEL_KEY_DUCKNAME];
                let timet = response.messages[0].timetoken;
                updateDuckColor(lastColorMessage, lastDuckName, timet);
                logReceivedMessage(response.messages, "color history");
            } else {
                console.log("Error recieving " + CHANNEL_NAME_COLOR + " channel history:");
                console.log(status);
            }
        }
    );
    pubnub.history(
        {
            channel: CHANNEL_NAME_TALK,
            count: 1, // how many items to fetch
        },
        function (status, response) {
            if (status.error === false) {
                let lastTalkMessage = response.messages[0].entry[CHANNEL_KEY_TEXT];
                let lastDuckName = response.messages[0].entry[CHANNEL_KEY_DUCKNAME];
                let timet = response.messages[0].timetoken;
                updateDuckTalk(lastTalkMessage, lastDuckName, timet);
                logReceivedMessage(response.messages, "talk history");
            } else {
                console.log("Error recieving " + CHANNEL_NAME_TALK + " channel history:");
                console.log(status);
            }
        }
    );
}

function processPresenceEvent(message) {
    var occupancy = message.occupancy;
    if (occupancy && occupancy > -1) {
        updateConnectedDuckCount(occupancy);
        logReceivedMessage(message, "a presence update");
    }   
}

function processReceivedMessage(envelope) {
    logReceivedMessage(envelope, "a message");
    if (envelope.channel === CHANNEL_NAME_COLOR) {
        updateDuckColor(envelope.message[CHANNEL_KEY_COLOR], envelope.message[CHANNEL_KEY_DUCKNAME], envelope.timetoken);
    } else if (envelope.channel === CHANNEL_NAME_TALK) {
        updateDuckTalk(envelope.message[CHANNEL_KEY_TEXT], envelope.message[CHANNEL_KEY_DUCKNAME], envelope.timetoken);
    } else if (envelope.channel === CHANNEL_NAME_DANCE) {
        danceTheDuck(envelope.message[CHANNEL_KEY_DANCE], envelope.timetoken);
    }
}

/* Sending messages */
function handleButtonClick(e) {
    let dataType = e.getAttribute("data-type");
    let dataText = e.getAttribute("data-text");
    if (dataType === CHANNEL_KEY_TEXT) {
        sendMessageToPubNub(CHANNEL_NAME_TALK, CHANNEL_KEY_TEXT, dataText);
    } else if (dataType === CHANNEL_KEY_COLOR) {
        sendMessageToPubNub(CHANNEL_NAME_COLOR, CHANNEL_KEY_COLOR, dataText);
   }
}

function handleCustomTextMessageSend(e) {
    let ducksChatInput = document.getElementById("js-overlay-text-chat-input");
    sendMessageToPubNub(CHANNEL_NAME_TALK, CHANNEL_KEY_TEXT, ducksChatInput.value);
    ducksChatInput.value = "";
    hideLogOverlay();
}

function handleCustomColorMessageSend(e) {
    let ducksColorInput = document.getElementById("js-overlay-color-change-input");
    sendMessageToPubNub(CHANNEL_NAME_COLOR, CHANNEL_KEY_COLOR, ducksColorInput.value);
    ducksColorInput.value = "#ff0000";
    hideLogOverlay();
}

function sendMessageToPubNub (channelName, contentKey, content ) {
    let msgToSend = {
        channel: channelName,
        message: {
            [contentKey]: content,
            [CHANNEL_KEY_DUCKNAME]: generatedDuckName,
        }
    };
    pubnub.publish(msgToSend, function (status, response) {
        if (status.error) {
            updateDuckStatus("There was an error sending your message.");
            setTimeout(function(){ updateDuckStatus(""); }, 5000);
        } else {
            logSentMessage(msgToSend, "a message to the '" + channelName + "' channel");
        }
    });
}

/* 
 *Display functions 
 */
function showChangeInterface() {
    updateDuckStatus("");
    document.getElementById("js-buttons-area").hidden = false;
}

function hideChangeInterface() {
    updateDuckStatus("");
    document.getElementById("js-buttons-area").hidden = true;
}

function updateConnectedDuckCount(duckCount) {
    if (duckCount === 1) {
        updateDuckMetaConnectedDucks(duckCount + " connected duck (that's probably you).");
    } else if (duckCount > -1) {
        updateDuckMetaConnectedDucks(duckCount + " connected ducks.");
    } else {
        updateDuckMetaConnectedDucks("");
    }
}

function updateDuckStatus(statusMessage) {
    let ducksStatusArea = document.getElementById("js-duck-status");
    ducksStatusArea.innerHTML = "<p>" + statusMessage + "</p>";
}

function updateDuckMetaName(name) {
    let metaColor = document.getElementById("js-duck-meta-part__name");
    metaColor.innerHTML = "🌐 Your handle is <b>" + name + "</b>.";
}

function updateDuckMetaConnectedDucks(statusMessage) {
    let connectedDucks = document.getElementById("js-duck-meta-part__count");
    connectedDucks.innerHTML = "🦆 " + statusMessage;
}

function updateDuckColor(color, publisher, timetoken) {
    let allTheDuck = document.getElementsByClassName('js-pirate-duck');
    Array.prototype.forEach.call(allTheDuck, function(el){
        el.setAttribute('style', 'fill: ' + color) ;
    });
    updateDuckMetaColor(color, publisher, timetoken);
}

function updateDuckMetaColor(color, publisher, timetoken) {
    if (publisher === generatedDuckName) {
        publisher = "you";
    }
    let metaColor = document.getElementById("js-duck-meta-part__color");
    let time = " ";
    if (timetoken) {
        let timed = new Date((timetoken/10000000)*1000);
        time = "at <span class='meta-time'>" + timed.toLocaleTimeString() + "</span> ";
    }
   metaColor.innerHTML = "🖍️ Last color change " + time + "by <b>" + publisher +"</b>: "  + color;
}

function updateDuckTalk(speech, publisher, timetoken) {
    if (publisher === generatedDuckName) {
        publisher = "you";
    }
    let duckSpeechWho = document.getElementById("js-duck-speech__who");
    duckSpeechWho.innerHTML = publisher + " ";
    let duckSpeechWhat = document.getElementById("js-duck-speech__what");
    duckSpeechWhat.innerHTML = speech;
    
    let duckSpeechWhen = document.getElementById("js-duck-speech__when");
    if (timetoken) {
        let timed = new Date((timetoken/10000000)*1000);
        duckSpeechWhen.innerHTML = timed.toLocaleTimeString();
    } else {
        duckSpeechWhen.innerHTML = "";
    }
    updateDuckMetaTalk(speech, publisher, timetoken);
}

function updateDuckMetaTalk(talk, publisher, timetoken) {
    let metaTalk = document.getElementById("js-duck-meta-part__talk");
    let time = " ";
    if (timetoken) {
        let timed = new Date((timetoken/10000000)*1000);
        time = "at <span class='meta-time'>" + timed.toLocaleTimeString() + "</span> ";
    }
    metaTalk.innerHTML = "💬 Last chat message " + time + "by <b>" + publisher + "</b>: <i>" + talk + "</i>";
}

function danceTheDuck(danceSyle, timetoken) {
    let partToDance = document.getElementById("js-pirate-duck");
    if (danceSyle === "lightSpeedOut") {
        partToDance = document.getElementById("js-pirate-duck__flag");
    }
    partToDance.classList.add('animated', danceSyle, 'slow');
    function handleAnimationEnd() {
        partToDance.classList.remove('animated', danceSyle, 'slow');
        partToDance.removeEventListener('animationend', handleAnimationEnd);
        updateDuckMetaDance(danceSyle, false, timetoken);
    }
    partToDance.addEventListener('animationend', handleAnimationEnd);
    updateDuckMetaDance(danceSyle, true), timetoken;
}

function updateDuckMetaDance(danceSyle, currentlyDancing, timetoken) {
    let timed = new Date((timetoken/10000000)*1000);
    let message = "⏩ At "+ timed.toLocaleTimeString() + " we did a " + danceSyle + " dance.";
    if (currentlyDancing) {
        message = "⏩ We are doing a " + danceSyle + " dance because someone found the right button combo.";
    }
    let metaDance = document.getElementById("js-duck-meta-part__dance");
    metaDance.innerHTML = message;
}

/* Logging functions */
function logSentMessage(sentJson, messageType) {   
    logMessage("Sent", messageType, sentJson);
}

function logReceivedMessage(recievedJson, messageType) {
    logMessage("Received", messageType, recievedJson);
}

function logMessage(sentOrRecieved, messageType, theJson) {
    let nowish = new Date();
    let message = sentOrRecieved + " " + messageType + " @ " + nowish.toLocaleTimeString() + ":\r" + JSON.stringify(theJson, null, 2) + "\r\r";
    loggedMessages.unshift(message);
    if (loggedMessages.length > LOG_LIMIT) {
        loggedMessages.length = LOG_LIMIT;
    }
}

function showLogOverlay () {
    document.getElementById('js-accessory-overlay').style.display = "block";
    document.getElementById("js-message-log-area__text-area").value = loggedMessages.join('\n');
    document.getElementById("js-message-log-area").style.display = "block";
}

function showTextInputOverlay () {
    document.getElementById('js-accessory-overlay').style.display = "block";
    document.getElementById("js-overlay-text-chat").style.display = "block";
}

function showColorInputOverlay () {
    document.getElementById('js-accessory-overlay').style.display = "block";
    document.getElementById("js-overlay-color-change").style.display = "block";
}

function hideLogOverlay () {
    document.getElementById('js-accessory-overlay').style.display = "none";
    document.getElementById("js-overlay-text-chat").style.display = "none";
    document.getElementById("js-overlay-color-change").style.display = "none";
    document.getElementById("js-message-log-area").style.display = "none";
}

