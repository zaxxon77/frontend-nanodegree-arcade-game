// Enemies our player must avoid
var Enemy = function(x,y,speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.x = x * 101;
    this.y = (y * 83) - 20;
    this.speed = speed * 100;
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
    if (this.x>5*101 && this.speed>0) {
        this.x = -101;
        this.y = (getRandom(3,1) * 83) - 20;
    };
    if (this.x<-101 && this.speed<0) {
        this.x = 6*101;
        this.y = (getRandom(3,1) * 83) - 20;
    };
}

// Draw the enemy on the screen, flip and translate image if
// bug is travelling in right-to-left direction
Enemy.prototype.render = function() {
    ctx.save();
    if (this.speed < 0) {
        ctx.scale(-1,1); 
        ctx.drawImage(Resources.get(this.sprite), -this.x-101, this.y);
    } else {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };
    ctx.restore();

}

// Restart enemy offscreen and at random row
Enemy.prototype.restart = function() {
    if (this.speed > 0) {
        this.x = -101;
    } else {
        this.x = 6*101;
    };
    this.y = (getRandom(3,1) * 83) - 20;
}

// Player class
var Player = function(x,y) {
    this.x = x * 101;
    this.y = (y * 83) - 13;
    this.sprite = 'images/char-boy.png';
    this.paused = false;
    this.lives = 3;
    this.score = 0;
    this.gemsLeft = 2;
    this.level = 0;
    this.resetOnCollision = false;
    this.resetGame = false;
    this.resetOnLevelUp = false;
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
}


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var player = new Player(2,5);

// TODO: Modify number & speed of enemies based on level
// var enemy1 = new Enemy(0,1,1);
// var enemy2 = new Enemy(0,2,2);
// var allEnemies = [enemy1, enemy2];

function createNewEnemy(allEnemies) {
    // randomize attributes of enemy and scale with player.level
    var speedScale = Math.sqrt((player.level+1)*0.8); 
    console.log(speedScale);
    speedScale = Math.min(speedScale, 2.5); // upper limit to speed
    var startSide = Math.round(Math.random())*5;
    var direction = Math.round(Math.random());
    if (direction === 0) {direction = -1};

    // instantiate new enemy and concatinate to array
    var newEnemy = new Enemy(startSide,getRandom(3,1),direction*speedScale);
    allEnemies = allEnemies.concat(newEnemy);

    return allEnemies;
}


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

function textRender() {
    if (player.paused && player.lives > 0) {
        ctx.font = "36pt Impact";
        ctx.lineWidth = 3;
        ctx.textAlign="center";
        ctx.fillStyle = "white";
        ctx.fillText('- PAUSED -', canvas.width/2, canvas.height/2);
        ctx.strokeStyle = "black";
        ctx.strokeText('- PAUSED -', canvas.width/2, canvas.height/2);
    };

    // Display Lives
    ctx.font = "24pt Impact";
    ctx.lineWidth = 2;
    ctx.textAlign="start";
    ctx.fillStyle = "white";
    var str1 = 'LIFE  '
    var str2 = player.lives.toString();
    var lifeString = str1.concat(str2);
    ctx.fillText(lifeString, 20, canvas.height-30);
    ctx.strokeStyle = "black";
    ctx.strokeText(lifeString, 20, canvas.height-30);

    // Display Level
    ctx.font = "24pt Impact";
    ctx.lineWidth = 2;
    ctx.textAlign="end";
    ctx.fillStyle = "white";
    var str1 = 'Level  '
    var str2 = player.level.toString();
    var levelString = str1.concat(str2);
    ctx.fillText(levelString, canvas.width-20, canvas.height-30);
    ctx.strokeStyle = "black";
    ctx.strokeText(levelString, canvas.width-20, canvas.height-30);


    // Display Score
    ctx.font = "24pt Impact";
    ctx.lineWidth = 2;
    ctx.textAlign="end";
    ctx.fillStyle = "white";
    var str1 = 'SCORE  '
    var str2 = player.score.toString();
    var scoreString = str1.concat(str2);
    ctx.fillText(scoreString, canvas.width-20, 80);
    ctx.strokeStyle = "black";
    ctx.strokeText(scoreString, canvas.width-20, 80);

    // Display Game Over
    if (player.lives === 0) {
        ctx.font = "36pt Impact";
        ctx.lineWidth = 3;
        ctx.textAlign="center";
        ctx.fillStyle = "white";
        ctx.fillText('- GAME OVER -', canvas.width/2, canvas.height/2);
        ctx.strokeStyle = "black";
        ctx.strokeText('- GAME OVER -', canvas.width/2, canvas.height/2);
        ctx.fillStyle = "white";
        ctx.fillText('- REPLAY? (r) -', canvas.width/2, (canvas.height/2 + 50));
        ctx.strokeStyle = "black";
        ctx.strokeText('- REPLAY? (r) -', canvas.width/2, (canvas.height/2 + 50));
    };

}
