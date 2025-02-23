import { Client, Events, GatewayIntentBits } from "discord.js";
export class DiscordClientService {
    isReady = false;
    internalClient;
    constructor() {
        this.internalClient = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });
        this.internalClient.once(Events.ClientReady, this.logOnReady);
    }
    async loginClient(discordToken) {
        await this.internalClient.login(discordToken);
    }
    async sendMessage(channelId, message) {
        const discordChannel = this.internalClient.channels.cache.get(channelId);
        if (discordChannel === undefined) {
            throw new Error("Could not resolve Discord-Channel with channel-id: " + channelId);
        }
        // check if the channel is sendable
        if (discordChannel.isSendable()) {
            await discordChannel.send(message);
        }
    }
    logOnReady() {
        console.log("Discord-Bot is online!");
    }
}
