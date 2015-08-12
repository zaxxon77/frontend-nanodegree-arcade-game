// Enemies our player must avoid
var Enemy = function(x,y,speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.x = x * 101;
    this.y = (y * 83) - 20;
    this.speed = speed * 100;

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = this.x+(this.speed*dt);

    // check to see if enemy has travelled off screen and 
    // handle appropriately (try different methods)
    // 1. overflow to next stone line
    // 2. reset on same line
    // 3. randomize which line it shows up on next << this one!
    if (this.x>5*101) {
        this.x = -101
        this.y = (Math.floor((Math.random() * 3) + 1) * 83) - 20;
    };
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

var Player = function(x,y) {
    this.x = x * 101;
    this.y = (y * 83) - 13;
    this.sprite = 'images/char-boy.png';
    this.paused = false;
    this.lives = 3;
    this.score = 0;
    this.resetGame = false;
    this.gemsLeft = 2;
    this.level = 0;
}

Player.prototype.update = function() {
    // update player location based on keyboard input and 
    // limit movement to gameboard
    // TODO: link limits to gameboard creation of row/col
    this.handleInput = function(keyCode){
        // Pause game at game over, only listen for reset 'r' key after that
        if (this.lives === 0) {
            this.paused = true;
            if (keyCode === 'r') {
                this.resetGame = true;
            };
            return;
        };

        // Check for pause input and handle
        if (keyCode === 'p' && !this.paused) {this.paused = true; return;};
        if (keyCode === 'p' && this.paused) {this.paused = false; return;};

        // Change player position based on keyboard, limit movement to board dimensions
        if (!this.paused) {
            if (keyCode === 'left' && this.x>1) {this.x = this.x - 101;};
            if (keyCode === 'up' && this.y>1) {this.y = this.y - 83;};
            if (keyCode === 'right' && this.x<(4*101)) {this.x = this.x + 101;};
            if (keyCode === 'down' && this.y<(5*83-13)) {this.y = this.y + 83;};           
        };
    };
}

// Draw the player on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Create Collision class
var Collision = function(x,y) {
    this.x = x *101;
    this.y = y * 83;
    this.sprite = 'images/BloodSplat1.png';
}

// Draw the collision on the screen
Collision.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Create Gem class
var Gem = function(x,y,color) {
    this.x = x * 101;
    this.y = (y * 83)-30;
    var str1 = 'images/Gem-';
    this.color = color;
    var str3 = '.png';
    this.sprite =  str1.concat(this.color,str3);
    // set value of gem based on color
    this.worth = getGemValue(this);
}

// Functinalize gem values to set appropriate value when random color is drawn
// TODO: consider changing this to a prototype function
function getGemValue(gem) {
    if (gem.color === 'Orange') {gem.worth = 50};
    if (gem.color === 'Green') {gem.worth = 100};
    if (gem.color === 'Blue') {gem.worth = 200};
    return gem.worth;
}

// Draw the gem on the screen
Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// consider creating reset prototype for each class
Gem.prototype.reset = function() {
    this.x = getRandom(4,0) * 101;
    this.y = (getRandom(4,1) * 83)-30;
    var str1 = 'images/Gem-';
    this.color = allGemColors[getRandom(2,0)];
    var str3 = '.png';
    this.sprite =  str1.concat(this.color,str3);
    this.worth = getGemValue(this);
    console.log('this color', this.color, ' color', this.worth);
}


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

// TODO: Modify number & speed of enemies based on level
var enemy1 = new Enemy(0,1,1);
var enemy2 = new Enemy(0,2,2);
var allEnemies = [enemy1, enemy2];

var player = new Player(2,5);

var collision = new Collision(-10,-10);

// Return a random integer over the range lowerlimit to upperlimit
function getRandom(upperlimit,lowerlimit) {
    return Math.floor((Math.random() * ((upperlimit+1)-lowerlimit)) + lowerlimit);
}

var allGemColors = ['Orange', 'Green', 'Blue'];
var gem1 = new Gem(getRandom(4,0),getRandom(4,1),allGemColors[getRandom(2,0)]);
var gem2 = new Gem(getRandom(4,0),getRandom(4,1),allGemColors[getRandom(2,0)]);
var allGems = [gem1, gem2]; // consider sorting gems by row so they render properly


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'space',
        80: 'p',
        82: 'r'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
