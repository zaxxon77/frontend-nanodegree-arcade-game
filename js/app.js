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
}

Player.prototype.update = function() {
    // update player location based on keyboard input and 
    // limit movement to gameboard
    // TODO: link limits to gameboard creation of row/col
    this.handleInput = function(keyCode){
        // Check for pause input and handle
        if (keyCode === 'p' && !this.paused) {this.paused = true; return;};
        if (keyCode === 'p' && this.paused) {this.paused = false; return;};
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

var Collision = function(x,y) {
    this.x = x *101;
    this.y = (y * 83);
    this.sprite = 'images/BloodSplat1.png';
}

// Draw the collision on the screen
Collision.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
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



// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'space',
        80: 'p'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
