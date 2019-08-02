PubNub Pirate Duck Demo
============

<p align="center">
<img src="readme_images/red_duck.png" width=128 height=100>
<h2>A PubNub Chat Demo using color changing, dancing, Pirate ducks. Arrr. </h2>
<img src="readme_images/pirate_duck_screen_shot.png">
</p>

## Features
- Multiple PubNub channels for chat, color changing, dancing and bot pirate integration.
- PubNub Presence functionality & HereNow requests to get the number of connected ducks.
- PubNub Storage & Playback (history) functionality for updating UI state when connecting and reconnecting. History also used to show recent messages in the chat channel on request.
- Handling PubNub network events.
- Using PubNub Functions for:
  - "Before Publish" function to simulate bad word filtering and translation.
  - "After Publish" function and PubNub's KV Store to track recent actions. With the correct set of actions, the functions sends a message that makes all of the ducks dance and wiggle.
  - "After Publish" function to simulate extra duck chat inhabitants.
- Built-in access to a log of recent incoming and outgoing PubNub messages to understand how changes happening in the interface are implemented.
- Use of aria-live sections to support better accessibility on chat changes.

## Demo
[Demo](https://mdfw.github.io/PubNubDucks/)

### Using the demo to talk about PubNub
The demo is specifically designed to be used in demo environments. Use the following as a guide.

<img src="readme_images/how-to-use-duck-chat-to-talk-about-pubnub.png" style="border:1px solid black;">


1. This is the latest message sent on the `ducks.talk` channel. Name, time and content are all represented.
2. The talk bubble opens an overlay and calls the `history` api for the last 20 messages in the `ducks.talk` channel.
3. The duck is always the latest color message sent in the `ducks.color` channel. Shows how a chat room can turn into a connected experience, easily adding functionality not normally found in standard 'chat' solutions. 
4. Send a message to the `ducks.talk` channel. Sends the message up to the PubNub service and then the application receives that message and shows it in `1.` and `10.`.
5. Clicking the `message` word opens an overlay to allow users to send custom messages to the `ducks.talk` channel.
6. Send a color message to the `ducks.color` channel. Sends the message up to the PubNub service. The application receives that message and shows it in `3.` and `11.`.
7. Clicking the `change color` words opens an overlay to allow users to send custom color messages to the `ducks.color` channel.
8. Using PubNub's presence service on the `ducks.talk` channel, the application knows how many other ducks are connected. 
9. Each instance of the application generates a random duck name every time it is loaded. This is used as the UUID when interacting with the PubNub API.
10. The last `ducks.talk` message is listed here. aria-polite is used to announce the text change when using screen readers.
11. The last `ducks.color` message is listed here. aria-polite is used to announce the color change when using screen readers.
12. The last dance, the last message sent on the `ducks.dance` channel is listed here.
13. Clicking the "Show PubNub message log" will show the last 30 messages sent to and recieved from the PubNub service, in realtime. Use this to show developers how the JSON payload is packaged and displayed to the interface.
14. `"Woof!"` is considered a bad word in the pirate duck language. As such, it is always changed to `"Quack!"` through a very simple "Before Publish" PubNub Function. Use this to describe how Functions can interact with the content flowing through the network.

In addition to all of that, there is an "After Publish" PubNub function that listens to all messages posted to `ducks.talk` and `ducks.color`. The last three messages are stored in the KV Store. If the three are matched against a 'magic set', the function sends a 'dance' message to the `ducks.dance` channel. The dance aligns to one of the animations from animate.css. The duck will dance in response. Try `Yellow`, `Red`, `Blue` or `"Quack!"`, `"Quack!"`,`"Quack!"`. The full set of magic sequences can be found in the `function-dance.js` file in [PubNubFunctions/duck-dance](https://github.com/mdfw/PubNubDucks/tree/master/PubNubFunctions/duck-dance).


<p align="center">
<video autoplay loop muted playsinline>
  <source src="readme_images/duckshake.mp4" type="video/mp4">
</video>
</p>

---
## Credits
Pirate Duck Chat is maintained by Mark Williams

---
## License

---
## Acknowledgements
* Uses ["Duck" by Nikita Kozin](https://thenounproject.com/icon/945625/) from the Noun Project 
* Uses ["Pirate" by Andrejs Kirma, LV](https://thenounproject.com/icon/1263137/) from the Noun Project
* Thanks to [animate.css](https://github.com/daneden/animate.css) by Daniel Eden for making it easy to make the ducks dance.
* Some True Type fonts are used from [Google Fonts](https://fonts.google.com).