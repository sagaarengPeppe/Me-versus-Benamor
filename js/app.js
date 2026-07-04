// ==========================================
// ME VERSUS BENAMOR
// APP.JS
// UI, navigation, rounds and stats
// ==========================================

const screens = {
    home: document.querySelector("#homeScreen"),
    play: document.querySelector("#newRoundScreen"),
    settings: document.querySelector("#settingsScreen"),
    hole: document.querySelector("#holeScreen"),
    stats: document.querySelector("#statsScreen")
};

const newRoundButton = document.querySelector("#newRound");
const settingsButton = document.querySelector("#settingsButton");
const statsButton = document.querySelector("#statsButton");
const backToHomeButton = document.querySelector("#backToHome");
const backFromSettingsButton = document.querySelector("#backFromSettings");
const backToNewRoundButton = document.querySelector("#backToNewRound");
const backFromStatsButton = document.querySelector("#backFromStats");
const statsHomeButton = document.querySelector("#statsHomeButton");
const startRoundButton = document.querySelector("#startRound");
const nextHoleButton = document.querySelector("#nextHole");
const saveProfileButton = document.querySelector("#saveProfile");

const roundDateInput = document.querySelector("#roundDate");
const handicapInput = document.querySelector("#handicap");
const playerNameInput = document.querySelector("#playerName");
const profileHandicapInput = document.querySelector("#profileHandicap");

const playProfileName = document.querySelector("#playProfileName");
const playTee = document.querySelector("#playTee");

const holeTitle = document.querySelector("#holeTitle");
const holePar = document.querySelector("#holePar");
const holeHcp = document.querySelector("#holeHcp");
const holeLength = document.querySelector("#holeLength");
const holeNotes = document.querySelector("#holeNotes");
const scoreGrid = document.querySelector(".score-grid");

const liveHole = document.querySelector("#liveHole");
const liveGross = document.querySelector("#liveGross");
const liveStableford = document.querySelector("#liveStableford");

const savedToast = document.querySelector("#savedToast");
const savedToastTitle = document.querySelector("#savedToastTitle");
const savedToastText = document.querySelector("#savedToastText");

const statsMingolf = document.querySelector("#statsMingolf");
const statsBestScore = document.querySelector("#statsBestScore");
const statsGoodHole = document.querySelector("#statsGoodHole");
const statsBadHole = document.querySelector("#statsBadHole");
const statsEclectic = document.querySelector("#statsEclectic");

const roundButtons = document.querySelectorAll(".round-button");
const puttButtons = document.querySelectorAll(".putt-button");
const checkButtons = document.querySelectorAll(".check-button");
const genderButtons = document.querySelectorAll(".gender-button");
const profileTeeButtons = document.querySelectorAll(".profile-tee-button");

let selectedRoundType = "full";
let currentHole = 1;
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

function loadProfile() {
    const savedProfile = localStorage.getItem("meVersusProfile");

    if (savedProfile) {
        playerProfile = JSON.parse(savedProfile);

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
    showToast("✓ Profile saved", `${playerProfile.name} · ${playerProfile.defaultTee} tee`);
}

function updateProfileForm() {
    playerNameInput.value = playerProfile.name || "";
    profileHandicapInput.value = playerProfile.handicapIndex || "";

    setActiveByValue(genderButtons, "gender", playerProfile.gender);
    setActiveByValue(profileTeeButtons, "tee", playerProfile.defaultTee);
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove("active"));
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

function getPlayedHolesForRound(startHole, endHole) {
    return holesData.filter(hole => hole.hole >= startHole && hole.hole <= endHole);
}

function getCurrentHoleData() {
    return holesData.find(hole => hole.hole === currentHole);
}

function getSavedRounds() {
    return JSON.parse(localStorage.getItem("meVersusRounds")) || [];
}

function saveRound(round) {
    const rounds = getSavedRounds();
    rounds.push(round);
    localStorage.setItem("meVersusRounds", JSON.stringify(rounds));
}

newRoundButton.addEventListener("click", showPlayScreen);
settingsButton.addEventListener("click", () => showScreen("settings"));
statsButton.addEventListener("click", () => {
    renderStats();
    showScreen("stats");
});

backToHomeButton.addEventListener("click", () => showScreen("home"));
backFromSettingsButton.addEventListener("click", () => showScreen("home"));
backFromStatsButton.addEventListener("click", () => showScreen("home"));
statsHomeButton.addEventListener("click", () => showScreen("home"));
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
    button.addEventListener("click", () => setActiveButton(genderButtons, button));
});

