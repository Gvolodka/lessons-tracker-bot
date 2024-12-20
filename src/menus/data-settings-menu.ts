import { CommandContext } from 'grammy';

import { Menu } from '@grammyjs/menu';

import { TAppContext } from '../types';
import { formatDateTime } from '../functions';

export function getDataSettingsMenu() {
  const menu = new Menu<TAppContext>('data-settings-menu')
    .text('Change spreadsheet', async (ctx) => {
      await ctx.conversation.enter('setupSpreadsheet');
    })
    .text('Change timezone', async (ctx) => {
      await ctx.conversation.enter('setupTimeZone');
    });
  const commandMiddleware = async (ctx: CommandContext<TAppContext>) => {
    const {
      session: { spreadsheet, timezone },
    } = ctx;
    const currentLocation = timezone
      ? `${timezone.region}/${timezone.city}`
      : undefined;
    const currentTime = currentLocation
      ? formatDateTime(new Date(), currentLocation)
      : undefined;
    await ctx.reply(
      `
Spreadsheet url: ${spreadsheet?.url || '❌'}
Current location: ${currentLocation || '❌'}
Current date: ${currentTime || '❌'}
					`,
      {
        parse_mode: 'HTML',
        reply_markup: menu,
      }
    );
  };

  return { menu, commandMiddleware };
}
