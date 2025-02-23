import { R6StatAPI } from "r6statapi";
const platform = "uplay";
export class RainbowStatsService {
    internalAPI;
    isLoggedIn = false;
    constructor() {
        this.internalAPI = new R6StatAPI();
    }
    async login(apiEmail, apiPassword) {
        await this.internalAPI.login(apiEmail, apiPassword);
        this.isLoggedIn = true;
    }
    async fetchPlayerStats(playerId) {
        const user = await this.internalAPI.getUserByUsername(playerId, platform);
        return await this.internalAPI.getUserRank(user.userId, platform);
    }
}
