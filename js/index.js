/*
    Core JS functions for Pirate Duck Chat interface.
    Copyright 2019, Mark D. F. Williams, All rights reserved

    Part of the PubNub Pirate Duck Chat Demo project. 
    
*/

let pubnub = null;
let generatedDuckName = "Duck";

/**
 * Core function that sets up everything.
 */
$(document).ready(function(){   
    /**
     * The next 4 lines set up a name for this session, gives two buttons a random message to send,
     *   and sets a loading message.
     */
    setMessagesOnButtons();  // in randomduckdata.js
    generatedDuckName = randomName(); // in randomduckdata.js
    updateDuckMetaName(generatedDuckName);
    updateDuckStatus("Loading and subscribing to the " + CHANNEL_NAME_COLOR + " and " + CHANNEL_NAME_TALK + " channels.");

    /** 
     * Use a PubNub function to simulate extra ducks if needed. Function can be found in PubNubFunctions/duck-bots
     */
    if (USE_DUCK_BOTS) {
        startCloudDucks();
    }

    /**
     * Sets up a connection to the PubNub service. 
     * Keys are aquired by signing up for the PubNub service (http://pubnub.com)
     * ssl - defaults to true, but we'll be specific here.
     * uuid - This is the identifier used by presence and publish systems to identify this unit.
     *        For this demo, we will use our randomly generated duck name. However, PubNub best 
     *        practice is to use a UUID and separately manage user names through other means. 
     */
    pubnub = new PubNub({
        subscribeKey: PUBNUB_SUBSCRIBE_K,
        publishKey: PUBNUB_PUBLISH_K,
        ssl: true,
        uuid: generatedDuckName,
    })

    /**
     * After setting up a connection, add a listener for any messages that may be sent from PubNub.
     * There are currently 3 types of messages we are interested in:
     *   * status: Network up/down, connection changes, etc. Listen for these to update UI.
     *   * message: Messages that are sent from PubNub, normally in response to a
     *        Publish event somewhere on the network.
     *   * presence: Messages related to an entity joining or leaving subscribed channels (see below).
     */
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

    /**
     * Subscribe to channels. Best practice is to bundle subscribe events when possible
     *   as it reduces network connections. In this case, the color channel has a separate 
     *   subscription to also gain presence information. The color and dance channels are 
     *   'side channels' and thus don't need separate presence. If they were different 
     *   'rooms', separate presence may be needed.
     */
    pubnub.subscribe({
        channels: [CHANNEL_NAME_TALK],
        withPresence: true, 
    });
    pubnub.subscribe({
        channels: [CHANNEL_NAME_COLOR, CHANNEL_NAME_DANCE],
        withPresence: false,
    });
});

/* -------------------------- */
/* ---- PubNub functions ---- */

/**
 * Process status events.
 * This function does not handle the exhaustive list of status events. See documentation for others.
 *   This shows how an application may handle these events.
 *   If connection is offline, do not show sending options.
 *   When a connection is made, make a request for history and an update to the current 
 *     presence information (hereNow).
 * @param {*} statusEvent 
 */
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

/**
 * Requests a count of the current entities attached to the talk channel. 
 * Does not request UUIDS as the interface does not currently show a list of connected ducks.
 * Does not request state as that information is not used. Could be used for typing indicators or away state.
 */
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

/**
 * Processes the hereNow message. Pulls out totalOccupancy and passes it to update the 
 *   duck count message and logs the message.
 * @param {*} message 
 */
function processHereNowResponse(message) {
    var totalOccupants = message.totalOccupancy;
    if (totalOccupants && totalOccupants > -1) {
        updateConnectedDuckCount(totalOccupants);
        logReceivedMessage(message, "a hereNow (presence) update");
    }
}

/**
 * Requests current history, first from the color channel, then the talk channel.
 * On receipt, sends it to the appropriate update functions and to the log.
 */
