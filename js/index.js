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
    updateDuckStatus("Loading and subscribing to the " + CHANNEL_NAME_TALK + " channel.");

    /**
     * Connect to PubNub
     */
    
    /**
     * Add PubNub Listener
     */
 
    /**
     * Suscribe to channels
     */
});

/* -------------------------- */
/* ---- PubNub functions ---- */

/**
 * Process status events
 */

/**
 * Process a received message.
 */

/* ------------------------ */
/* --- Sending messages --- */

/**
 * Send a message based on a button press. The data to send is stored as attributes on 
 *   each button (makes the demo easier).
 * @param {*} e 
 */
function handleButtonClick(e) {
    let dataType = e.getAttribute("data-type");
    let dataText = e.getAttribute("data-text");
    if (dataType === CHANNEL_KEY_TEXT) {
        sendMessageToPubNub(CHANNEL_NAME_TALK, CHANNEL_KEY_TEXT, dataText);
    }
}

/**
 * There is a way to send a custom messages (not using the buttons)  
 *   by clicking the "message" text. 
 * @param {*} e 
 */
function handleCustomTextMessageSend(e) {
    let ducksChatInput = document.getElementById("js-overlay-text-chat-input");
    sendMessageToPubNub(CHANNEL_NAME_TALK, CHANNEL_KEY_TEXT, ducksChatInput.value);
    ducksChatInput.value = "";
    hideLogOverlay();
}

/**
 * Send a message to PubNub
 */

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
    let metaName = document.getElementById("js-duck-meta-part__name");
    metaName.innerHTML = "🌐 Your handle is <b>" + name + "</b>.";
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
 * Shows a custom text input in the overlay.
 */
function showTextInputOverlay () {
    document.getElementById('js-accessory-overlay').style.display = "block";
    document.getElementById("js-overlay-text-chat").style.display = "block";
}

/**
 * Hide the overlay and all the sub-areas that can show up in the overlay.
 */
function hideLogOverlay () {
    document.getElementById('js-accessory-overlay').style.display = "none";
    document.getElementById("js-overlay-text-chat").style.display = "none";
    document.getElementById("js-message-log-area").style.display = "none";
}
