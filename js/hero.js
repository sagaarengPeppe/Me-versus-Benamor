// ==========================================
// ME VERSUS
// HERO.JS
// Smart Hero Card system
// ==========================================

const Hero = {
    getHeroCard(profile, rounds) {
        const playerName = profile.name || "Player";
        const tee = profile.defaultTee || "Red";

        if (!rounds || rounds.length === 0) {
            return {
                title: playerName,
                subtitle: `${tee} tee`,
                detail: "No rounds yet"
            };
        }

        const summary = this.getSummary(rounds);

        if (summary.isPersonalBest) {
            return this.pickRandom([
                {
                    title: "Personal best",
                    subtitle: `${summary.lastPoints} pts`,
                    detail: "Benamor felt that one."
                },
                {
                    title: "New record",
                    subtitle: `${summary.lastPoints} pts`,
                    detail: "The course noticed."
                },
                {
                    title: "Best yet",
                    subtitle: `${summary.lastPoints} pts`,
                    detail: "Benamor is getting nervous."
                }
            ]);
        }

        const benamorCard = this.getBenamorComment(summary);

        if (benamorCard) {
            return benamorCard;
        }

        if (summary.roundsPlayed >= 2 && summary.lastPoints > summary.previousPoints) {
            return {
                title: "Better than last time",
                subtitle: `${summary.lastPoints} pts`,
                detail: `+${summary.lastPoints - summary.previousPoints} pts`
            };
        }

        if (summary.roundsPlayed >= 2 && summary.lastPoints < summary.previousPoints) {
            return {
                title: "Benamor",
                subtitle: "was not impressed.",
                detail: `${summary.lastPoints} pts last round`
            };
        }

        if (summary.roundsPlayed >= 3 && summary.toughestHole) {
            return {
                title: `Hole ${summary.toughestHole.hole}`,
                subtitle: "still wins.",
                detail: `Average ${summary.toughestHole.averagePoints.toFixed(1)} pts`
            };
        }

        return {
            title: playerName,
            subtitle: `${tee} tee`,
            detail: `Last round · ${summary.lastPoints} pts`
        };
    },

    getBenamorComment(summary) {
        const cards = [];

        cards.push({
            title: "Benamor",
            subtitle: "is watching.",
            detail: `${summary.roundsPlayed} round${summary.roundsPlayed === 1 ? "" : "s"} played`
        });

        cards.push({
            title: "The course",
            subtitle: "remembers.",
            detail: `Last round · ${summary.lastPoints} pts`
        });

        if (summary.lastPoints >= 36) {
            cards.push({
                title: "Benamor",
                subtitle: "is getting nervous.",
                detail: `${summary.lastPoints} pts last round`
            });
        }

        if (summary.lastPoints < 30) {
            cards.push({
                title: "Benamor",
                subtitle: "won that one.",
                detail: `${summary.lastPoints} pts last round`
            });
        }

        if (summary.roundsPlayed >= 2 && summary.lastPoints > summary.previousPoints) {
            cards.push({
                title: "The course",
                subtitle: "felt the pressure.",
                detail: `+${summary.lastPoints - summary.previousPoints} pts`
            });
        }

        if (summary.roundsPlayed >= 2 && summary.lastPoints < summary.previousPoints) {
            cards.push({
                title: "Benamor",
                subtitle: "hit back.",
                detail: `${summary.lastPoints} pts last round`
            });
        }

        if (summary.toughestHole) {
            cards.push({
                title: `Hole ${summary.toughestHole.hole}`,
                subtitle: "owes you one.",
                detail: `${summary.toughestHole.averagePoints.toFixed(1)} pts average`
            });
        }

        if (summary.bestHole) {
            cards.push({
                title: `Hole ${summary.bestHole.hole}`,
                subtitle: "likes you.",
                detail: `${summary.bestHole.averagePoints.toFixed(1)} pts average`
            });
        }

        return this.pickRandom(cards);
    },

    getSummary(rounds) {
        const lastRound = rounds[rounds.length - 1];
        const previousRound = rounds.length > 1 ? rounds[rounds.length - 2] : null;

        const lastPoints = this.getStablefordTotal(lastRound);
        const previousPoints = previousRound
            ? this.getStablefordTotal(previousRound)
            : null;

        const bestPoints = Math.max(
            ...rounds.map(round => this.getStablefordTotal(round))
        );

        return {
            roundsPlayed: rounds.length,
            lastRound,
            lastPoints,
            previousRound,
            previousPoints,
            bestPoints,
            isPersonalBest: lastPoints === bestPoints && rounds.length > 1,
            toughestHole: this.getToughestHole(rounds),
            bestHole: this.getBestHole(rounds)
        };
    },

    getStablefordTotal(round) {
        if (!round.holes || round.holes.length === 0) {
            return 0;
        }

        return round.holes.reduce((sum, hole) => {
            return sum + (hole.stableford || 0);
        }, 0);
    },

    getToughestHole(rounds) {
        const holeStats = this.getHoleStats(rounds);

        if (holeStats.length === 0) {
            return null;
        }

        return holeStats.sort((a, b) => a.averagePoints - b.averagePoints)[0];
    },

    getBestHole(rounds) {
        const holeStats = this.getHoleStats(rounds);

        if (holeStats.length === 0) {
            return null;
        }

        return holeStats.sort((a, b) => b.averagePoints - a.averagePoints)[0];
    },

    getHoleStats(rounds) {
        const stats = {};

        rounds.forEach(round => {
            if (!round.holes) return;

            round.holes.forEach(hole => {
                if (!stats[hole.hole]) {
                    stats[hole.hole] = {
                        hole: hole.hole,
                        totalPoints: 0,
                        rounds: 0
                    };
                }

                stats[hole.hole].totalPoints += hole.stableford || 0;
                stats[hole.hole].rounds++;
            });
        });

        return Object.values(stats).map(hole => ({
            ...hole,
            averagePoints: hole.totalPoints / hole.rounds
        }));
    },

    pickRandom(cards) {
        return cards[Math.floor(Math.random() * cards.length)];
    }
};