For this, we will excersize the following aspects of PubNub's real-time infrastructure:
* Subscribing to, sending and receiving messages on 2 different channels for signalling realtime text and color changes (3 as part of making the ducks dance)
* HereNow and Presence functionality to get the number of connected ducks
* History functionality for updating state when reconnecting
* Dealing with network failures and timeouts
* "Before Publish" PubNub Function to simulate bad word filtering (Separate article: "title")
* "On Request" API Endpoint style PubNub Function to allow us to interact with the pirate duck army from Slack (Separate article: "title")
* "After Publish" PubNub Function and KV Store to track recent actions and react by making the ducks dance and wiggle. (Separate article: "title")
* How to make an arduino duck respond