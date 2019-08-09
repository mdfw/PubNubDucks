// ##############
// -- Replace:
    /**
     * Connect to PubNub
     */
// ++ With:
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

// ##############
// -- Replace:
     /**
      * Add PubNub Listener
      */
// ++ With:
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
        message: function(messageEvent) {
            processReceivedMessage(messageEvent);
        }
    })

// ##############
// -- Replace:
    /**
     * Suscribe to channels
     */
// ++ With:
    /**
     * Subscribe to channels. Best practice is to bundle subscribe events when possible
     *   as it reduces network connections.
     */
    pubnub.subscribe({
        channels: [CHANNEL_NAME_TALK],
    });

// ##############
// -- Replace:
/**
 * Process status events
 */
// ++ With:
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
    }
}


// ##############
// -- Replace:
/**
 * Process a received message.
 */
// ++ With:
/**
 * Process received messages. First, log the message, then send to appropriate UI handlers.
 * @param {*} envelope 
 */
function processReceivedMessage(envelope) {
    logReceivedMessage(envelope, "a message");
    if (envelope.channel === CHANNEL_NAME_TALK) {
        updateDuckTalk(envelope.message[CHANNEL_KEY_TEXT], envelope.message[CHANNEL_KEY_DUCKNAME], envelope.timetoken);
    }
}