/**
 * The keys to interact with the PubNub API. Receive them by signing up at https://pubnub.com
 */
const PUBNUB_PUBLISH_K = "pub-c-6ca085af-f8aa-403e-b48f-ae61b4d4aac4";
const PUBNUB_SUBSCRIBE_K = "sub-c-6ad2300c-c2ce-11e9-9d00-8a58a5558306";

const CHANNEL_KEY_TEXT = "text"; // The json key that all text on the CHANNEL_NAME_TALK is sent and recieved on.
const CHANNEL_KEY_COLOR = "color"; // The json key that all colors on the CHANNEL_NAME_COLOR are sent and recieved on.
const CHANNEL_KEY_DANCE = "style"; // The json key that all dance moves on the CHANNEL_NAME_DANCE are sent and recieved on.
const CHANNEL_KEY_DUCKNAME = 'duckName'; // The json key for the name of the duck (should be the same as UUID in this case).

/**
 * These channel names need to be aligned with channels in the functions. 
 */
const CHANNEL_NAME_COLOR = 'ducks.color'; // The name of the channel for the color changing ducks
const CHANNEL_NAME_TALK = 'ducks.talk'; // The name of the channel for the chat area for the ducks
const CHANNEL_NAME_DANCE = 'ducks.dance'; // The name of the channel for the dance

const LOG_LIMIT = 29; // The limit to the number of log items stored. Reduce to save memory.

/**
 * Duck bots pretends that there are more bots than currently connected devices. When USE_DUCK_BOTS is true, sends a small 
 *   message to CHANNEL_DUCK_BOTS every CLOUD_DUCK_PING_INTERVAL. 
 * To use, the duck-bots code must be installed into a function. See PubNubFunctions directory for more info.
 */
const USE_CLOUD_DUCK_BOTS = true;
const CHANNEL_NAME_DUCK_BOTS = 'bots.ducks'; // The name of the channel for the bots.
const CLOUD_DUCK_PING_INTERVAL = 30000;
const CLOUD_DUCK_BOT_COUNT = 3;
