/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    var paused = false;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    reload();

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    };

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset(); // initialize and set up gameplay
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        
        // Don't update if game paused 
        if (!player.paused && player.lives>0 ) {updateEntities(dt);};

        // Check for collisions between player and enemies
        checkCollisions();
        checkGemCollect();

        if (player.gemsLeft === 0) {checkBackToBlock()};

        if (player.resetGame) {reset();};
    }

    // This function is called by update() to see if the player has collided
    // with any enemies.
    // Note: player size may be variable, find an appropriate collision area
    function checkCollisions() {
        allEnemies.forEach(function(enemy) {
            if (enemy.y === player.y-7 
                && (enemy.x >= player.x-70 && enemy.x <= player.x+70)) {
                // set collision location
                collision.x = player.x-50;
                collision.y = player.y-20;

                player.lives = player.lives - 1;
                reset();
            };
        });
    }

    // This function checks to see if player has overlapped with or collected a gem
    function checkGemCollect() {
        allGems.forEach(function(gem) {
            if (gem.y === player.y-17 
                && (gem.x >= player.x-70 && gem.x <= player.x+70)) {
                // move gem off screen
                gem.x = -1000;
                gem.y = -1000;

                player.score = player.score + gem.worth;
                player.gemsLeft--;
            };
        });
    }

    function checkBackToBlock() {
        if (player.x === (2*101) && player.y === (5*83-13)) {reset();};
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }
        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */

     // Pay attention to order of rendering to make sure layers appear correct
    function renderEntities() {
 
        collision.render();

        // Loop through all Gem objects
        allGems.forEach(function(gem) {
            gem.render();
        });

        // Magic block appears once all gems are collected
        if (player.gemsLeft === 0) {renderMagicBlock()};

        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();

        // textRender(); // call text display function in app.js

        // Display PAUSED to screen
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

    // Render Magic Block for level advance
    function renderMagicBlock() {
        ctx.drawImage(Resources.get('images/Selector.png'), 2 * 101, 5 * 83-40);
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {    
        // reset player position to bottom middle of screen
        player.x = 2 * 101;
        player.y = 5 * 83 - 13;

        // Reset overall game after game over state
        if (player.resetGame === true) {
            player.score = 0;
            player.paused = false;
            player.resetGame = false;
            player.lives = 3;
            player.gems = 2;

            // reset enemies
            allEnemies.forEach(function(enemy) {
                enemy.x = 0;
                enemy.y = (Math.floor((Math.random() * 3) + 1) * 83) - 20;
            });

            // reset collisions, move collision off the screen
            collision.x = -1000;
            collision.y = -1000;
            
            allGems.forEach(function(gem) {
                gem.reset();
            }); 

            init();
        };

        // Advance level if gems are collected 
        if (player.gemsLeft === 0) {
            player.level++;
            player.gemsLeft = 2;

            // reset collisions, move collision off the screen
            collision.x = -1000;
            collision.y = -1000;

            allGems.forEach(function(gem) {
                gem.reset();
            }); 

            allEnemies.forEach(function(enemy) {
                enemy.x = 0;
                enemy.y = (Math.floor((Math.random() * 3) + 1) * 83) - 20;
            });

            init();
        }
    }


    function reload() {
        /* Go ahead and load all of the images we know we're going to need to
         * draw our game level. Then set init as the callback method, so that when
         * all of these images are properly loaded our game will start.
         */
        Resources.load([
            'images/stone-block.png',
            'images/water-block.png',
            'images/grass-block.png',
            'images/enemy-bug.png',
            'images/char-boy.png',
            'images/BloodSplat1.png',
            'images/Gem-Orange.png',
            'images/Gem-Green.png',
            'images/Gem-Blue.png',
            'images/Heart.png',
            'images/Selector.png'
        ]);
        Resources.onReady(init);
    }

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
