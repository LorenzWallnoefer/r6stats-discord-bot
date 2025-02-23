import { existsSync, readFileSync, writeFileSync } from "fs";
import { PlayersData } from "../models/playerdata.js";
import path from "path";
import { environmentConfig } from "../config/environment.js";

const kdsFileName = "kds.json";

export class SavedDataService {

    public static initPlayersFile(): void {
        if (!existsSync(this.resolveFilePath())) {
            // if file does not exists, init a empty one
            this.writePlayersFile({players: {}});
        }
    }

    public static readPlayersFile(): PlayersData | null {
        try {
            return JSON.parse(readFileSync(this.resolveFilePath(), 'utf-8'));
        } catch (error) {
            console.error('Error reading the file:', error);
            return null;
        }
    }
    
    public static writePlayersFile(playersData: PlayersData): void {
        try {
            writeFileSync(this.resolveFilePath(), JSON.stringify(playersData, null, 2));
            console.log('Player data updated successfully');
        } catch (error) {
            console.error('Error writing to the file:', error);
        }
    }

    private static resolveFilePath(): string {
        if(environmentConfig.savedDataFilePath !== undefined) {
            return path.resolve(environmentConfig.savedDataFilePath, kdsFileName);
        }

        return kdsFileName;
    }
}