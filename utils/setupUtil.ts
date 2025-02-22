import { environmentConfig, EnvironmentConfig } from "../config/environment";
import { DiscordClientService } from "../services/discordClientService";
import { RainbowStatsService } from "../services/rainbowStatsService";

export async function setupR6API(): Promise<RainbowStatsService> {
    const {email, password } = checkForR6StatEnvironmentCredentials();

    const serviceInstance = new RainbowStatsService();
    await serviceInstance.login(email, password);

    if(serviceInstance.isLoggedIn) {
        return serviceInstance;
    }

    throw new Error("Failed to log in to Rainbow-Stat-API!");
}

export async function setupDiscordClient(): Promise<DiscordClientService> {
    const discordToken = checkForDiscordBotCredentials();

    const serviceInstance = new DiscordClientService();
    await serviceInstance.loginClient(discordToken);

    if(serviceInstance.isReady) {
        return serviceInstance;
    }

    throw new Error("Failed to log in to Discord-Bot-Client!");
}

function checkForR6StatEnvironmentCredentials(): {email: string, password: string} {
    if (environmentConfig.r6APIEmail == undefined || environmentConfig.r6APIPassword == undefined) {
        console.error("UBI_MAIL or UBI_PWD environment not set!");
        process.exit(-1);
    } 

    return { email: environmentConfig.r6APIEmail, password: environmentConfig.r6APIPassword };
}

function checkForDiscordBotCredentials(): string {
    if (environmentConfig.token == undefined) {
        console.error("Discord-Token not set in environment!");
        process.exit(-1);
    } 

    return environmentConfig.token;
}