import express from 'express';
import { InteractionType, verifyKeyMiddleware } from 'discord-interactions';
import { environmentConfig } from './config/environment';
import { setupDiscordClient, setupR6API } from './utils/setupUtil';
import { SavedDataService } from './services/savedDataService';
import { CyclicStatUpdaterService } from './services/cyclicStatUpdaterService';
// init player-data-file
SavedDataService.initPlayersFile();
// setup the rainbow-stats-service, discord-client and cyclic-updater and start cyclic updates
const cyclicUpdaterService = new CyclicStatUpdaterService(await setupDiscordClient(), await setupR6API());
cyclicUpdaterService.startCyclicUpdates();
// create the express app
const app = express();
app.post("/interactions", verifyKeyMiddleware(process.env.PUBLIC_KEY ?? ""), (req, res) => {
    const interaction = req.body;
    if (interaction.type === InteractionType.PING) {
        res.json({ type: InteractionType.PING });
        return;
    }
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
        const { name } = interaction.data;
    }
    res.status(400).send("Unknown interaction");
    return;
});
app.listen(environmentConfig.port, (err) => {
    if (err !== undefined) {
        console.error("Failed to start webservice: " + err.message);
        process.exit(-1);
    }
    console.log('Listening on port: ', environmentConfig.port);
});
