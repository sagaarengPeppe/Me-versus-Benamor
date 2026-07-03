// ==========================================
// ME VERSUS BENAMOR
// APP.JS
// ==========================================

// --------------------------
// Screens
// --------------------------

const homeScreen = document.querySelector("#homeScreen");
const newRoundScreen = document.querySelector("#newRoundScreen");
const settingsScreen = document.querySelector("#settingsScreen");

// --------------------------
// Buttons
// --------------------------

const newRoundButton = document.querySelector("#newRound");
const backToHomeButton = document.querySelector("#backToHome");

const settingsButton = document.querySelector("#settingsButton");
const backFromSettingsButton = document.querySelector("#backFromSettings");

const startRoundButton = document.querySelector("#startRound");

// --------------------------
// Inputs
// --------------------------

const roundDateInput = document.querySelector("#roundDate");
const handicapInput = document.querySelector("#handicap");

// --------------------------
// Choice buttons
// --------------------------

const teeButtons = document.querySelectorAll(".tee-button");
const roundButtons = document.querySelectorAll(".round-button");

// --------------------------
// Variables
// --------------------------

let selectedTee = "Red";
let selectedRoundType = "full";

// --------------------------
// Event Listeners
// --------------------------

newRoundButton.addEventListener("click", showNewRoundScreen);

backToHomeButton.addEventListener("click", showHomeScreen);

settingsButton.addEventListener("click", showSettingsScreen);

backFromSettingsButton.addEventListener("click", showHomeScreen);

startRoundButton.addEventListener("click", startRound);

// --------------------------
// Tee buttons
// --------------------------

teeButtons.forEach(button => {

    button.addEventListener("click", () => {

        teeButtons.forEach(btn => {
            btn.classList.remove("active-choice");
        });

        button.classList.add("active-choice");

        selectedTee = button.dataset.tee;

    });

});

// --------------------------
// Round buttons
// --------------------------

roundButtons.forEach(button => {

    button.addEventListener("click", () => {

        roundButtons.forEach(btn => {
            btn.classList.remove("active-choice");
        });

        button.classList.add("active-choice");

        selectedRoundType = button.dataset.roundType;

    });

});

// --------------------------
// Screens
// --------------------------

function showHomeScreen() {

    homeScreen.classList.add("active");

    newRoundScreen.classList.remove("active");
    settingsScreen.classList.remove("active");

}

function showNewRoundScreen() {

    homeScreen.classList.remove("active");

    settingsScreen.classList.remove("active");

    newRoundScreen.classList.add("active");

    const today = new Date();

    roundDateInput.value = today.toLocaleDateString("en-GB", {

        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"

    });

}

function showSettingsScreen() {

    homeScreen.classList.remove("active");

    newRoundScreen.classList.remove("active");

    settingsScreen.classList.add("active");

}

// --------------------------
// Start round
// --------------------------

function startRound() {

    let startHole = 1;

    if (selectedRoundType === "back9") {

        startHole = 10;

    }

    alert(

        "Start hole: " + startHole +
        "\nTee: " + selectedTee +
        "\nHandicap: " + handicapInput.value

    );

}