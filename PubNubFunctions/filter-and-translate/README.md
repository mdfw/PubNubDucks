PubNub Pirate Duck Demo - Filter and Translate Function
============

A demonstration [PubNub "before publish or fire" function](https://www.pubnub.com/docs/blocks/function-types?devrel_gh=pirate-duck-demo) that:

* Filters out an instance of "woof" and changes it to "quack"
* Translates incoming messages to morse code

## Installation
1. Visit the PubNub adminstration screen and click the "Functions" button on the left.
2. Select your application.
3. Create a Module (could be called "ducks", but it does not affect functionality) if it does not exist otherwise.
4. Create a Function. 
    * Function name: _you can choose, I called it "Pre-filter messages"
    * Event Type: `"Before Publish or Fire"`
    * Channel name: `ducks.talk` - note that this should match the prefix for the key `CHANNEL_NAME_TALK` in `pubnub-keys.js`. 
5. Click create to create the function.
6. Paste in the code from function-prefilter.js into the editor.
7. Click Save on the left.
8. Click "Start module" or "Restart module" in the upper right.
9. Test by sending a "Woof!" message. It should be now changed to "Quack!"

## Note
If any of the `CHANNEL_NAME_…` keys are changed in `pubnub-keys.js`, the same changes should be made to the keys in this function.

---
## Credits
Pirate Duck Chat is maintained by Mark Williams

---
## License
MIT