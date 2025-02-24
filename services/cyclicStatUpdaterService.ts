import { environmentConfig } from "../config/environment.js";
import { DiscordClientService } from "./discordClientService.js";
import { RainbowStatsService } from "./rainbowStatsService.js";
import { SavedDataService } from "./savedDataService.js";

export class CyclicStatUpdaterService {

    public isRunning = false;
    private runningTimeout: NodeJS.Timeout | undefined;

    constructor(
        private readonly discordClientService: DiscordClientService,
        private readonly rainbowStatsService: RainbowStatsService
    ) { }

    public startCyclicUpdates(): void {
        this.startInternalTimeout();
        this.isRunning = true;
    }

    public stopCyclicUpdates(): void {
        clearTimeout(this.runningTimeout);
        this.isRunning = false;
    }

    private async updateStats(): Promise<void> {
        const savedPlayersData = SavedDataService.readPlayersFile();

        if (savedPlayersData === null) {
            console.error("Could not read player-data!")
            process.exit(-1);
        }

        // we only want to update if one player has played
        let shouldUpdate = false;
        const result = [];

        for (const playerId in savedPlayersData.players) {
            if (savedPlayersData.players.hasOwnProperty(playerId)) {
                const currentData = savedPlayersData.players[playerId];

                const playerStats = await this.rainbowStatsService.fetchPlayerStats(playerId);

                let games = playerStats.ranked!.abandons + playerStats.ranked!.losses + playerStats.ranked!.wins;

                const newGames = games;
                const newKills = playerStats.ranked!.kills;
                const newDeaths = playerStats.ranked!.deaths;

                if (currentData.games !== newGames) {
                    shouldUpdate = true;
                }

                let difference = (newKills - newDeaths);
                let difference_output = difference > 0 ? `:green_circle: **+${difference}**` : `:red_circle: **-${difference * -1}**`

                let game_difference = (newGames - currentData.games);
                let game_output = newGames > currentData.games ? `:green_circle: **+${game_difference} Games**` : `:white_circle: **+0 Games**`

                let kill_difference = (newKills - currentData.kills) - (newDeaths - currentData.deaths);
                let kill_output = (newKills - currentData.kills) > (newDeaths - currentData.deaths) ? `:green_circle: **+${kill_difference} Kills**` : `:red_circle: **${kill_difference} Deaths**`

                if (difference == 0) {
                    difference_output = `:black_circle: **${difference}**`;
                }
                if (kill_difference == 0) {
                    kill_output = `:white_circle: **0 Kills/Deaths**`;
                }

                let kd = newKills / newDeaths;
                kd = Math.round(kd * 100) / 100;

                let emoji = "";

                if (kd < 0.5) {
                    emoji = ":skull:"
                } else if (kd >= 0.5 && kd < 0.7) {
                    emoji = ":sob:"
                } else if (kd >= 0.7 && kd < 0.9) {
                    emoji = ":pleading_face:"
                } else if (kd >= 0.9 && kd < 1) {
                    emoji = ":cold_face:"
                } else if (kd >= 1 && kd < 1.1) {
                    emoji = ":speaking_head:"
                } else if (kd >= 1.1 && kd < 1.2) {
                    emoji = ":triumph:"
                } else if (kd >= 1.2 && kd < 1.3) {
                    emoji = ":smiling_imp:"
                } else if (kd >= 1.3 && kd < 1.5) {
                    emoji = ":lion_face:"
                } else if (kd >= 1.5 && kd < 2) {
                    emoji = ":goat:"
                } else if (kd >= 2) {
                    emoji = ":t_rex:"
                }

                result.push({
                    'sort': difference,
                    'output': `**${playerId}** \n **${kd}** K/D ${emoji} | ${difference_output} \n ${game_output} \n ${kill_output}\n`
                });

                savedPlayersData.players[playerId] = { games: newGames, kills: newKills, deaths: newDeaths };
            }
        }

        // update saved-data to new stats
        SavedDataService.writePlayersFile(savedPlayersData);

        if (result.length > 0 && shouldUpdate) {

            result.sort((a, b) => b.sort - a.sort);
            const outputString = result.map(item => item.output).join('\n');

            const today = new Date();
            const yyyy = today.getFullYear();
            let mm = today.getMonth() + 1;
            let dd = today.getDate();

            const formattedToday = dd.toString().padStart(2, "0") + '.' + mm.toString().padStart(2, "0") + '.' + yyyy;

            const discordMessage = `# :sparkles: R6 Stats - ${formattedToday} :sparkles:\n\n\n` +
                outputString +
                `\n--------------------------------------------------------------------------------`

            this.discordClientService.sendMessage(environmentConfig.discordChannelId!, discordMessage)
        }

        // start the next timeout
        this.startInternalTimeout();
    }

    private startInternalTimeout(): void {
        this.runningTimeout = setTimeout(() => this.updateStats(), this.getTimeoutTime());
    }

    private getTimeoutTime(): number {
        // for now - calculate time until midnight
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);

        return midnight.getTime() - now.getTime();
    }
}