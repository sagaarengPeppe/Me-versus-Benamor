// ==========================================
// ME VERSUS BENAMOR
// APP.JS
// UI, navigation and round flow
// ==========================================

// Screens
const screens = {
    home: document.querySelector("#homeScreen"),
    play: document.querySelector("#newRoundScreen"),
    settings: document.querySelector("#settingsScreen"),
    hole: document.querySelector("#holeScreen")
};

// Buttons
const newRoundButton = document.querySelector("#newRound");
const settingsButton = document.querySelector("#settingsButton");
const backToHomeButton = document.querySelector("#backToHome");
const backFromSettingsButton = document.querySelector("#backFromSettings");
const backToNewRoundButton = document.querySelector("#backToNewRound");
const startRoundButton = document.querySelector("#startRound");
const nextHoleButton = document.querySelector("#nextHole");
const saveProfileButton = document.querySelector("#saveProfile");

// Inputs
const roundDateInput = document.querySelector("#roundDate");
const handicapInput = document.querySelector("#handicap");
const playerNameInput = document.querySelector("#playerName");
const profileHandicapInput = document.querySelector("#profileHandicap");

// Profile summary
const playProfileName = document.querySelector("#playProfileName");
const playTee = document.querySelector("#playTee");

// Hole elements
const holeTitle = document.querySelector("#holeTitle");
const holePar = document.querySelector("#holePar");
const holeHcp = document.querySelector("#holeHcp");
const holeLength = document.querySelector("#holeLength");
const holeNotes = document.querySelector("#holeNotes");
const scoreGrid = document.querySelector(".score-grid");

// Toast
const savedToast = document.querySelector("#savedToast");
const savedToastTitle = document.querySelector("#savedToastTitle");
const savedToastText = document.querySelector("#savedToastText");

// Choice buttons
const roundButtons = document.querySelectorAll(".round-button");
const puttButtons = document.querySelectorAll(".putt-button");
const checkButtons = document.querySelectorAll(".check-button");
const genderButtons = document.querySelectorAll(".gender-button");
const profileTeeButtons = document.querySelectorAll(".profile-tee-button");

// App state
let selectedRoundType = "full";
let currentHole = 1;
let endHole = 18;

let selectedScore = null;
let selectedPutts = null;
let currentRound = null;

let courseData = null;
let holesData = [];
let slopesData = null;

let playerProfile = {
    name: "Saga",
    gender: "women",
    defaultTee: "Red",
    handicapIndex: ""
};

// --------------------------
// Data loading
// --------------------------

