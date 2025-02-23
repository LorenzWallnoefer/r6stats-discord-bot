import { Client, Events, GatewayIntentBits } from "discord.js";

export class DiscordClientService {

    public isReady: boolean = false;
    private readonly internalClient: Client;

    constructor() {
        this.internalClient = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });

        this.internalClient.once(Events.ClientReady, () => this.logOnReady());
    }

    public async loginClient(discordToken: string): Promise<void> {
        await this.internalClient.login(discordToken);
    }

    public async sendMessage(channelId: string, message: string): Promise<void> {
        const discordChannel = this.internalClient.channels.cache.get(channelId);

        if (discordChannel === undefined) {
            throw new Error("Could not resolve Discord-Channel with channel-id: " + channelId);
        }

        // check if the channel is sendable
        if(discordChannel.isSendable()) {
            await discordChannel.send(message);
        }
    }

    private logOnReady(): void {
        this.isReady = true;
        console.log("Discord-Bot is online!");
    }
}