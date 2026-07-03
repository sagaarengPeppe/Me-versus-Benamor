// ==========================================
// ME VERSUS BENAMOR
// APP.JS
// ==========================================

// --------------------------
// Screens
// --------------------------

const screens = {
    home: document.querySelector("#homeScreen"),
    play: document.querySelector("#newRoundScreen"),
    settings: document.querySelector("#settingsScreen"),
    hole: document.querySelector("#holeScreen")
};

// --------------------------
// Buttons
// --------------------------

const newRoundButton = document.querySelector("#newRound");
const settingsButton = document.querySelector("#settingsButton");
const backToHomeButton = document.querySelector("#backToHome");
const backFromSettingsButton = document.querySelector("#backFromSettings");
const backToNewRoundButton = document.querySelector("#backToNewRound");
const startRoundButton = document.querySelector("#startRound");
const nextHoleButton = document.querySelector("#nextHole");

// --------------------------
// Inputs
// --------------------------

const roundDateInput = document.querySelector("#roundDate");
const handicapInput = document.querySelector("#handicap");

// --------------------------
// Hole elements
// --------------------------

const holeTitle = document.querySelector("#holeTitle");
const holePar = document.querySelector("#holePar");
const holeHcp = document.querySelector("#holeHcp");
const holeLength = document.querySelector("#holeLength");
const holeNotes = document.querySelector("#holeNotes");

const scoreGrid = document.querySelector(".score-grid");

// --------------------------
// Choice buttons
// --------------------------

const teeButtons = document.querySelectorAll(".tee-button");
const roundButtons = document.querySelectorAll(".round-button");
const puttButtons = document.querySelectorAll(".putt-button");
const checkButtons = document.querySelectorAll(".check-button");

// --------------------------
// App state
// --------------------------

let selectedTee = "Red";
let selectedRoundType = "full";
let currentHole = 1;
let endHole = 18;

let selectedScore = null;
let selectedPutts = null;
let currentRound = null;

let courseData = null;
let holesData = [];
let slopesData = null;

// --------------------------
// Load data
// --------------------------

async function loadAppData() {
    try {
        const [courseResponse, holesResponse, slopesResponse] = await Promise.all([
            fetch("courses/benamor/course.json"),
            fetch("courses/benamor/holes.json"),
            fetch("courses/benamor/slopes.json")
        ]);

        if (!courseResponse.ok || !holesResponse.ok || !slopesResponse.ok) {
            throw new Error("Could not load one or more course files.");
        }

        courseData = await courseResponse.json();
        holesData = await holesResponse.json();
        slopesData = await slopesResponse.json();

        console.log("Course loaded:", courseData);
        console.log("Holes loaded:", holesData);
        console.log("Slopes loaded:", slopesData);

    } catch (error) {
        console.error("Error loading app data:", error);
        alert("Could not load course data.");
    }
}

// --------------------------
// Navigation
// --------------------------

function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove("active");
    });

    screens[screenName].classList.add("active");
}

function showPlayScreen() {
    setTodayDate();
    showScreen("play");
}

