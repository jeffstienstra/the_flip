/* ================================================================================================================ */
/* initialization */
/* ================================================================================================================ */

// Global variables
const gameBoard = document.getElementById('gameBoard');
const gridSize = 8;
const maxFlips = 3;
// let isPlayerOneTurn = true; // This will toggle between turns
// let gameStarted = false; // Flag to check if the initial move has been made
// let gameEnded = false; // Flag to check if the game has ended
let playerOneColor = document.getElementById('playerOneColorPicker').value;
let playerTwoColor = document.getElementById('playerTwoColorPicker').value;
let defaultTileColor = getComputedStyle(document.documentElement).getPropertyValue('--default-tile-color');
let obstacleColor = getComputedStyle(document.documentElement).getPropertyValue('--obstacle-color');
let playerOneObstaclesRemaining = 3;
let playerTwoObstaclesRemaining = 3;
const belongsToEnum = {
    DEFAULT: 'default-color',
    PLAYER_ONE: 'player-one',
    PLAYER_TWO: 'player-two',
    OBSTACLE: 'obstacle'
}
const { DEFAULT, PLAYER_ONE, PLAYER_TWO, OBSTACLE } = belongsToEnum;

// Event listeners for player color selectors
addColorChangeEventListener('playerOneColorPicker', 'player-one', '--player-one-color');
addColorChangeEventListener('playerTwoColorPicker', 'player-two', '--player-two-color');

addClickEventListener('playerOneColorTile', 'playerOneColorPicker')
addClickEventListener('playerTwoColorTile', 'playerTwoColorPicker')

function createBoard(size) {
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    for (let i = 0; i < size * size; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile', DEFAULT);
        setBackgroundColor(tile, defaultTileColor); // Set initial background color
        tile.flipsRemaining = maxFlips; // Initialize flip tracking
        tile.belongsTo = DEFAULT; // Initialize tile ownership

        // Create selectors for player one, player two, and obstacles
        addColorSelector(tile, 'color-one-selector', PLAYER_ONE);
        addColorSelector(tile, 'color-two-selector', PLAYER_TWO);
        addColorSelector(tile, 'obstacle-selector', OBSTACLE);

        // Create and append flip indicator container only, prevents null reference errors when flipping tiles
        const indicatorContainer = document.createElement('div');
        indicatorContainer.classList.add('flip-indicator-container');
        tile.appendChild(indicatorContainer);
        indicatorContainer.style.display = 'none';

        // Add click event listener to the tile
        tile.addEventListener('click', () => {
            flipTile(tile, tile.belongsTo);
        });

        gameBoard.appendChild(tile);
    }
}

function flipTile(tile, newOwner) {
    if (tile.classList.contains(OBSTACLE) || newOwner === DEFAULT) return;
    if (tile.flipsRemaining === 0) return;

    let newClass;
    if (tile.belongsTo === DEFAULT) {
        // handle initial flip
        removeClass(tile, DEFAULT);
        newClass = newOwner;
        tile.belongsTo = newOwner;
    } else {
        // toggle between players
        newClass = (tile.belongsTo === PLAYER_ONE) ? PLAYER_TWO : PLAYER_ONE;
        removeClass(tile, tile.belongsTo);
        tile.belongsTo = newClass;
    }

    replaceClass(tile, tile.belongsTo, newClass);
    animateTileFlip(tile);
}

createBoard(gridSize);






/* ================================================================================================================ */
/* helper functions */
/* ================================================================================================================ */

// DOM Element utilities
function addClass(element, className) {
    element.classList.add(className);
}
function removeClass(element, className) {
    element.classList.remove(className);
}
function replaceClass(tile, oldClass, newClass) {
    tile.classList.remove(oldClass);
    tile.classList.add(newClass);
}
function setBackgroundColor(element, color) {
    element.style.backgroundColor = color;
}
function addClickEventListener(listenElement, clickElement) {
    document.getElementById(listenElement).addEventListener('click', function() {
        document.getElementById(clickElement).click()});
}
function addColorChangeEventListener(colorPickerId, className, colorVar) {
    document.getElementById(colorPickerId).addEventListener('change', function() {
        const newColor = this.value;
        updateColorOfAllPlayerTiles(className, newColor);
        document.documentElement.style.setProperty(colorVar, newColor);
        if (colorPickerId === 'playerOneColorPicker') {
            playerOneColor = newColor;
        } else if (colorPickerId === 'playerTwoColorPicker') {
            playerTwoColor = newColor;
        }
    });
}


// Player color handling
function addColorSelector(tile, selectorClass, newOwner) {
    const selector = document.createElement('div');
    selector.classList.add('selector', selectorClass);
    selector.addEventListener('click', (e) => {
        e.stopPropagation();
        flipTile(tile, newOwner);
    });
    tile.appendChild(selector);
}
function updateColorOfAllPlayerTiles(playerClass, color) {
    // select all tiles with the player class and update their background color
    const tiles = document.querySelectorAll(`.${playerClass}`);

    tiles.forEach(tile => {
        setBackgroundColor(tile, color);
    });
}
function applyColorToCurrentTile(tile, belongsTo) {
    if (tile.belongsTo === OBSTACLE) {
        removeClass(tile, DEFAULT);
        addClass(tile, OBSTACLE);
        // addLockedIcon(tile);
        setBackgroundColor(tile, obstacleColor);

        const indicatorContainer = tile.querySelector('.flip-indicator-container');
        indicatorContainer.style.display = 'none'; // Hide indicator container
    } else if (tile.belongsTo === PLAYER_ONE) {
        setBackgroundColor(tile, playerOneColor);
    } else if (tile.belongsTo === PLAYER_TWO) {
        setBackgroundColor(tile, playerTwoColor);
        }
}
function animateTileFlip(tile) {
    addClass(tile, 'flipped');

    const animationDuration = 400;
    setTimeout(() => {

        applyColorToCurrentTile(tile, tile.belongsTo);

        tile.flipsRemaining--;
        updateFlipIndicators(tile, tile.flipsRemaining);

        if (tile.flipsRemaining === 0) {
            tile.style.transform = 'none';
            tile.style.cursor = 'default';
        }
    }, animationDuration / 2);

    setTimeout(() => {
        removeClass(tile, 'flipped');
    }, animationDuration);
}

// Flip indicators
function createFlipIndicators(container, count) {
    container.innerHTML = ''; // Clear existing indicators

    for (let i = 0; i < count; i++) {
        const indicator = document.createElement('span');
        indicator.classList.add('flip-indicator');
        container.appendChild(indicator);
    }
}
function updateFlipIndicators(tile, flipsRemaining) {
    flipsRemaining = Math.max(flipsRemaining, 0); // Ensure flipsRemaining is not negative

    const indicatorContainer = tile.querySelector('.flip-indicator-container');

    if (flipsRemaining === 0 || tile.classList.contains('obstacle')) {
        indicatorContainer.style.display = 'none';
        return;
    }

    indicatorContainer.style.display = 'flex'; // Show indicators

    createFlipIndicators(indicatorContainer, flipsRemaining);
}






/* ================================================================================================================ */
/* unused functions */
/* ================================================================================================================ */

// function addLockedIcon(tile) {
//     if (tile.flipsRemaining === 0 || tile.classList.contains('obstacle')) {
//         const lockIcon = document.createElement('div');
//         lockIcon.classList.add('lock-icon');
//         lockIcon.textContent = 'X'; // 🔒
//         tile.appendChild(lockIcon);
//         tile.classList.add('locked');
//         lockIcon.style.display = 'block'; // Show the icon
//     }
// }
