import { existsSync, readFileSync, writeFileSync } from "fs";
import { PlayersData } from "../models/playerdata";

const kdsFileName = "kds.json";

export class SavedDataService {

    public static initPlayersFile(): void {
        if (!existsSync(kdsFileName)) {
            // if file does not exists, init a empty one
            this.writePlayersFile({players: {}});
        }
    }

    public static readPlayersFile(): PlayersData | null {
        try {
            return JSON.parse(readFileSync(kdsFileName, 'utf-8'));
        } catch (error) {
            console.error('Error reading the file:', error);
            return null;
        }
    }
    
    public static writePlayersFile(playersData: PlayersData): void {
        try {
            writeFileSync(kdsFileName, JSON.stringify(playersData, null, 2));
            console.log('Player data updated successfully');
        } catch (error) {
            console.error('Error writing to the file:', error);
        }
    }
}