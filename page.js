// ===================== Winter 2021 EECS 493 Assignment 2 =====================
// This starter code provides a structure and helper functions for implementing
// the game functionality. It is a suggestion meant to help you, and you are not
// required to use all parts of it. You can (and should) add additional functions
// as needed or change existing functions.

// ==============================================
// ============ Page Scoped Globals Here ========
// ==============================================

// Counters
let throwingItemIdx = 1;

// Size Constants
const FLOAT_1_WIDTH = 149;
const FLOAT_2_WIDTH = 101;
const FLOAT_SPEED = 2;
const PERSON_SPEED = 25;
const OBJECT_REFRESH_RATE = 50;  //ms
const SCORE_UNIT = 100;  // scoring is in 100-point units

// Size vars
let maxPersonPosX, maxPersonPosY;
let maxItemPosX;
let maxItemPosY;

// Global Window Handles (gwh__)
let gwhGame, gwhStatus, gwhScore;

// Global Object Handles
let player;
let paradeRoute;
let paradeFloat1;
let paradeFloat2;
let paradeTimer;

let count = 0;

/*
 * This is a handy little container trick: use objects as constants to collect
 * vals for easier (and more understandable) reference to later.
 */
const KEYS = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  shift: 16,
  spacebar: 32
};

let createThrowingItemIntervalHandle;
let currentThrowingFrequency = 2000;


// ==============================================
// ============ Functional Code Here ============
// ==============================================

// Main
$(document).ready( function() {
  console.log("Ready!");

  // TODO: Event handlers for the settings panel

  // TODO: Add a splash screen and delay starting the game

  // Set global handles (now that the page is loaded)
  // Allows us to quickly access parts of the DOM tree later
  gwhGame = $('#actualGame');
  gwhStatus = $('.status-window');
  gwhScore = $('#score-box');
  player = $('#player');  // set the global player handle
  paradeRoute = $("#paradeRoute");
  paradeFloat1 = $("#paradeFloat1");
  paradeFloat2 = $("#paradeFloat2");

  // Set global positions for thrown items
  maxItemPosX = $('.game-window').width() - 50;
  maxItemPosY = $('.game-window').height() - 40;

  // Set global positions for the player
  maxPersonPosX = $('.game-window').width() - player.width();
  maxPersonPosY = $('.game-window').height() - player.height();

  // Keypress event handler
  $(window).keydown(keydownRouter);
  var splashScreen = "<div id='splash' class='splash_screen'><h1>Mardi Gras Parade!</h1></div>";
  gwhGame.append(splashScreen);

  setTimeout(function() {
    $(splash).remove();
  }, 3000);
  
  // Periodically check for collisions with thrown items (instead of checking every position-update)
  setInterval( function() {
    checkCollisions();
  }, 100);

  // Move the parade floats

  setTimeout(function() {
    startParade();
    createThrowingItemIntervalHandle = setInterval(createThrowingItem, currentThrowingFrequency);
  }, 3000);

  document.getElementById("setting-button").addEventListener("click", openSetting);
  document.getElementById("save").addEventListener("click", save);
  document.getElementById("discard").addEventListener("click", discard);

  function openSetting(){
    document.getElementById("settings").style.display = "block";
    document.getElementById("setting-button").style.display = "none";
    document.getElementById("frequency").value = currentThrowingFrequency;

  }
  function save(){
    try{
      var newFrequency = parseInt(document.getElementById("frequency").value);
    }
    catch(err){
      alert(err);
    }
    if(newFrequency < 100){
      alert("Frequency must be greater than 100");
      return;
    }
    document.getElementById("settings").style.display = "none";
    document.getElementById("setting-button").style.display = "block";
    currentThrowingFrequency = newFrequency;
    clearTimeout(createThrowingItemIntervalHandle);
    createThrowingItemIntervalHandle = setInterval(createThrowingItem, newFrequency);
    console.log(currentThrowingFrequency);

  }
  function discard(){
    document.getElementById("settings").style.display = "none";
    document.getElementById("setting-button").style.display = "block";
    console.log(currentThrowingFrequency);

  }

  // Throw items onto the route at the specified frequency
});

