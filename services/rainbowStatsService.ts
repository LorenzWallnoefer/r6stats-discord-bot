import { R6StatAPI } from "r6statapi";
import { UserRank } from "r6statapi/dist/cjs/interfaces/stats";

const platform = "uplay"

export class RainbowStatsService {

    private readonly internalAPI: R6StatAPI
    public isLoggedIn = false;

    constructor() {
        this.internalAPI = new R6StatAPI();
    }

    public async login(apiEmail: string, apiPassword: string): Promise<void> {
        await this.internalAPI.login(apiEmail, apiPassword);
        this.isLoggedIn = true;
    }

    public async fetchPlayerStats(playerId: string): Promise<UserRank> {
        const user = await this.internalAPI.getUserByUsername(playerId, platform);
        return await this.internalAPI.getUserRank(user.userId, platform);
    }
}