function requestHistory() {
    pubnub.history(
        {
            channel: CHANNEL_NAME_COLOR,
            count: 1, // how many items to fetch. For this demo, we only need the last item.
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
            count: 1, // how many items to fetch. For this demo, we only need the last item.
        },
        function (status, response) {
            // Response returns messages in an array (even if request.count == 1)
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

/**
 * Process a presense event sent by PubNub. Normally happens when an entity joins or leaves
 *   a subscribed channel. There is some effeciency logic that affects what UUIDs are sent. 
 *   This demo does not list currrently connected UUIDs so that information is not processed.
 * @param {*} message 
 */
function processPresenceEvent(message) {
    var occupancy = message.occupancy;
    if (occupancy && occupancy > -1) {
        updateConnectedDuckCount(occupancy);
        logReceivedMessage(message, "a presence update");
    }   
}

/**
 * Process recieved messages. First, log the message, then send to appropriate UI handlers.
 * @param {*} envelope 
 */
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

/* ------------------------ */
/* --- Sending messages --- */

/**
 * Send a message based on a butotn press. The data to send is stored as attributes on 
 *   each button (makes the demo easier).
 * @param {*} e 
 */
function handleButtonClick(e) {
    let dataType = e.getAttribute("data-type");
    let dataText = e.getAttribute("data-text");
    if (dataType === CHANNEL_KEY_TEXT) {
        sendMessageToPubNub(CHANNEL_NAME_TALK, CHANNEL_KEY_TEXT, dataText);
    } else if (dataType === CHANNEL_KEY_COLOR) {
        sendMessageToPubNub(CHANNEL_NAME_COLOR, CHANNEL_KEY_COLOR, dataText);
   }
}

/**
 * There is a way to send a custom messages (not using the buttons)  
 *   by clicking the "message" or "color change" text. 
 *   The next two functions handle those message requests.
 * @param {*} e 
 */
function handleCustomTextMessageSend(e) {
    let ducksChatInput = document.getElementById("js-overlay-text-chat-input");
    sendMessageToPubNub(CHANNEL_NAME_TALK, CHANNEL_KEY_TEXT, ducksChatInput.value);
    ducksChatInput.value = "";
    hideLogOverlay();
}

function handleCustomColorMessageSend(e) {
    let ducksColorInput = document.getElementById("js-overlay-color-change-input");
    sendMessageToPubNub(CHANNEL_NAME_COLOR, CHANNEL_KEY_COLOR, ducksColorInput.value);
    ducksColorInput.value = "#ff0000"; // Reset to a standard value.
    hideLogOverlay();
}

/**
 * Send a message to pubnub. Takes the channel, contentKey and content.
 * @param {*} channelName 
 * @param {*} contentKey 
 * @param {*} content 
 */
function sendMessageToPubNub (channelName, contentKey, content ) {
    let msgToSend = {
        channel: channelName,
        message: {
            [contentKey]: content,
            [CHANNEL_KEY_DUCKNAME]: generatedDuckName, // Not technically required, but aids with history calls.
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

/**
 * Call .history() on the talk channel and display it in an overlay.
 */
function requestChatHistory () {
    showChatHistoryOverlay();
    pubnub.history(
        {
            channel: CHANNEL_NAME_TALK,
            count: 20, // how many items to fetch.
        },
        function (status, response) {
            if (status.error === false) {
                updateChatHistory(response.messages);
            } else {
                console.log("Error recieving " + CHANNEL_NAME_TALK + " channel history:");
                console.log(status);
            }
        }
    );

}
/* ------------------------- */
/* --- Display functions --- */

/**
 * Show the buttons, etc. allowing content to be sent. 
 */
function showChangeInterface() {
    updateDuckStatus("");
    document.getElementById("js-buttons-area").hidden = false;
}

/**
 * Hide the buttons, etc. Normally because our connection went away. 
 */
function hideChangeInterface() {
    updateDuckStatus("");
    document.getElementById("js-buttons-area").hidden = true;
}

/**
 * Updates the count of connected ducks. Normally called either from presence or hereNow handlers (above).
 * @param {*} duckCount 
 */
function updateConnectedDuckCount(duckCount) {
    if (USE_CLOUD_DUCK_BOTS) {
        duckCount = duckCount + CLOUD_DUCK_BOT_COUNT;
    }
    if (duckCount === 1) {
        updateDuckMetaConnectedDucks(duckCount + " connected duck (that's probably you).");
    } else if (duckCount > -1) {
        updateDuckMetaConnectedDucks(duckCount + " connected ducks.");
    } else {
        updateDuckMetaConnectedDucks("");
    }
}

/**
 * The status area is general information, normally connection status or errors.
 * @param {*} statusMessage 
 */
function updateDuckStatus(statusMessage) {
    let ducksStatusArea = document.getElementById("js-duck-status");
    ducksStatusArea.innerHTML = "<p>" + statusMessage + "</p>";
}

/**
 * Updates the name in the "meta" section at the bottom.
 * @param {*} name 
 */
function updateDuckMetaName(name) {
    let metaColor = document.getElementById("js-duck-meta-part__name");
    metaColor.innerHTML = "🌐 Your handle is <b>" + name + "</b>.";
}

/**
 * Fills in the number of connected ducks in the meta area.
 * @param {*} statusMessage 
 */
function updateDuckMetaConnectedDucks(statusMessage) {
    let connectedDucks = document.getElementById("js-duck-meta-part__count");
    connectedDucks.innerHTML = "🦆 " + statusMessage;
}

/**
 * Updates the duck color first, then calls the updateMetaColor function.
 * All 'colorable' areas of the duck are tagged with 'js-pirate-duck'.
 * Publisher and timetoken are not used here but are passed through.
 * @param {*} color 
 * @param {*} publisher 
 * @param {*} timetoken 
 */
function updateDuckColor(color, publisher, timetoken) {
    let allTheDuck = document.getElementsByClassName('js-pirate-duck');
    Array.prototype.forEach.call(allTheDuck, function(el){
        el.setAttribute('style', 'fill: ' + color) ;
    });
    updateDuckMetaColor(color, publisher, timetoken);
}

/**
 * Update the color message in the Meta area
 * @param {*} color 
 * @param {*} publisher 
 * @param {*} timetoken 
 */
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

/**
 * Update the duck's speech. Then calls updateDuckMetaTalk
 * @param {*} speech 
 * @param {*} publisher 
 * @param {*} timetoken 
 */
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

/**
 * Update the duck meta talk area.
 * @param {*} talk 
 * @param {*} publisher 
 * @param {*} timetoken 
 */
function updateDuckMetaTalk(talk, publisher, timetoken) {
    let metaTalk = document.getElementById("js-duck-meta-part__talk");
    let time = " ";
    if (timetoken) {
        let timed = new Date((timetoken/10000000)*1000);
        time = "at <span class='meta-time'>" + timed.toLocaleTimeString() + "</span> ";
    }
    metaTalk.innerHTML = "💬 Last chat message " + time + "by <b>" + publisher + "</b>: <i>" + talk + "</i>";
}

/**
 * Make the duck dance. The danceStyle should be a call that animate.css understands. 
 * If the danceStyle is lightSpeedOut, only the flag is used.
 * @param {*} danceSyle 
 * @param {*} timetoken 
 */
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

/**
 * Update the last duck dance in the meta area.
 * @param {*} danceSyle 
 * @param {*} currentlyDancing 
 * @param {*} timetoken 
 */
function updateDuckMetaDance(danceSyle, currentlyDancing, timetoken) {
    let timed = new Date((timetoken/10000000)*1000);
    let message = "⏩ At "+ timed.toLocaleTimeString() + " we did a " + danceSyle + " dance.";
    if (currentlyDancing) {
        message = "⏩ We are doing a " + danceSyle + " dance because someone found the right button combo.";
    }
    let metaDance = document.getElementById("js-duck-meta-part__dance");
    metaDance.innerHTML = message;
}

/* -------------------- */
/* --- Chat history --- */

/**
 * Display a series of chat messages.
 * @param {*} messages 
 */
function updateChatHistory(messages) {
    messages.forEach(function(element) {
        let msgTable = document.getElementById("js-chat-history-area__table");
        let newRow = msgTable.insertRow(0);
        let clonableCell = document.getElementById("js-hidden-chat-history-table-td");
        let newCell = clonableCell.cloneNode(true);
        newCell.id = "";
        let duckSpeechWho = newCell.getElementsByClassName("duck-chat-history__who")[0];
        duckSpeechWho.innerHTML = element.entry.duckName;
        let duckSpeechWhat = newCell.getElementsByClassName("duck-chat-history__what")[0];
        duckSpeechWhat.innerHTML = element.entry.text;
        let duckSpeechWhen = newCell.getElementsByClassName("duck-chat-history__when")[0];
        let timetoken = element.timetoken;
        if (timetoken) {
            let timed = new Date((timetoken/10000000)*1000);
            duckSpeechWhen.innerHTML = timed.toLocaleTimeString();
        } else {
            duckSpeechWhen.innerHTML = "";
        }
        newRow.appendChild(newCell);
    });

}

/* ------------------------- */
/* --- Logging functions --- */
function logSentMessage(sentJson, messageType) {   
    logMessage("Sent", messageType, sentJson);
}

function logReceivedMessage(recievedJson, messageType) {
    logMessage("Received", messageType, recievedJson);
}

function logMessage(sentOrRecieved, messageType, theJson) {
    let nowish = new Date();
    let message = sentOrRecieved + " " + messageType + " @ " + nowish.toLocaleTimeString() + ":\r" + JSON.stringify(theJson, null, 2) + "\r\r";

    let msgTable = document.getElementById("js-message-log-area__table");
    let newRow = msgTable.insertRow(0);
    var newCell = newRow.insertCell(0);
    newCell.innerHTML = "<pre>" + message + "</pre>";

    var rows = msgTable.getElementsByTagName("tr")
    if (rows.length > LOG_LIMIT) {
        msgTable.deleteRow(-1);
    }
}

/* -------------------------------------- */
/* --- showing and hiding the overlay --- */

/**
 * Shows the PubNub log in an overlay window.
 */
function showLogOverlay () {
    document.getElementById('js-accessory-overlay').style.display = "block";
    document.getElementById("js-message-log-area").style.display = "block";
}

/**
 * Shows the chat history in response to the history call in an overlay.
 */
function showChatHistoryOverlay () {
    document.getElementById('js-accessory-overlay').style.display = "block";
    document.getElementById("js-chat-history-area").style.display = "block";
}

/**
 * Shows a custom text input in the overlay.
 */
function showTextInputOverlay () {
    document.getElementById('js-accessory-overlay').style.display = "block";
    document.getElementById("js-overlay-text-chat").style.display = "block";
}

/**
 * Shows a custom color input in the overlay.
 */
function showColorInputOverlay () {
    document.getElementById('js-accessory-overlay').style.display = "block";
    document.getElementById("js-overlay-color-change").style.display = "block";
}

/**
 * Hide the overlay and all the sub-areas that can show up in the overlay.
 */
function hideLogOverlay () {
    document.getElementById('js-accessory-overlay').style.display = "none";
    document.getElementById("js-overlay-text-chat").style.display = "none";
    document.getElementById("js-overlay-color-change").style.display = "none";
    document.getElementById("js-message-log-area").style.display = "none";
    document.getElementById("js-chat-history-area").style.display = "none";
}

/* ----------------- */
/* --- Duck bots --- */

/**
 * An option to pretend there are other ducks participating in chat.
 * Uses a PubNub Function to send a new random color or text message 
 *   when a ping is received on the bots.ducks channel.
 * Why? This is used as a demo app and it's nice for demo apps to 
 *   look like there's activity.
 */
let cloudDuckInterval = null;
function startCloudDucks () {
    cloudDuckInterval = setInterval(function() {
        sendMessageToPubNub (CHANNEL_NAME_DUCK_BOTS, "send:", "now" );
    }, CLOUD_DUCK_PING_INTERVAL);
}

/**
 * Stops cloud duck calls.
 */
function stopCloudDucks () {
    clearInterval(cloudDuckInterval);
}