export interface PlayersData {
    players: {
        [playerName: string]: PlayerStats
    }
};

export interface PlayerStats {
    games: number,
    kills: number,
    deaths: number
}