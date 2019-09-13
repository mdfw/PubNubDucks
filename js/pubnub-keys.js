/**
 * The keys to interact with the PubNub API. Receive them by signing up at https://pubnub.com
 */
const PUBNUB_PUBLISH_K = "DEMO-PUBLISH-KEY";
const PUBNUB_SUBSCRIBE_K = "DEMO-SUBSCRIBE-KEY";

const CHANNEL_KEY_TEXT = "text"; // The json key that all text on the CHANNEL_NAME_TALK is sent and recieved on.
const CHANNEL_KEY_DUCKNAME = 'duckName'; // The json key for the name of the duck (should be the same as UUID in this case).

/**
 * These channel names need to be aligned with channels in the functions. 
 */
const CHANNEL_NAME_TALK = 'ducks.talk'; // The name of the channel for the chat area for the ducks

const LOG_LIMIT = 29; // The limit to the number of log items stored. Reduce to save memory.
