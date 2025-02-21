const gameText = document.getElementById("game-text");
const optionsContainer = document.getElementById("options");
const healthDisplay = document.getElementById("health");
const inventoryDisplay = document.getElementById("inventory");

let gameState = {
    health: 100,
    inventory: []
};

// Function to update the inventory display
function updateInventory() {
    inventoryDisplay.innerText = gameState.inventory.length > 0 ? gameState.inventory.join(", ") : "None";
}

// Function to add items to inventory
function addItem(item) {
    if (!gameState.inventory.includes(item)) {
        gameState.inventory.push(item);
        updateInventory();
    }
}

// Function to handle dice roll battles
function diceRollBattle(enemyName, enemyHealth) {
    let playerRoll = Math.ceil(Math.random() * 6);
    let enemyRoll = Math.ceil(Math.random() * 6);

    gameText.innerText = `You rolled a ${playerRoll}, and the ${enemyName} rolled a ${enemyRoll}.`;

    if (playerRoll > enemyRoll) {
        gameText.innerText += ` You defeated the ${enemyName}!`;
        addItem(`${enemyName}'s Loot`);
        setTimeout(() => loadScenario("victory"), 2000);
    } else {
        gameText.innerText += ` You lost the fight and took damage.`;
        gameState.health -= 30;
        healthDisplay.innerText = gameState.health;

        if (gameState.health <= 0) {
            setTimeout(() => loadScenario("gameOver"), 2000);
        } else {
            setTimeout(() => loadScenario("injured"), 2000);
        }
    }
}

// Define game scenarios
const scenarios = {
    start: {
        text: "You wake up in a dark forest. A path splits ahead.",
        options: [
            { text: "Take the left path", next: "leftPath" },
            { text: "Take the right path", next: "rightPath" }
        ]
    },

    leftPath: {
        text: "You find an abandoned cabin. There's a **health potion** and a **torch** inside.",
        options: [
            { text: "Take the health potion", next: "deepForest", effect: () => addItem("Health Potion") },
            { text: "Take the torch", next: "deepForest", effect: () => addItem("Torch") },
            { text: "Keep walking", next: "deepForest" }
        ]
    },

    rightPath: {
        text: "You encounter a bandit blocking your way!",
        options: [
            { text: "Fight the bandit", next: "fightBandit" },
            { text: "Run away", next: "runAway" }
        ]
    },

    fightBandit: {
        text: "Prepare to battle! Rolling dice...",
        options: [
            { text: "Roll Dice", next: null, effect: () => diceRollBattle("Bandit", 30) }
        ]
    },

    injured: {
        text: "You're injured but still alive. What now?",
        options: [
            { text: "Use a health potion", next: "usePotion", condition: () => gameState.inventory.includes("Health Potion") },
            { text: "Keep moving", next: "deepForest" }
        ]
    },

    usePotion: {
        text: "You drink the health potion and feel refreshed!",
        options: [{ text: "Continue", next: "deepForest" }],
        effect: () => {
            gameState.health += 30;
            gameState.inventory.splice(gameState.inventory.indexOf("Health Potion"), 1);
            updateInventory();
        }
    },

    deepForest: {
        text: "You find a **mysterious sword** stuck in a tree, but a **cave entrance** is ahead.",
        options: [
            { text: "Take the sword", next: "caveEntrance", effect: () => addItem("Mystic Sword") },
            { text: "Ignore it", next: "caveEntrance" }
        ]
    },

    caveEntrance: {
        text: "You stand before a dark cave. It looks dangerous inside, and you need a **Torch** to enter.",
        options: [
            { text: "Light a torch and enter", next: "enterCave", condition: () => gameState.inventory.includes("Torch") },
            { text: "Turn back", next: "deepForest" }
        ]
    },

    enterCave: {
        text: "You light the torch and enter the cave. You hear strange sounds and feel the tension building.",
        options: [
            { text: "Continue into the cave", next: "caveChallenges" }
        ],
        effect: () => {
            // Calls the randomizeCave function to determine the challenge
            gameState.currentChallenge = randomizeCave();  // Store the challenge type in the game state
        }
    },

    riddlePuzzle: {
        text: "The door asks: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?'",
        input: true, // Add text input for player's answer
        options: [
            { text: "Submit Answer", next: "checkRiddleAnswer" }
        ]
    },

    checkRiddleAnswer: {
        text: "You gave your answer. Checking...",
        options: [
            { text: "Correct Answer", next: "openCaveDoor", condition: () => gameState.answer === "Echo", effect: () => addItem("Echo Answered") },
            { text: "Incorrect Answer", next: "incorrectAnswer" }
        ]
    },

    incorrectAnswer: {
        text: "Wrong answer! The door remains shut.",
        options: [
            { text: "Try again", next: "riddlePuzzle" }
        ]
    },

    openCaveDoor: {
        text: "The door opens, and you enter deeper into the cave!",
        options: [{ text: "Continue", next: "caveChallenges" }]
    },

    caveChallenges: {
        text: "Inside the cave, you face new dangers. There are **Puzzles**, **traps** and **enemies** ahead.",
        options: [
            { text: "Navigate the traps", next: "trapChallenge" },
            { text: "Fight the creatures", next: "fightCaveEnemies" },
            { text: "Solve the puzzle", next: "riddlePuzzle"}
        ]
    },

    trapChallenge: {
        text: "You must avoid traps on the path. Rolling dice to avoid danger...",
        options: [
            { text: "Roll Dice", next: null, effect: () => diceRollBattle("Traps", 40) }
        ]
    },

    fightCaveEnemies: {
        text: "You encounter cave monsters! Prepare for battle!",
        options: [
            { text: "Roll Dice", next: null, effect: () => diceRollBattle("Cave Monsters", 50) }
        ]
    },

    victory: {
        text: "You defeated the enemies and unlocked the hidden treasure in the cave!",
        options: [{ text: "Take the treasure", next: "village", effect: () => addItem("Cave Treasure") }]
    },

    village: {
        text: "You reach a village. The **mayor offers you shelter** if you have a golden key.",
        options: [
            { text: "Use golden key", next: "win", condition: () => gameState.inventory.includes("Golden Key") },
            { text: "Try to talk your way in", next: "gameOver" }
        ]
    },

    win: {
        text: "You unlocked the mayor's treasure room and won the game!",
        options: [{ text: "Play Again", next: "start" }]
    },

    gameOver: {
        text: "You have died. Game Over.",
        options: [{ text: "Restart Game", next: "start" }]
    }
};