function setTodayDate() {
    const today = new Date();

    roundDateInput.value = today.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

// --------------------------
// Main events
// --------------------------

newRoundButton.addEventListener("click", showPlayScreen);
settingsButton.addEventListener("click", () => showScreen("settings"));
backToHomeButton.addEventListener("click", () => showScreen("home"));
backFromSettingsButton.addEventListener("click", () => showScreen("home"));
backToNewRoundButton.addEventListener("click", showPlayScreen);
startRoundButton.addEventListener("click", startRound);
nextHoleButton.addEventListener("click", goToNextHole);

// --------------------------
// Choice buttons
// --------------------------

function setActiveButton(buttons, clickedButton) {
    buttons.forEach(button => button.classList.remove("active-choice"));
    clickedButton.classList.add("active-choice");
}

teeButtons.forEach(button => {
    button.addEventListener("click", () => {
        setActiveButton(teeButtons, button);
        selectedTee = button.dataset.tee;
    });
});

roundButtons.forEach(button => {
    button.addEventListener("click", () => {
        setActiveButton(roundButtons, button);
        selectedRoundType = button.dataset.roundType;
    });
});

puttButtons.forEach(button => {
    button.addEventListener("click", () => {
        setActiveButton(puttButtons, button);
        selectedPutts = Number(button.dataset.putts);
    });
});

checkButtons.forEach(button => {
    button.addEventListener("click", () => {
        button.classList.toggle("active-choice");
    });
});

// --------------------------
// Round flow
// --------------------------

function startRound() {
    if (!holesData || holesData.length === 0) {
        alert("Course data is still loading. Try again in a moment.");
        return;
    }

    if (selectedRoundType === "back9") {
        currentHole = 10;
        endHole = 18;
    } else if (selectedRoundType === "front9") {
        currentHole = 1;
        endHole = 9;
    } else {
        currentHole = 1;
        endHole = 18;
    }

    currentRound = {
        course: "Benamor Golf",
        date: roundDateInput.value,
        handicap: Number(handicapInput.value),
        tee: selectedTee,
        roundType: selectedRoundType,
        startHole: currentHole,
        endHole: endHole,
        holes: []
    };

    console.log("New round started:", currentRound);

    loadHole(currentHole);
    showScreen("hole");
}

function loadHole(holeNumber) {
    const holeData = holesData.find(hole => hole.hole === holeNumber);

    if (!holeData) {
        alert("Missing data for hole " + holeNumber);
        return;
    }

    const teeKey = selectedTee.toLowerCase();
    const length = holeData.length[teeKey];

    holeTitle.textContent = `Hole ${holeData.hole}`;
    holePar.textContent = `Par ${holeData.par}`;
    holeHcp.textContent = `HCP ${holeData.strokeIndex}`;
    holeLength.textContent = length ? `${length} m` : "- m";

    clearHoleInputs();
    buildScoreButtons(holeData.par);

    nextHoleButton.textContent =
        currentHole === endHole ? "Finish round" : "Next hole";
}
function saveCurrentHole() {
    const holeResult = {
        hole: currentHole,
        score: selectedScore,
        putts: selectedPutts,
        fairway: document.querySelector('[data-check="fairway"]').classList.contains("active-choice"),
        green: document.querySelector('[data-check="green"]').classList.contains("active-choice"),
        bunker: document.querySelector('[data-check="bunker"]').classList.contains("active-choice"),
        penalty: document.querySelector('[data-check="penalty"]').classList.contains("active-choice"),
        notes: holeNotes.value
    };

    currentRound.holes.push(holeResult);

    console.log("Hole saved:", holeResult);
    console.log("Current round:", currentRound);
    }
function goToNextHole() {
    saveCurrentHole();

    if (currentHole < endHole) {
        currentHole++;
        loadHole(currentHole);
    } else {
        console.log("Round complete:", currentRound);
        showScreen("home");
    }
}

// --------------------------
// Hole inputs
// --------------------------

function clearHoleInputs() {
    selectedScore = null;
    selectedPutts = null;

    scoreGrid.innerHTML = "";

    puttButtons.forEach(button => button.classList.remove("active-choice"));
    checkButtons.forEach(button => button.classList.remove("active-choice"));

    holeNotes.value = "";
}

function buildScoreButtons(par) {
    scoreGrid.innerHTML = "";

    const startScore = par - 1;
    const endScore = par + 4;

    for (let score = startScore; score <= endScore; score++) {
        const button = document.createElement("button");

        button.className = "choice-button score-button";
        button.textContent = score;
        button.dataset.score = score;

        button.addEventListener("click", () => {
            document.querySelectorAll(".score-button").forEach(btn => {
                btn.classList.remove("active-choice");
            });

            button.classList.add("active-choice");
            selectedScore = score;
        });

        scoreGrid.appendChild(button);
    }
}

// --------------------------
// Init
// --------------------------

loadAppData();