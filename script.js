/* ================================================================================================================ */
/* initialization */
/* ================================================================================================================ */

// Global variables
const gameBoard = document.getElementById('gameBoard');
const gridSize = 8;
const maxFlips = 3;
let isPlayerOneTurn = true; // This will toggle between turns
let gameStarted = false; // Flag to check if the initial move has been made
let gameEnded = false; // Flag to check if the game has ended
let playerOneColor = document.getElementById('playerOneColorPicker').value;
let playerTwoColor = document.getElementById('playerTwoColorPicker').value;
let defaultTileColor = getComputedStyle(document.documentElement).getPropertyValue('--default-tile-color');
let obstacleColor = getComputedStyle(document.documentElement).getPropertyValue('--obstacle-color');
let playerOneObstaclesRemaining = 3;
let playerTwoObstaclesRemaining = 3;


// Event listeners for player color selectors
addColorChangeEventListener('playerOneColorPicker', 'player-one', '--player-one-color');
addColorChangeEventListener('playerTwoColorPicker', 'player-two', '--player-two-color');

addClickEventListener('playerOneColorTile', 'playerOneColorPicker')
addClickEventListener('playerTwoColorTile', 'playerTwoColorPicker')
// addColorChangeEventListener('playerOne');
// addColorChangeEventListener('playerTwo');


function createBoard(size) {
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    for (let i = 0; i < size * size; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile', 'default-color');
        setBackgroundColor(tile, defaultTileColor); // Set initial background color
        tile.flipsRemaining = maxFlips; // Initialize flip tracking

        // TODO: (not needed?) Create and append flip indicator on load/refresh
        // const flipIndicator = createAndUpdateFlipIndicator(tile, tile.flipsRemaining);

        // Create selectors for player one, player two, and obstacles
        addSelector(tile, 'color-one-selector', 'player-one');
        addSelector(tile, 'color-two-selector', 'player-two');
        addSelector(tile, 'obstacle-selector', 'obstacle');

        // Add click event listener to the tile
        tile.addEventListener('click', () => {
            flipTile(tile, tile.className.split(' ')[1]);
        });

        gameBoard.appendChild(tile);
    }
}

function addSelector(tile, selectorClass, newClass) {
    const selector = document.createElement('div');
    selector.classList.add('selector', selectorClass);
    selector.addEventListener('click', (e) => {
        e.stopPropagation();
        flipTile(tile, newClass);
    });
    tile.appendChild(selector);
}

function flipTile(tile, newClass) {
    if (tile.flipsRemaining === 0) {return;} // tile is locked - do not flip
    if (tile.classList.contains('obstacle') || newClass === 'default-color') return;

    addClass(tile, 'flipped');

    const animationDuration = 400;
    setTimeout(() => {
        applyTileColor(tile, newClass);

        tile.flipsRemaining--;
        createAndUpdateFlipIndicator(tile, tile.flipsRemaining);

        if (tile.flipsRemaining === 0) {
             // TODO: lock icon not needed? when tile has reached maxFlips? cleaner UI w/o it
            // addLockedIcon(tile);
            tile.style.transform = 'none';
            tile.style.cursor = 'default';
        }
    }, animationDuration / 2);

    setTimeout(() => {
        removeClass(tile, 'flipped');
    }, animationDuration);
}

function createAndUpdateFlipIndicator(tile, flipsRemaining) {
    if (flipsRemaining < 0) {flipsRemaining = 0;} // Prevent negative flipsRemaining

    let indicatorContainer = tile.querySelector('.flip-indicator-container');

    // If the container doesn't exist, create it
    if (!indicatorContainer) {
        indicatorContainer = document.createElement('div');
        indicatorContainer.classList.add('flip-indicator-container');
        tile.appendChild(indicatorContainer);
    } else if (flipsRemaining === 0 || tile.classList.contains('obstacle')) {
        indicatorContainer.style.display = 'none';
    }

    // Clear existing flip indicators
    indicatorContainer.innerHTML = '';

    // Create new flip indicators based on flipsRemaining
    for (let i = 0; i < flipsRemaining; i++) {
        const circle = document.createElement('span');
        circle.classList.add('flip-indicator');
        indicatorContainer.appendChild(circle);
    }
}

function addLockedIcon(tile) {
    if (tile.flipsRemaining === 0 || tile.classList.contains('obstacle')) {
        const lockIcon = document.createElement('div');
        lockIcon.classList.add('lock-icon');
        lockIcon.textContent = 'X'; // 🔒
        tile.appendChild(lockIcon);
        tile.classList.add('locked');
        lockIcon.style.display = 'block'; // Show the icon
    }
}

function applyTileColor(tile, newClass) {
    if (newClass === 'obstacle') {
        addClass(tile, 'obstacle');
        addLockedIcon(tile);
        removeClass(tile, 'default-color');
        setBackgroundColor(tile, obstacleColor);
    } else if (newClass === 'player-one' || newClass === 'player-two') {
        removeClass(tile, 'default-color');
        setBackgroundColor(tile, newClass === 'player-one' ? playerOneColor : playerTwoColor);
        tile.className =`tile ${newClass}`;
    } else {
        // Toggle the tile color if it's already been flipped
        if (tile.classList.contains('player-one')) {
            setBackgroundColor(tile, playerTwoColor);
            replaceClass(tile, 'player-one', 'player-two');
        } else if (tile.classList.contains('player-two')) {
            setBackgroundColor(tile, playerOneColor);
            replaceClass(tile, 'player-two', 'player-one');
        }
    }
}

createBoard(gridSize);






/* ================================================================================================================ */
/* helper functions */
/* ================================================================================================================ */

// Element utilities
function addClass(element, className) {
    element.classList.add(className);
}
function removeClass(element, className) {
    element.classList.remove(className);
}
function replaceClass(element, oldClass, newClass) {
    element.classList.replace(oldClass, newClass);
}
function setBackgroundColor(element, color) {
    element.style.backgroundColor = color;
}

// Player color selection utilities
function addClickEventListener(listenElement, clickElement) {
    document.getElementById(listenElement).addEventListener('click', function() {
        document.getElementById(clickElement).click()});
}
function addColorChangeEventListener(colorPickerId, className, colorVar) {
    document.getElementById(colorPickerId).addEventListener('change', function() {
        const newColor = this.value;
        updatePlayerTilesColor(className, newColor);
        document.documentElement.style.setProperty(colorVar, newColor);
        if (colorPickerId === 'playerOneColorPicker') {
            playerOneColor = newColor;
        } else if (colorPickerId === 'playerTwoColorPicker') {
            playerTwoColor = newColor;
        }
    });
}

function updatePlayerTilesColor(playerClass, color) {
    const tiles = document.querySelectorAll('.tile.' + playerClass);
    tiles.forEach(tile => {
        setBackgroundColor(tile, color);
    });
}
