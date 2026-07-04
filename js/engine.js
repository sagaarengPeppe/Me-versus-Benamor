// ==========================================
// ME VERSUS
// ENGINE.JS
// Golf calculations
// ==========================================

const Engine = {
    getPlayingHandicap(handicapIndex, rating) {
        return Math.round(
            handicapIndex * rating.slopeRating / 113 +
            rating.courseRating -
            rating.par
        );
    },

    getStrokesForHole(playingHandicap, strokeIndex) {
        const baseStrokes = Math.floor(playingHandicap / 18);
        const extraStrokes = playingHandicap % 18;

        return baseStrokes + (strokeIndex <= extraStrokes ? 1 : 0);
    },

    getStrokesPerHole(playingHandicap, holes) {
        const strokesPerHole = {};

        holes.forEach(hole => {
            strokesPerHole[hole.hole] = this.getStrokesForHole(
                playingHandicap,
                hole.strokeIndex
            );
        });

        return strokesPerHole;
    },

    createRound(handicapIndex, rating, holes) {
        const playingHandicap = this.getPlayingHandicap(handicapIndex, rating);
        const strokesPerHole = this.getStrokesPerHole(playingHandicap, holes);

        return {
            playingHandicap,
            strokesPerHole
        };
    },

    calculateStableford(score, par, strokesReceived) {
        const netScore = score - strokesReceived;
        const points = 2 + par - netScore;

        return Math.max(0, points);
    },

    printRoundSummary(round, holes) {
        console.group("🏌️ Round Summary");

        console.log("Player:", round.player);
        console.log("Course:", round.course);
        console.log("Playing Handicap:", round.playingHandicap);
        console.log("Tee:", round.tee);

        const table = holes.map(hole => ({
            Hole: hole.hole,
            SI: hole.strokeIndex,
            Par: hole.par,
            Strokes: round.strokesPerHole[hole.hole]
        }));

        console.table(table);
        console.groupEnd();
    },

    runTests() {
        console.log("Running Engine tests...");

        console.assert(this.calculateStableford(4, 3, 2) === 3);
        console.assert(this.calculateStableford(4, 3, 3) === 4);

        console.assert(this.getStrokesForHole(27, 7) === 2);
        console.assert(this.getStrokesForHole(27, 10) === 1);

        console.assert(this.getStrokesForHole(21, 2) === 2);
        console.assert(this.getStrokesForHole(21, 7) === 1);

        console.assert(this.getStrokesForHole(9, 7) === 1);
        console.assert(this.getStrokesForHole(9, 10) === 0);

        console.log("Engine tests complete.");
    }
};

Engine.runTests();