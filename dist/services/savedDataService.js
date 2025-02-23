import { existsSync, readFileSync, writeFileSync } from "fs";
const kdsFileName = "kds.json";
export class SavedDataService {
    static initPlayersFile() {
        if (!existsSync(kdsFileName)) {
            // if file does not exists, init a empty one
            this.writePlayersFile({ players: {} });
        }
    }
    static readPlayersFile() {
        try {
            return JSON.parse(readFileSync(kdsFileName, 'utf-8'));
        }
        catch (error) {
            console.error('Error reading the file:', error);
            return null;
        }
    }
    static writePlayersFile(playersData) {
        try {
            writeFileSync(kdsFileName, JSON.stringify(playersData, null, 2));
            console.log('Player data updated successfully');
        }
        catch (error) {
            console.error('Error writing to the file:', error);
        }
    }
}