async function loadAppData() {
    try {
        const [courseResponse, holesResponse, slopesResponse] = await Promise.all([
            fetch("courses/benamor/course.json"),
            fetch("courses/benamor/holes.json"),
            fetch("courses/benamor/slopes.json")
        ]);

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
// Profile
// --------------------------

function loadProfile() {
    const savedProfile = localStorage.getItem("meVersusProfile");

    if (savedProfile) {
        playerProfile = JSON.parse(savedProfile);

        // Backwards compatibility if old profile used "handicap"
        if (playerProfile.handicap && !playerProfile.handicapIndex) {
            playerProfile.handicapIndex = playerProfile.handicap;
        }
    }

    updateProfileForm();
}

function saveProfile() {
    playerProfile = {
        name: playerNameInput.value || "Player",
        gender: getActiveValue(genderButtons, "gender"),
        defaultTee: getActiveValue(profileTeeButtons, "tee"),
        handicapIndex: profileHandicapInput.value
    };

    localStorage.setItem("meVersusProfile", JSON.stringify(playerProfile));

    showToast(
        "✓ Profile saved",
        `${playerProfile.name} · ${playerProfile.defaultTee} tee`
    );

    console.log("Profile saved:", playerProfile);
}

function updateProfileForm() {
    playerNameInput.value = playerProfile.name || "";
    profileHandicapInput.value = playerProfile.handicapIndex || "";

    setActiveByValue(genderButtons, "gender", playerProfile.gender);
    setActiveByValue(profileTeeButtons, "tee", playerProfile.defaultTee);
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

    handicapInput.value = playerProfile.handicapIndex || "";
    playProfileName.textContent = playerProfile.name || "Player";
    playTee.textContent = `${playerProfile.defaultTee} tee`;

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
// Helpers
// --------------------------

function setActiveButton(buttons, clickedButton) {
    buttons.forEach(button => button.classList.remove("active-choice"));
    clickedButton.classList.add("active-choice");
}

function getActiveValue(buttons, dataName) {
    const activeButton = Array.from(buttons).find(button =>
        button.classList.contains("active-choice")
    );

    return activeButton.dataset[dataName];
}

function setActiveByValue(buttons, dataName, value) {
    buttons.forEach(button => {
        button.classList.toggle("active-choice", button.dataset[dataName] === value);
    });
}

function getCurrentRating() {
    const gender = playerProfile.gender;
    const tee = playerProfile.defaultTee.toLowerCase();

    return slopesData.ratings[gender][tee][selectedRoundType];
}

function getPlayedHoles() {
    return holesData.filter(hole =>
        hole.hole >= currentRound.startHole &&
        hole.hole <= currentRound.endHole
    );
}

// --------------------------
// Events
// --------------------------

newRoundButton.addEventListener("click", showPlayScreen);
settingsButton.addEventListener("click", () => showScreen("settings"));
backToHomeButton.addEventListener("click", () => showScreen("home"));
backFromSettingsButton.addEventListener("click", () => showScreen("home"));
backToNewRoundButton.addEventListener("click", showPlayScreen);
startRoundButton.addEventListener("click", startRound);
nextHoleButton.addEventListener("click", goToNextHole);
saveProfileButton.addEventListener("click", saveProfile);

roundButtons.forEach(button => {
    button.addEventListener("click", () => {
        setActiveButton(roundButtons, button);
        selectedRoundType = button.dataset.roundType;
    });
});

genderButtons.forEach(button => {
    button.addEventListener("click", () => {
        setActiveButton(genderButtons, button);
    });
});

profileTeeButtons.forEach(button => {
    button.addEventListener("click", () => {
        setActiveButton(profileTeeButtons, button);
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
    if (!holesData.length || !slopesData) {
        alert("Course data is still loading. Try again in a moment.");
        return;
    }

    const handicapIndex = Number(handicapInput.value);

    if (Number.isNaN(handicapIndex)) {
        alert("Please enter your handicap.");
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

    const rating = getCurrentRating();
    const playedHoles = holesData.filter(hole =>
        hole.hole >= currentHole && hole.hole <= endHole
    );

    const roundEngineData = Engine.createRound(
        handicapIndex,
        rating,
        playedHoles
    );

    currentRound = {
        course: courseData.name,
        player: playerProfile.name,
        gender: playerProfile.gender,

        date: roundDateInput.value,

        handicapIndex: handicapIndex,
        playingHandicap: roundEngineData.playingHandicap,
        strokesPerHole: roundEngineData.strokesPerHole,

        tee: playerProfile.defaultTee,
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

    const teeKey = playerProfile.defaultTee.toLowerCase();
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

function goToNextHole() {
    if (selectedScore === null) {
        alert("Du måste registrera score innan du kan gå vidare.");
        return;
    }

    const holeResult = saveCurrentHole();

    showSavedToast(holeResult);
}

function saveCurrentHole() {
    const holeData = holesData.find(hole => hole.hole === currentHole);

    const strokesReceived = currentRound.strokesPerHole[currentHole];

    const stableford = Engine.calculateStableford(
        selectedScore,
        holeData.par,
        strokesReceived
    );

    const holeResult = {
        hole: currentHole,
        par: holeData.par,
        strokeIndex: holeData.strokeIndex,

        score: selectedScore,
        putts: selectedPutts,

        strokesReceived: strokesReceived,
        stableford: stableford,

        fairway: document.querySelector('[data-check="fairway"]').classList.contains("active-choice"),
        green: document.querySelector('[data-check="green"]').classList.contains("active-choice"),
        bunker: document.querySelector('[data-check="bunker"]').classList.contains("active-choice"),
        penalty: document.querySelector('[data-check="penalty"]').classList.contains("active-choice"),

        notes: holeNotes.value
    };

    currentRound.holes.push(holeResult);

    console.log("Hole saved:", holeResult);
    console.log("Current round:", currentRound);

    return holeResult;
}

function showSavedToast(holeResult) {
    showToast(
        "✓ Saved",
        `Hole ${holeResult.hole} · Score ${holeResult.score} · ${holeResult.stableford} pts`
    );

    setTimeout(() => {
        if (currentHole < endHole) {
            currentHole++;
            loadHole(currentHole);
        } else {
            console.log("Round complete:", currentRound);
            showScreen("home");
        }
    }, 2000);
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
// Toast
// --------------------------

function showToast(title, text) {
    savedToastTitle.textContent = title;
    savedToastText.textContent = text;

    savedToast.classList.add("show");

    setTimeout(() => {
        savedToast.classList.remove("show");
    }, 1800);
}

// --------------------------
// Init
// --------------------------

loadProfile();
loadAppData();