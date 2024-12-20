import { GaxiosError } from 'gaxios';

import { TAppContext, TAppConversation } from '../types';
import { client_email, googleService } from '../..';

const SHEET_INITIALIZATION_MESSAGE = `
1. Please create a new google sheet.
2. Share it with me.
  - Set access to 'Anyone with the link'.
  Or
  - Add my email (${client_email}) to the access list.
3. Past here the link.
`;

function extractSheetId(url: string) {
  const regex = /(?<=spreadsheets\/d\/)[^\/]+/;
  const match = url.match(regex);
  return match ? match[0] : null;
}

export async function setupSpreadsheet(
  conversation: TAppConversation,
  ctx: TAppContext
) {
  await ctx.reply(SHEET_INITIALIZATION_MESSAGE, { parse_mode: 'HTML' });
  for (let attemts = 0; attemts < 3; attemts++) {
    await ctx.reply('Can you send me the link?', { parse_mode: 'HTML' });
    let newContext: TAppContext;
    newContext = await conversation.waitFor('message:text');
    const spreadsheetUrl = newContext.msg?.text || '';
    const spreadsheetId = extractSheetId(spreadsheetUrl);
    if (!spreadsheetId) {
      await ctx.reply('The link is invalid. Try again.', {
        parse_mode: 'HTML',
      });
      continue;
    }

    await ctx.reply(`Checking permissions.`, { parse_mode: 'HTML' });
    try {
      await googleService.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A1',
      });
    } catch (err) {
      if (err instanceof GaxiosError && err.code == '403') {
        await ctx.reply(`I don't have access to that file.`, {
          parse_mode: 'HTML',
        });
      } else {
        await ctx.reply(`Something went wrong.`, { parse_mode: 'HTML' });
      }
      continue;
    }

    newContext.session.spreadsheet = {
      url: spreadsheetUrl,
      id: spreadsheetId,
    };
    console.log('💩 ~ ctx.session.spreadsheet:', ctx.session.spreadsheet);
    await ctx.reply(`Thanks, the link's good, I'll remember it.`, {
      parse_mode: 'HTML',
    });
    return;
  }
  await ctx.reply(`Too many failed attempts. Start again.`, {
    parse_mode: 'HTML',
  });
}