profileTeeButtons.forEach(button => {
    button.addEventListener("click", () => setActiveButton(profileTeeButtons, button));
});

puttButtons.forEach(button => {
    button.addEventListener("click", () => {
        setActiveButton(puttButtons, button);
        selectedPutts = Number(button.dataset.putts);
    });
});

checkButtons.forEach(button => {
    button.addEventListener("click", () => button.classList.toggle("active-choice"));
});

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
    } else {
        currentHole = 1;
    }

    const endHole = selectedRoundType === "front9" ? 9 : 18;
    const rating = getCurrentRating();
    const playedHoles = getPlayedHolesForRound(currentHole, endHole);

    const roundEngineData = Engine.createRound(handicapIndex, rating, playedHoles);

    currentRound = {
        id: Date.now(),

        course: {
            id: "benamor",
            name: courseData.name,
            location: courseData.location || "",
            holes: courseData.holes || playedHoles.length
        },

        player: {
            name: playerProfile.name,
            gender: playerProfile.gender
        },

        setup: {
            date: roundDateInput.value,
            tee: playerProfile.defaultTee,
            roundType: selectedRoundType,
            startHole: currentHole,
            endHole: endHole
        },

        officialSubmission: {
            par: rating.par,
            courseRating: rating.courseRating,
            slopeRating: rating.slopeRating
        },

        handicap: {
            handicapIndex: handicapIndex,
            playingHandicap: roundEngineData.playingHandicap,
            strokesPerHole: roundEngineData.strokesPerHole
        },

        totals: {
            grossScore: 0,
            netScore: 0,
            stableford: 0,
            putts: 0,
            fairwaysHit: 0,
            greensHit: 0,
            bunkers: 0,
            penalties: 0
        },

        holes: []
    };

    console.log("New round started:", currentRound);

    Engine.printRoundSummary(
        {
            player: currentRound.player.name,
            course: currentRound.course.name,
            playingHandicap: currentRound.handicap.playingHandicap,
            tee: currentRound.setup.tee,
            strokesPerHole: currentRound.handicap.strokesPerHole
        },
        playedHoles
    );

    loadHole(currentHole);
    showScreen("hole");
}

function loadHole(holeNumber) {
    const holeData = holesData.find(hole => hole.hole === holeNumber);

    if (!holeData) {
        alert("Missing data for hole " + holeNumber);
        return;
    }

    const teeKey = currentRound.setup.tee.toLowerCase();
    const length = holeData.length[teeKey];

    holeTitle.textContent = `Hole ${holeData.hole}`;
    holePar.textContent = `Par ${holeData.par}`;
    holeHcp.textContent = `HCP ${holeData.strokeIndex}`;
    holeLength.textContent = length ? `${length} m` : "- m";

    clearHoleInputs();
    buildScoreButtons(holeData.par);

    nextHoleButton.textContent =
        currentHole === currentRound.setup.endHole ? "Finish round" : "Next hole";

    updateDashboard();
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
    const holeData = getCurrentHoleData();
    const strokesReceived = currentRound.handicap.strokesPerHole[currentHole];
    const netScore = selectedScore - strokesReceived;

    const stableford = Engine.calculateStableford(
        selectedScore,
        holeData.par,
        strokesReceived
    );

    const holeResult = {
        hole: currentHole,
        par: holeData.par,
        strokeIndex: holeData.strokeIndex,
        tee: currentRound.setup.tee,
        length: holeData.length[currentRound.setup.tee.toLowerCase()],
        score: selectedScore,
        strokesReceived: strokesReceived,
        netScore: netScore,
        stableford: stableford,
        putts: selectedPutts,
        fairway: document.querySelector('[data-check="fairway"]').classList.contains("active-choice"),
        green: document.querySelector('[data-check="green"]').classList.contains("active-choice"),
        bunker: document.querySelector('[data-check="bunker"]').classList.contains("active-choice"),
        penalty: document.querySelector('[data-check="penalty"]').classList.contains("active-choice"),
        notes: holeNotes.value
    };

    currentRound.holes.push(holeResult);
    updateRoundTotals(holeResult);

    console.log("Hole saved:", holeResult);
    console.log("Current round:", currentRound);

    return holeResult;
}

function updateRoundTotals(holeResult) {
    currentRound.totals.grossScore += holeResult.score;
    currentRound.totals.netScore += holeResult.netScore;
    currentRound.totals.stableford += holeResult.stableford;

    if (holeResult.putts !== null) currentRound.totals.putts += holeResult.putts;
    if (holeResult.fairway) currentRound.totals.fairwaysHit++;
    if (holeResult.green) currentRound.totals.greensHit++;
    if (holeResult.bunker) currentRound.totals.bunkers++;
    if (holeResult.penalty) currentRound.totals.penalties++;
}

