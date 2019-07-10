/*
    PubNub Functions Pirate Duck Bot
    Copyright 2019, Mark D. F. Williams, All rights reserved

    Part of the PubNub Pirate Duck Chat Demo project. 
    

*/

/** 
 * Creates a name for a pirate duck based on a random selection from a array of first names.
 * @return string A name for a duck
 */
function randomName() {
    let names = ["Felicita","Jason","Tom","Andrea","Adria","Elaina","Thea","Patsy","Johnette","Allison","Sabina","Lashon","Marlana","Elly","Rosa","Gerard","Autumn","Hobert","Lan","Emmanuel","Virgil","Dolores","Curtis","Veta","Mayra","Denny","Clementine","Yelena","Ty","Odilia","Shonta","Chet","Eden","Gigi","Keira","Synthia","Leslee","Donella","Tiffany","Brittny","Emma","Jacinda","Susy","Hedy","Barbra","Mora","Chu","Merrilee","Andra","Andree","Linda","Altagracia","Wendell","Laurene","Mireille","Claudine","Izola","Nikia","Fredric","Lovella","Antione","Leena","Jerrica","Dominque","Franchesca","Vanessa","Bobbie","Argelia","Jammie","Tamekia","Oretha","Krysta","Aurore","Temeka","Willie","Charlesetta","Lucien","Henriette","Hye","Shan","Maritza","Cinthia","Wanetta","Katelynn","Refugio","Isa","Charlott","Stanton","Susann","Ruthe","Jada","Andrea","Ella","Concepcion","Naida","Jonnie","Loretta","Noemi","Han","Parthenia","Zelda","Maida","Joey","Sudie","Wade","Efrain","Johnsie","Tonette","Jann","Casimira","Corrin","Nicki","Germaine","Roselyn","Rosella","Pam","Gala","Ling","Yael","Josh","Marlon","Chong","Belen","Nickolas","Earline","Salena","Venice","Latisha","Karla","Delphine","Mable"]

    var randName = names[Math.floor(Math.random() * names.length)];
    return  "Dred Duck " + randName; 
}

/**
 * Sets the message to publish on two buttons.
 * Two of the 3 text publish buttons are randomized from 9 possible messages. This function sets the button data- attributes from 2 random messages.
 * @return nil
 */
function setMessagesOnButtons() {
    let msgs = randomMessages(2);
    let button1 = document.getElementById("js-button__publish-text--1");
    button1.setAttribute("data-text", msgs[0].fullText);
    button1.innerHTML = msgs[0].buttonText;
    let button2 = document.getElementById("js-button__publish-text--2");
    button2.setAttribute("data-text", msgs[1].fullText);
    button2.innerHTML = msgs[1].buttonText;
}

/**
 * Returns the specified number of messages from all possible (9) messages.
 * @param number The number of messages.
 * @warning Not sure what happens if number is larger than total messages.
 * @return array Array of message objects. Each object has .buttonText and .fullText parameters.
 */
function randomMessages(number) {
    const allMessages = [{buttonText: "Down!",
        fullText: "Down with the Geese!"},
        {buttonText: "Quack…?",
        fullText: "If I quack like a duck, am I a duck?"},
        {buttonText: "Ducky…",
        fullText: "Duckie was robbed!"},
        {buttonText: "Strait…",
        fullText: "Messier 11 and strait on 'til morning."},
        {buttonText: "Ugly?",
        fullText: "Ugly Duckling? The swans wish they could be so cool."},
        {buttonText: "Betrayal",
        fullText: "A friend may betray you, but a duck will always stay the same."},
        {buttonText: "Where…",
        fullText: "Where there is a pond, there are Pirate Ducks."},
        {buttonText: "Shiver",
        fullText: "Shiver me tail feathers!"},
        {buttonText: "Good night",
        fullText: "Good night, Duckies. Good work. Sleep well. I'll most likely kill you in the morning."},
    ]
    return getRandomElements(allMessages, number);
}

/**
 * Returns a random array of number from a larger array.
 * @param {*} sourceArray The source array
 * @param {*} neededElements How many elements are needed from the array.
 * @return array
 */
var getRandomElements = function(sourceArray, neededElements) {
    var result = [];
    for (var i = 0; i < neededElements; i++) {
    var index = Math.floor(Math.random() * sourceArray.length);
        result.push(sourceArray[index]);
        sourceArray.splice(index, 1);
    }
    return result;
}