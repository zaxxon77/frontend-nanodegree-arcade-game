// Player class - most game objects are defined through player instantiation, since
// there's only 1 player in the game
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
    this.hasStarPower = false;
    this.highScore = 0;
    this.highScoreSoundPlayed = false;

    // Preload audio samples
    this.jump = new Audio('sounds/jump_short.wav'); //http://soundbible.com/1601-Mario-Jumping.html http://mp3cut.net/
    this.jump1 = new Audio('sounds/jump_short1.wav'); //http://soundbible.com/1601-Mario-Jumping.html
    this.jump2 = new Audio('sounds/jump_short2.wav'); //http://soundbible.com/1601-Mario-Jumping.html
    this.jump3 = new Audio('sounds/jump_short3.wav'); //http://soundbible.com/1601-Mario-Jumping.html
    this.jumpArray = [this.jump,this.jump1,this.jump2,this.jump3];//this.splat = new Audio('audio/splat.wav');
    this.splat = new Audio('sounds/splat.wav'); //http://soundbible.com/1733-Spit-Splat.html
    this.levelUp = new Audio('sounds/levelUp.wav'); //http://soundbible.com/1636-Power-Up-Ray.html
    this.pauseSound = new Audio('sounds/smb_pause.wav'); //http://themushroomkingdom.net/sounds/wav/smb/smb_pause.wav
    this.wallBump = new Audio('sounds/wallBump.wav'); //http://themushroomkingdom.net/sounds/wav/smb/smb_bump.wav
    this.highScoreSound = new Audio('sounds/high_score.wav'); //http://themushroomkingdom.net/sounds/wav/sm64/sm64_high_score.wav
    this.gemSound = [];
    this.gemSoundCnt = 0;
    for (var i = 1; i <= 10; i++) {
        var strCoin = 'sounds/coin';
        this.gemSound[i-1] = new Audio(strCoin.concat(i,'.wav')); //
    }
    this.invincibleSound = new Audio('sounds/invincible.wav') //http://www.digitpress.com/dpsoundz/crystalcastles.wav
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
            }
            return;
        }

        // Check for pause input and handle
        if (keyCode === 'p' && !this.paused) {
            this.paused = true; 
            this.pauseSound.play();
            if (player.hasStarPower) {player.invincibleSound.pause()};
            return;
        }
        if (keyCode === 'p' && this.paused) {
            this.paused = false; 
            this.pauseSound.play();
            if (player.hasStarPower) {player.invincibleSound.play()};
            return;
        }

        // Change player position based on keyboard, limit movement to board dimensions
        if (!this.paused) {
            // Play wall bump sound if player trying to be moved off board
            // Needs to be checked before actually moved to square
            if (keyCode === 'left' && this.x===0) {this.wallBump.play()};  
            if (keyCode === 'up' && this.y===-13) {this.wallBump.play()};  
            if (keyCode === 'right' && this.x===(4*101)) {this.wallBump.play()};  
            if (keyCode === 'down' && this.y===(5*83-13)) {this.wallBump.play()};           

            this.jumpArray[1, 2, 3, 0] =  this.jumpArray[0, 1, 2, 3];
            if (keyCode === 'left' && this.x>1) {this.x = this.x - 101;this.jumpArray[0].play()};
            if (keyCode === 'up' && this.y>1) {this.y = this.y - 83;this.jumpArray[0].play()};
            if (keyCode === 'right' && this.x<(4*101)) {this.x = this.x + 101;this.jumpArray[0].play()};
            if (keyCode === 'down' && this.y<(5*83-13)) {this.y = this.y + 83;this.jumpArray[0].play()};           
        }
    };
}

// Draw the player on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Enemies our player must avoid
var Enemy = function(x,y,speed) {
    // Variables applied to each of our instances go here
    this.x = x * 101;
    this.y = (y * 83) - 20;
    this.speed = speed * 100;
    this.sprite = 'images/enemy-bug.png';
    this.isAThreat = true;
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers. Introduce speed variable.
    this.x = this.x+(this.speed*dt);

    // check to see if enemy has travelled off screen and 
    // handle appropriately (try different methods)
    // 1. overflow to next stone line
    // 2. reset on same line
    // 3. randomize which line it shows up on next << this one!
    if (this.x>5*101 && this.speed>0) {
        this.x = -101;
        this.y = (getRandom(3,1) * 83) - 20;
    }
    if (this.x<-101 && this.speed<0) {
        this.x = 6*101;
        this.y = (getRandom(3,1) * 83) - 20;
    }
}

// Draw the enemy on the screen, flip and translate image if
// bug is travelling in right-to-left direction
// Also, render with a flicker if star is collected
Enemy.prototype.render = function() {
    ctx.save();
    if (this.isAThreat === false) {ctx.globalAlpha = 0.5*Math.sin(this.x)}
    if (this.speed < 0) {
        ctx.scale(-1,1); 
        ctx.drawImage(Resources.get(this.sprite), -this.x-101, this.y);
    } else {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
    ctx.restore();

}

// Restart enemy offscreen and at random row, reset isAThreat
Enemy.prototype.reset = function() {
    if (this.speed > 0) {
        this.x = -101;
    } else {
        this.x = 6*101;
    }
    this.y = (getRandom(3,1) * 83) - 20;
    this.isAThreat = true;
}

// Create Collision class for running into enemies & drawing splat image
var Collision = function(x,y) {
    this.x = x *101;
    this.y = y * 83;
    this.sprite = 'images/BloodSplat1.png';
}

// Draw the collision on the screen
Collision.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}
            
