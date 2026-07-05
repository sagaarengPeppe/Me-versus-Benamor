const Storage = {
    keys: {
        profile: "meVersus.profile",
        rounds: "meVersus.rounds",
        settings: "meVersus.settings"
    },

    getProfile() {
        return this.get(this.keys.profile, null);
    },

    saveProfile(profile) {
        this.save(this.keys.profile, profile);
    },

    getRounds() {
        return this.get(this.keys.rounds, []);
    },

    saveRound(round) {
        const rounds = this.getRounds();

        const savedRound = {
            ...round,
            savedAt: new Date().toISOString()
        };

        rounds.push(savedRound);

        this.save(this.keys.rounds, rounds);

        return savedRound;
    },

    getSettings() {
        return this.get(this.keys.settings, {
            version: "0.1",
            activeCourse: "benamor"
        });
    },

    saveSettings(settings) {
        this.save(this.keys.settings, settings);
    },

    get(key, fallback) {
        const value = localStorage.getItem(key);

        if (!value) {
            return fallback;
        }

        try {
            return JSON.parse(value);
        } catch {
            return fallback;
        }
    },

    save(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    clearAll() {
        localStorage.removeItem(this.keys.profile);
        localStorage.removeItem(this.keys.rounds);
        localStorage.removeItem(this.keys.settings);
    }
};