function showSavedToast(holeResult) {
    showToast(
        "✓ Saved",
        `Hole ${holeResult.hole} · Score ${holeResult.score} · ${holeResult.stableford} pts`
    );

    setTimeout(() => {
        if (currentHole < currentRound.setup.endHole) {
            currentHole++;
            loadHole(currentHole);
        } else {
            saveRound(currentRound);
            renderStats(currentRound);
            showScreen("stats");
        }
    }, 2000);
}

function updateDashboard() {
    if (!currentRound) return;

    liveHole.textContent = `Hole ${currentHole} / ${currentRound.setup.endHole}`;
    liveGross.textContent = `Score ${currentRound.totals.grossScore}`;
    liveStableford.textContent = `${currentRound.totals.stableford} pts`;
}

function renderStats(latestRound = null) {
    const rounds = getSavedRounds();

    const roundsToUse = latestRound ? rounds.concat([latestRound]) : rounds;

    if (!roundsToUse.length) {
        statsMingolf.textContent = "No rounds yet";
        statsBestScore.textContent = "-";
        statsGoodHole.textContent = "-";
        statsBadHole.textContent = "-";
        statsEclectic.innerHTML = "";
        return;
    }

    const roundForMingolf = latestRound || roundsToUse[roundsToUse.length - 1];

    statsMingolf.innerHTML =
        `${roundForMingolf.course.name}<br>` +
        `${roundForMingolf.setup.tee} tee · ${roundForMingolf.setup.date}<br>` +
        `Par ${roundForMingolf.officialSubmission.par} · ` +
        `CR ${roundForMingolf.officialSubmission.courseRating} · ` +
        `Slope ${roundForMingolf.officialSubmission.slopeRating}<br>` +
        `Score ${roundForMingolf.totals.grossScore}`;

    const bestRound = roundsToUse.reduce((best, round) => {
        return round.totals.grossScore < best.totals.grossScore ? round : best;
    }, roundsToUse[0]);

    statsBestScore.textContent =
        `${bestRound.totals.grossScore} · ${bestRound.setup.date}`;

    renderEclectic(roundsToUse);
    renderBestAndWorstHole(roundsToUse);
}

function renderEclectic(rounds) {
    statsEclectic.innerHTML = "";

    for (let holeNumber = 1; holeNumber <= 18; holeNumber++) {
        const scores = [];

        rounds.forEach(round => {
            const result = round.holes.find(hole => hole.hole === holeNumber);
            if (result) scores.push(result.score);
        });

        const best = scores.length ? Math.min(...scores) : "-";

        const item = document.createElement("span");
        item.textContent = `${holeNumber}: ${best}`;
        statsEclectic.appendChild(item);
    }
}

function renderBestAndWorstHole(rounds) {
    const holeStats = [];

    for (let holeNumber = 1; holeNumber <= 18; holeNumber++) {
        const scoresToPar = [];

        rounds.forEach(round => {
            const result = round.holes.find(hole => hole.hole === holeNumber);
            if (result) scoresToPar.push(result.score - result.par);
        });

        if (scoresToPar.length > 0) {
            const averageToPar =
                scoresToPar.reduce((sum, value) => sum + value, 0) / scoresToPar.length;

            holeStats.push({
                hole: holeNumber,
                averageToPar,
                rounds: scoresToPar.length
            });
        }
    }

    if (!holeStats.length) {
        statsGoodHole.textContent = "-";
        statsBadHole.textContent = "-";
        return;
    }

    const bestHole = holeStats.reduce((best, hole) =>
        hole.averageToPar < best.averageToPar ? hole : best
    );

    const worstHole = holeStats.reduce((worst, hole) =>
        hole.averageToPar > worst.averageToPar ? hole : worst
    );

    statsGoodHole.textContent =
        `Hole ${bestHole.hole} · avg ${formatToPar(bestHole.averageToPar)}`;

    statsBadHole.textContent =
        `Hole ${worstHole.hole} · avg ${formatToPar(worstHole.averageToPar)}`;
}

function formatToPar(value) {
    if (value > 0) return `+${value.toFixed(1)}`;
    return value.toFixed(1);
}

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

function showToast(title, text) {
    savedToastTitle.textContent = title;
    savedToastText.textContent = text;

    savedToast.classList.add("show");

    setTimeout(() => {
        savedToast.classList.remove("show");
    }, 1800);
}

loadProfile();
loadAppData();