// Randomizing Cave Layout
function randomizeCave() {
    const caveChallenges = ["trapChallenge", "fightCaveEnemies"];
    return caveChallenges[Math.floor(Math.random() * caveChallenges.length)];
}

function renderScenario(scenario) {
    const scenarioDiv = document.getElementById("scenario");
    scenarioDiv.innerHTML = ''; // Clear the previous scenario text

    const textElement = document.createElement("p");
    textElement.textContent = scenario.text;
    scenarioDiv.appendChild(textElement);

    // If the scenario requires input, render the input field
    if (scenario.input) {
        const inputElement = document.createElement("input");
        inputElement.type = "text";
        inputElement.id = "riddleAnswer"; // Set an ID to reference the input
        scenarioDiv.appendChild(inputElement);
    }

    // Render options
    scenario.options.forEach(option => {
        const optionButton = document.createElement("button");
        optionButton.textContent = option.text;
        optionButton.onclick = () => handleOptionClick(option);
        scenarioDiv.appendChild(optionButton);
    });
}

// Handle the option click and store the answer
function handleOptionClick(option) {
    // If input is needed (like for the riddle), we store the answer before proceeding
    if (option.next === "checkRiddleAnswer") {
        const answer = document.getElementById("riddleAnswer").value; // Get the player's answer
        gameState.answer = answer; // Store the answer in the game state
    }
    
    // Proceed with the next scenario
    const nextScenario = scenarios[option.next];
    renderScenario(nextScenario);
}

// Function to load a scenario
function loadScenario(scenarioKey) {
    let scenario = scenarios[scenarioKey];

    if (!scenario) return;

    if (scenario.effect) {
        scenario.effect();
    }

    healthDisplay.innerText = gameState.health;
    updateInventory();

    if (gameState.health <= 0) {
        gameState.health = 0;
        return loadScenario("gameOver");
    }

    gameText.innerText = scenario.text;
    optionsContainer.innerHTML = "";

    scenario.options.forEach(option => {
        if (option.condition && !option.condition()) return;

        let button = document.createElement("button");
        button.innerText = option.text;

        button.onclick = () => {
            if (option.effect) option.effect();
            loadScenario(option.next);
        };

        optionsContainer.appendChild(button);
    });
}

loadScenario("start");