import * as dotenv from "dotenv";
import express, { Request, Response } from 'express';
import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKeyMiddleware
} from 'discord-interactions';

import { Channel, Client, GatewayIntentBits } from 'discord.js';

import { promises as fs } from 'fs';
import path from 'path';

dotenv.config();
dotenv.config({ path: `.env.local`, override: true });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

import { R6StatAPI } from 'r6statapi';
import { PlayerData } from "./models/playerdata";
const api = new R6StatAPI();

const email = process.env.UBI_MAIL
const password = process.env.UBI_PWD
const platform = "uplay"

// check if email and password for r6-api are set
if (email == undefined || password == undefined) {
  console.error("UBI_MAIL or UBI_PWD environment not set!");
  process.exit(-1);
}

// get access-token from api
const token = await api.login(email, password);

const app = express();
const PORT = process.env.PORT || 3000;

const filePath = 'kds.json';

async function readPlayersFile() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading the file:', error);
    return null;
  }
}

async function writePlayersFile(playersData: PlayerData) {
  try {
    await fs.writeFile(filePath, JSON.stringify(playersData, null, 2));
    console.log('Player data updated successfully');
  } catch (error) {
    console.error('Error writing to the file:', error);
  }
}

async function updatePlayerStats(discordChannel: Channel) {
  const playersData = await readPlayersFile();
  if (!playersData) return;

  const players = playersData.players;

  let result = [];
  let someone_played = false;

  for (const playerId in players) {
    if (players.hasOwnProperty(playerId)) {
      const currentData = players[playerId];
      const currentGames = parseInt(currentData.games);
      const currentKills = parseInt(currentData.kills);
      const currentDeaths = parseInt(currentData.deaths);

      const user = await api.getUserByUsername(playerId, platform);
      const stats = await api.getUserRank(user.userId, platform);

      let games = stats.ranked!.abandons + stats.ranked!.losses + stats.ranked!.wins;

      const newGames = games;
      const newKills = stats.ranked!.kills;
      const newDeaths = stats.ranked!.deaths;

      // let games = 1;

      // const newGames = 2;
      // const newKills = 2;
      // const newDeaths = 2;

      if (currentGames !== newGames) {
        someone_played = true;
      }

      // if (currentGames !== newGames) {
        // if (currentKills !== newKills || currentDeaths !== newDeaths) {

          let difference = (newKills - newDeaths);
          let difference_output = difference > 0 ? `:green_circle: **+${difference}**` : `:red_circle: **-${difference * -1}**`
          
          let game_difference = (newGames - currentGames);
          let game_output = newGames > currentGames ? `:green_circle: **+${game_difference} Games**` : `:white_circle: **+0 Games**`
          
          let kill_difference = (newKills - currentKills) - (newDeaths - currentDeaths);
          let kill_output = (newKills - currentKills) > (newDeaths - currentDeaths) ? `:green_circle: **+${kill_difference} Kills**` : `:red_circle: **${kill_difference} Deaths**`

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
        // }

        players[playerId] = { games: newGames, kills: newKills, deaths: newDeaths };
      // }
    }
  }

  await writePlayersFile(playersData);

  if (result.length > 0 && someone_played) {

    result.sort((a, b) => b.sort - a.sort);
    const outputString = result.map(item => item.output).join('\n');

    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();

    const formattedToday = dd.toString().padStart(2, "0") + '.' + mm.toString().padStart(2, "0") + '.' + yyyy;

    // console.log(`# :sparkles: R6 Stats - ${formattedToday} :sparkles:\n\n\n` +
    //   outputString +
    //   `\n--------------------------------------------------------------------------------`);
    if(discordChannel.isSendable()) {
      discordChannel.send(
        `# :sparkles: R6 Stats - ${formattedToday} :sparkles:\n\n\n` +
        outputString +
        `\n--------------------------------------------------------------------------------`
      );
    }
  }
}

app.post(
  "/interactions",
  verifyKeyMiddleware(process.env.PUBLIC_KEY!),
  (req: Request, res: Response) => {
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
  }
);

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});

client.once('ready', () => {
  console.log('Bot is online!');
  
  const channelId = process.env.CHANNEL_ID;
  if(channelId == undefined) {
    console.error("ChannelId environment not set!");
    process.exit(-1);
  }

  const channel = client.channels.cache.get(channelId);

  if (!channel) {
    console.error('Channel not found!');
    return;
  }

  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24 - 1, 0, 0, 0); // Adjust for UTC+1 (Vienna)

  const timeUntilMidnight = midnight.getTime() - now.getTime();

  setTimeout(() => {
    updatePlayerStats(channel);
    setInterval(() => {
      updatePlayerStats(channel);
    }, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);
  
});

client.login(process.env.token);