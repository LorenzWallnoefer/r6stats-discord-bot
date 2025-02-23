import * as dotenv from "dotenv";

dotenv.config({ path: `.env.local`, override: true });

export interface EnvironmentConfig {
    r6APIEmail?: string,
    r6APIPassword?: string
    token?: string,
    publicKey?: string,
    discordChannelId?: string,
    port?: number,
    savedDataFilePath?: string
}

export const environmentConfig: EnvironmentConfig = {
    r6APIEmail: process.env.UBI_MAIL,
    r6APIPassword: process.env.UBI_PWD,
    token: process.env.DISCORD_TOKEN,
    publicKey: process.env.PUBLIC_KEY,
    discordChannelId: process.env.CHANNEL_ID,
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    savedDataFilePath: process.env.SAVED_DATA_FILE_PATH,
};