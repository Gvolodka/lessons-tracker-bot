import { Bot, CommandMiddleware, Middleware, session } from 'grammy';
import { BotCommand } from 'grammy/types';

import { conversations, createConversation } from '@grammyjs/conversations';
import { freeStorage } from '@grammyjs/storage-free';

import { TAppContext, TSessionData } from './types';
import { setupSpreadsheet, setupTimeZone } from './conversations';
import { getDataSettingsMenu } from './menus';

function initialState(): TSessionData {
  return {
    spreadsheet: null,
    timezone: null,
  };
}

export class AppBot {
  private bot: Bot<TAppContext>;

  private commands = new Map<string, BotCommand>([]);

  public async addCommand(
    command: string,
    description: string,
    ...middleware: CommandMiddleware<TAppContext>[]
  ): Promise<void> {
    this.bot.command(command, ...middleware);
    this.commands.set(command, { command, description });
    await this.bot.api.setMyCommands([...this.commands.values()]);
  }

  public use(...middleware: Middleware<TAppContext>[]): void {
    this.bot.errorBoundary((err) => {
    }, ...middleware);
  }

  constructor(authToken: string) {
    this.bot = new Bot<TAppContext>(authToken);
    this.bot.catch((err) => {
    });

    this.bot.use(
      session({
        initial: initialState,
        storage: freeStorage<TSessionData>(this.bot.token),
      })
    );
    this.bot.use(conversations());

    this.addCommand('stop', 'Stop all conversations.', async (ctx) => {
      await ctx.conversation.exit();
      await ctx.reply('ok ._.', {
        reply_markup: { remove_keyboard: true },
      });
    });

    this.use(
      createConversation(setupSpreadsheet),
      createConversation(setupTimeZone)
    );

    this.addCommand('init', 'Initialize data settings.', async (ctx) => {
      await ctx.conversation.enter('setupSpreadsheet');
      await ctx.conversation.enter('setupTimeZone');
    });

    // data-settings-menu
    const dataSettingsMenu = getDataSettingsMenu();
    this.use(dataSettingsMenu.menu);
    this.addCommand(
      'datamenu',
      'Open data settings menu.',
      dataSettingsMenu.commandMiddleware
    );
  }

  public start(): void {
    this.bot.start();
  }
}
