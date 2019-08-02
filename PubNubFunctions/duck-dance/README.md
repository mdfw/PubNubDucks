PubNub Pirate Duck Demo - Dancing ducks
============

A demonstration [PubNub "before publish or fire" function](https://www.pubnub.com/docs/blocks/function-types?devrel_gh=pirate-duck-demo) that uses the [KV Store](https://www.pubnub.com/docs/blocks/kvstore-module?devrel_gh=pirate-duck-demo) to store a specific sequence of actions. If a sequence matches a "magic" set, the function sends a dance message on the channel defined by `CHANNEL_NAME_DANCE` (default: `ducks.dance`). 

## Installation
1. Visit the PubNub adminstration screen and click the "Functions" button on the left.
2. Select your application.
3. Create a Module (could be called "ducks", but it does not affect functionality)
4. Create a Function. 
    * Function name: _you can choose, I called it "Make the Ducks dance"
    * Event Type: `"After Publish or Fire"`
    * Channel name: `ducks.*` - note that this should match the prefix for the keys `CHANNEL_NAME_COLOR` and `CHANNEL_NAME_TALK` in `pubnub-keys.js`. 
5. Click create to create the function.
6. Paste in the code from function-dance.js into the editor.
7. Click Save on the left.
8. Click "Start module" in the upper right.
9. Have fun making ducks dance. The defined steps are in an array with the key `DEFINED_SECRET_SETS`

## Note
If any of the `CHANNEL_NAME_…` keys are changed in `pubnub-keys.js`, the same changes should be made to the keys in this function.

---
## Credits
Pirate Duck Chat is maintained by Mark Williams

---
## License
