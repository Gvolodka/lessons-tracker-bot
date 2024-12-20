import { GoogleService } from './src/services';
import { AppBot } from './src/bot';
import { AppScheduler } from './src/scheduler';

export const sheduler = new AppScheduler('* * * * *');
export const googleService = new GoogleService();

function extractGoogleCredentials(path?: string): {
  client_email?: string;
} {
  return path ? require(path) : {};
}

function extractBotCredentials(path?: string): { auth_token?: string } {
  return path ? require(path) : {};
}

const { BOT_CREDENTIALS, GOOGLE_APPLICATION_CREDENTIALS } = process.env;

export const { client_email } = extractGoogleCredentials(
  GOOGLE_APPLICATION_CREDENTIALS
);

const botCreds = extractBotCredentials(BOT_CREDENTIALS);

if (botCreds.auth_token) {
  const bot = new AppBot(botCreds.auth_token);
  bot.start();
} else {
  throw new Error('Bot token is missing.');
}
