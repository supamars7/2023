let gameStarted = false;

import Grid from "./Grid.js"
import Tile from "./Tile.js"

const gameBoard = document.getElementById("game-board")

// Function to check if the waiting period has passed
function canPlayGame() {
    const lastPlayed = localStorage.getItem('lastPlayed');
    if (lastPlayed) {
        const currentTime = new Date().getTime();
        const timeSinceLastPlayed = currentTime - parseInt(lastPlayed, 10);
        const hoursSinceLastPlayed = timeSinceLastPlayed / (1000 * 60 * 60);

        // Allow play if 24 hours have passed
        if (hoursSinceLastPlayed >= 24) {
            return true;
        } else {
            // Calculate and return remaining hours
            const remainingHours = 24 - hoursSinceLastPlayed;
            return remainingHours;
        }
    }

    // If there's no record of lastPlayed, allow play
    return true;
}

// Function to start a new game
function startNewGame() {
    const currentTime = new Date().getTime();
    const lastPlayed = localStorage.getItem('lastPlayed');

    if (!gameStarted || (lastPlayed && (currentTime - lastPlayed) >= 24 * 60 * 60 * 1000)) {
        // Either the game hasn't started or the waiting period has passed
        if (canPlayGame() === true) {
            // Start the game
            // ... (Your game initialization code)

            // Record that the game has started
            gameStarted = true;

            // Record the current time
            localStorage.setItem('lastPlayed', currentTime);
        } else {
            const remainingHours = canPlayGame();
            showWaitingModal(remainingHours);
        }
    } else {
        const hoursLeft = Math.ceil((24 * 60 * 60 * 1000 - (currentTime - lastPlayed)) / (60 * 60 * 1000));
        showWaitingModal(hoursLeft);
    }
}


// Function to show the waiting modal
function showWaitingModal(remainingHours) {
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    const remainingHoursSpan = document.getElementById('remaining-hours');
    
    modal.style.display = 'block';
    remainingHoursSpan.textContent = remainingHours.toFixed(2);
    
    // Close the modal when the player clicks the "x" button
    const closeModalButton = document.getElementById('close-modal');
    closeModalButton.onclick = function () {
        modal.style.display = 'none';
    };
    
    // Close the modal when the player clicks outside of it
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}




const grid = new Grid(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
setupInput()

function setupInput() {
    window.addEventListener("keydown", handleInput, {once: true })
}

async function handleInput(e) {
    switch (e.key) {
        case "ArrowUp":
          if (!canMoveUp()) {
            setupInput()
            return
            }  
        await moveUp()
        break
        case "ArrowDown":
            if (!canMoveDown()) {
                setupInput()
                return
            }
        await moveDown()
        break
        case "ArrowLeft":
            if (!canMoveLeft()) {
                setupInput()
                return
            }
        await moveLeft()
        break
        case "ArrowRight":
            if (!canMoveRight()) {
                setupInput()
                return
            }
        await moveRight()
        break
        default:
            setupInput()
            return    
    }

    grid.cells.forEach(cell => cell.mergeTiles())

    const newTile = new Tile(gameBoard)
    grid.randomEmptyCell().tile = newTile

    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
        newTile.waitForTransition(true).then(() => {
            alert ("You lose")
        })
        return
    } 
    setupInput()

}

function moveUp() {
    return slideTiles(grid.cellsByColumn)
}

function moveDown() {
    return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))
}

function moveLeft() {
    return slideTiles(grid.cellsByRow)
}

function moveRight() {
    return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))
}

function slideTiles(cells) {
    return Promise.all(
    cells.flatMap(group => {
        const promises = []
        for (let i = 1; i < group.length; i++) {
            const cell = group[i]
            if (cell.tile == null) continue
            let lastValidCell
            for (let j = i - 1; j >= 0; j--) {
            const moveToCell = group[j]
            if (!moveToCell.canAccept(cell.tile)) break
            lastValidCell = moveToCell
            }

            if (lastValidCell != null) {
                promises.push(cell.tile.waitForTransition())
                if (lastValidCell.tile != null) {
                    lastValidCell.mergeTile = cell.tile
                } else {
                    lastValidCell.tile = cell.tile
                }
                cell.tile = null
            }
        }
        return promises
    }))
}

function canMoveUp() {
    return canMove(grid.cellsByColumn)
}

function canMoveDown() {
    return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}

function canMoveLeft() {
    return canMove(grid.cellsByRow)
}

function canMoveRight() {
    return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}

function canMove(cells) {
    return cells.some(group => {
        return group.some((cell, index) => {
            if (index === 0) return false
            if (cell.tile == null) return false
            const moveToCell = group[index -1]
            return moveToCell.canAccept(cell.tile)
        })
    })
}

// Call startNewGame when you want to initiate a new game
startNewGame();