// Reset collisions, move collision off the screen
Collision.prototype.reset = function() {
    this.x = -1000;
    this.y = -1000;
}

// Render Magic Block for level advance - this is not a class since 
// it always appears in the same spot and there's only 1 occurance
function renderMagicBlock() {
    ctx.drawImage(Resources.get('images/Selector.png'), 1 * 101, 5 * 83-40);
}

// Create Star class
var Star = function(x,y) {
    this.x = x *101;
    this.y = (y * 83)-10;
    this.sprite = 'images/Star.png';
}

// Draw the star on the screen
Star.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Star.prototype.reset = function() {
    this.x = getRandom(4,0) * 101;
    this.y = (getRandom(4,1) * 83)-10;
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
    this.cnt = 0;
}

// Functinalize gem values to set appropriate value when random color is drawn
// TODO: consider changing this to a prototype function
function getGemValue(gem) {
    if (gem.color === 'Orange') {gem.worth = 50};
    if (gem.color === 'Green') {gem.worth = 100};
    if (gem.color === 'Blue') {gem.worth = 200};
    return gem.worth;
}

// Draw the gem on the screen - remove gem fade 
Gem.prototype.render = function() {
//    ctx.save();
//    this.cnt++
//    ctx.globalAlpha = Math.cos(this.cnt/30);
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
//    ctx.restore();
}

// Reset gems on screen and assign appropriate value based on color
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

// Return a random integer over the range lowerlimit to upperlimit
function getRandom(upperlimit,lowerlimit) {
    return Math.floor((Math.random() * ((upperlimit+1)-lowerlimit)) + lowerlimit);
}


//  Instantiate objects --------------------------------------------------------
var player = new Player(2,5);
var collision = new Collision(-10,-10);
var allGemColors = ['Orange', 'Green', 'Blue'];
var star = new Star(getRandom(4,0),getRandom(4,1));
var gem1 = new Gem(getRandom(4,0),getRandom(4,1),allGemColors[getRandom(2,0)]);
var gem2 = new Gem(getRandom(4,0),getRandom(4,1),allGemColors[getRandom(2,0)]);
var allGems = [gem1, gem2]; 
// Sort gems by row so they render properly
allGems.sort(function(a,b){
    return a.y - b.y;
})

// Functionalize instantiation of enemy object,
// randomize attributes of enemy and scale with player.level
function createNewEnemy(allEnemies) {
    var speedScale = Math.sqrt((player.level+1)*0.8); 
    console.log(speedScale);
    speedScale = Math.min(speedScale, 2.5); // upper limit to speed
    var direction = Math.round(Math.random());
    // probaby some more concise logic for this, but hey it works 
    if (direction === 0) {
        direction = -1;
        var startSquare = 5;
    } else {
        var startSquare = -1;
    };

    // instantiate new enemy and concatenate to array
    var newEnemy = new Enemy(startSquare,getRandom(3,1),direction*speedScale);
    allEnemies = allEnemies.concat(newEnemy);

    return allEnemies;
}


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

// Text render function writes text to screen, no doubt
// Consider creating subfuctions in text rendering
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
    var str1 = 'LEVEL  '
    var str2 = player.level.toString();
    var levelString = str1.concat(str2);
    ctx.fillText(levelString, canvas.width-20, canvas.height-30);
    ctx.strokeStyle = "black";
    ctx.strokeText(levelString, canvas.width-20, canvas.height-30);


    // Display Player Score
    ctx.font = "24pt Impact";
    ctx.lineWidth = 2;
    ctx.textAlign="end";
    ctx.fillStyle = "white";
    var str1 = 'SCORE  ';
    var str2 = player.score.toString();
    var scoreString = str1.concat(str2);
    ctx.fillText(scoreString, canvas.width-20, 80);
    ctx.strokeStyle = "black";
    ctx.strokeText(scoreString, canvas.width-20, 80);

    // Display Highscore
    ctx.textAlign="start";
    var str3 = 'HIGHSCORE  ';
    var str4 = player.highScore.toString();
    var scoreString = str3.concat(str4);
    ctx.fillText(scoreString, 20, 80);
    ctx.strokeStyle = "black";
    ctx.strokeText(scoreString, 20, 80);

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

        // DIsplay New Highscore if achieved
        if (player.score >= player.highScore) {
            ctx.fillStyle = "white";
            ctx.fillText('NEW HIGHSCORE!!!', canvas.width/2, (canvas.height/2 - 70));
            ctx.strokeStyle = "black";
            ctx.strokeText('NEW HIGHSCORE!!!', canvas.width/2, (canvas.height/2 - 70));
            if (player.highScoreSoundPlayed === false) {
                player.highScoreSound.play();        
                player.highScoreSoundPlayed = true;
            }
        }
    }
}