// Key down event handler
// Check which key is pressed and call the associated function
function keydownRouter(e) {
  switch (e.which) {
    case KEYS.shift:
      break;
    case KEYS.spacebar:
      break;
    case KEYS.left:
    case KEYS.right:
    case KEYS.up:
    case KEYS.down:
      movePerson(e.which);
      break;
    default:
      console.log("Invalid input!");
  }
}

// Handle player movement events
// TODO: Stop the player from moving into the parade float. Only update if
// there won't be a collision
function movePerson(arrow) {
  
  switch (arrow) {
    case KEYS.left: { // left arrow
      let newPos = parseInt(player.css('left'))-PERSON_SPEED;
      if (newPos < 0) {
        newPos = 0;
      }
      if(willCollide(player, paradeFloat2, -40, 0)){
        newPos = parseInt(player.css('left'));
      }
      player.css('left', newPos);
      break;
    }
    case KEYS.right: { // right arrow
      let newPos = parseInt(player.css('left'))+PERSON_SPEED;
      if (newPos > maxPersonPosX) {
        newPos = maxPersonPosX;
      }
      if(willCollide(player, paradeFloat1, 40, 0)){
        newPos = parseInt(player.css('left'));
      }
      player.css('left', newPos);
      break;
    }
    case KEYS.up: { // up arrow
      let newPos = parseInt(player.css('top'))-PERSON_SPEED;
      if (newPos < 0) {
        newPos = 0;
      }
      if(willCollide(player, paradeFloat1, 0, -40) || willCollide(player, paradeFloat2, 0, -40)){
        newPos = parseInt(player.css('top'));
      }
      player.css('top', newPos);
      break;
    }
    case KEYS.down: { // down arrow
      let newPos = parseInt(player.css('top'))+PERSON_SPEED;
      if (newPos > maxPersonPosY) {
        newPos = maxPersonPosY;
      }
      if(willCollide(player, paradeFloat1, 0, 40) || willCollide(player, paradeFloat2, 0, 40)){
        newPos = parseInt(player.css('top'));
      }
      player.css('top', newPos);
      break;
    }
  }
}

// Check for any collisions with thrown items
// If needed, score and remove the appropriate item
function checkCollisions() {
  var items = document.getElementsByClassName("throwingItem");
  var score_box = document.getElementById("score-box");
  var candy = document.getElementById("candyCounter")
  var beads = document.getElementById("beadsCounter")
  for (let i = 0; i < items.length; i++) {
    if (isColliding(player, $(items[i]))) {
      var object = $(items[i]);
      if(items[i].classList.contains("active")){
        count++;
        items[i].classList.remove("active");
        var circle = "<div id = 'circle-" + count+"' class='circle'><h2>.</h2></div>"
        gwhGame.append(circle);
        var circle_object = $('#circle-' + count);
        var x = parseInt(object.css('left'))-35;
        var y = parseInt(object.css('top'))-260;
        circle_object.css('left', x);
        circle_object.css('top', y);
        graduallyFadeAndRemoveElement(circle_object);
        graduallyFadeAndRemoveElement(object);
        score_box.textContent = parseInt(score_box.textContent) + SCORE_UNIT;
        if(items[i].classList.contains("beads")){
          beads.textContent = parseInt(beads.textContent) + 1;
        }
        else{
          candy.textContent = parseInt(candy.textContent) + 1;
        }
        break;
      }
      else{
        break;
      }
    }
  }
}

// Move the parade floats (Unless they are about to collide with the player)
function startParade(){
  console.log("Starting parade...");
  paradeTimer = setInterval( function() {

      // TODO: (Depending on current position) update left value for each 
      // parade float, check for collision with player, etc.
      let newPos1 = 0;
      let newPos2 = 0;
      if(willCollide(paradeFloat2, player, 5, 0)){
        newPos1 = parseInt(paradeFloat1.css('left'));
        newPos2 = parseInt(paradeFloat2.css('left'));
      }
      else{
        newPos1 = parseInt(paradeFloat1.css('left'))+ 5;
        newPos2 = parseInt(paradeFloat2.css('left'))+ 5;
      }
      if(newPos1>maxPersonPosX+50){
        newPos1 = -300;
        newPos2 = -150;
      }
      paradeFloat1.css('left',newPos1);
      paradeFloat2.css('left',newPos2);

  }, OBJECT_REFRESH_RATE);
}

