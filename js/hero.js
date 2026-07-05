// ==========================================
// ME VERSUS
// HERO.JS
// Smart Hero Card system
// ==========================================

const Hero = {
    getHeroCard(profile, rounds) {
        if (!rounds || rounds.length === 0) {
            return {
                title: profile.name || "Player",
                subtitle: `${profile.defaultTee || "Red"} tee`,
                detail: "No rounds yet"
            };
        }

        const lastRound = rounds[rounds.length - 1];
        const lastPoints = this.getStablefordTotal(lastRound);

        return {
            title: profile.name || "Player",
            subtitle: `${profile.defaultTee || "Red"} tee`,
            detail: `Last round · ${lastPoints} pts`
        };
    },

    getStablefordTotal(round) {
        if (!round.holes || round.holes.length === 0) {
            return 0;
        }

        return round.holes.reduce((sum, hole) => {
            return sum + (hole.stableford || 0);
        }, 0);
    }
};