// Get random position to throw object to, create the item, begin throwing
function createThrowingItem(){

    var x = parseInt(paradeFloat2.css('left'));
    var type
    if(throwingItemIdx%3==0){
      type = "candy";
    }
    else{
      type = "beads";
    }
    var item = createItemDivString(throwingItemIdx, type, type + ".png");
    gwhGame.append(item);
    var object = $('#i-' + throwingItemIdx);
    object.css("left", x)
    object.css("top", 220)
    var destX = getRandomNumber(0, maxItemPosX) - x;
    var destY = getRandomNumber(0, maxItemPosY) - parseInt(object.css("top"));
    updateThrownItemPosition(object, destX/20, destY/20, 20)
    throwingItemIdx++;

}

// Helper function for creating items
// throwingItemIdx - index of the item (a unique identifier)
// type - beads or candy
// imageString - beads.png or candy.png
function createItemDivString(itemIndex, type, imageString){
  return "<div id='i-" + itemIndex + "' class='throwingItem active " + type + "'><img src='img/" + imageString + "'/></div>";
}

// Throw the item. Meant to be run recursively using setTimeout, decreasing the 
// number of iterationsLeft each time. You can also use your own implementation.
// If the item is at it's final postion, start removing it.
function updateThrownItemPosition(elementObj, xChange, yChange, iterationsLeft){
  if(iterationsLeft == 0){
    setTimeout(function() {
      graduallyFadeAndRemoveElement(elementObj);
    }, 5000); 
    return
  }
  else{
    var x = parseInt(elementObj.css('left'));
    var y = parseInt(elementObj.css('top'));
    var newX = x + xChange;
    var newY = y + yChange;
    elementObj.css("left", newX);
    elementObj.css("top", newY);
  }

  setTimeout(function(){
    updateThrownItemPosition(elementObj, xChange, yChange, iterationsLeft-1);
  }, 20);
  
}

function graduallyFadeAndRemoveElement(elementObj){
  // Fade to 0 opacity over 2 seconds
  elementObj.fadeTo(2000, 0, function(){
    $(this).remove();
  });
}

// ==============================================
// =========== Utility Functions Here ===========
// ==============================================

// Are two elements currently colliding?
function isColliding(o1, o2) {
  return isOrWillCollide(o1, o2, 0, 0);
}

// Will two elements collide soon?
// Input: Two elements, upcoming change in position for the moving element
function willCollide(o1, o2, o1_xChange, o1_yChange){
  return isOrWillCollide(o1, o2, o1_xChange, o1_yChange);
}

// Are two elements colliding or will they collide soon?
// Input: Two elements, upcoming change in position for the moving element
// Use example: isOrWillCollide(paradeFloat2, person, FLOAT_SPEED, 0)
function isOrWillCollide(o1, o2, o1_xChange, o1_yChange){
  const o1D = { 'left': o1.offset().left + o1_xChange,
        'right': o1.offset().left + o1.width() + o1_xChange,
        'top': o1.offset().top + o1_yChange,
        'bottom': o1.offset().top + o1.height() + o1_yChange
  };
  const o2D = { 'left': o2.offset().left,
        'right': o2.offset().left + o2.width(),
        'top': o2.offset().top,
        'bottom': o2.offset().top + o2.height()
  };
  // Adapted from https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  if (o1D.left < o2D.right &&
    o1D.right > o2D.left &&
    o1D.top < o2D.bottom &&
    o1D.bottom > o2D.top) {
     // collision detected!
     return true;
  }
  return false;
}

// Get random number between min and max integer
function getRandomNumber(min, max){
  return (Math.random() * (max - min)) + min;
}