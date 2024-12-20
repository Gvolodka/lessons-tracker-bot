import { Keyboard } from 'grammy';

import { TAppContext, TAppConversation } from '../types';
import { regionsOption, timeZoneNestedOptions } from '../constants';
import { formatDateTime } from '../functions';

async function askTimezone(conversation: TAppConversation, ctx: TAppContext) {
  const regionKeyboard = Keyboard.from(
    regionsOption.map((value) => [value])
  ).resized();
  await ctx.reply(`What is you region?`, {
    reply_markup: regionKeyboard,
  });
  const regionContext = await conversation.waitForHears(regionsOption, {
    otherwise: (ctx) =>
      ctx.reply('Use the buttons!', { reply_markup: regionKeyboard }),
  });

  const region = regionContext.msg?.text;
  if (!region) {
    await ctx.reply(`Something went wrong. Conversation is stopped.`, {
      reply_markup: { remove_keyboard: true },
    });
    throw new Error(`region is empty.`);
  }
  const citiesOption = timeZoneNestedOptions.get(region);
  if (!citiesOption?.length) {
    await ctx.reply(`Something went wrong. Conversation is stopped.`, {
      reply_markup: { remove_keyboard: true },
    });
    throw new Error(`citiesOption by ${region} is empty.`);
  }

  const cityKeyboard = Keyboard.from(
    citiesOption.map((value) => [value])
  ).resized();
  await ctx.reply(`What is you city?`, {
    reply_markup: cityKeyboard,
  });
  const cityContext = await conversation.waitForHears(citiesOption, {
    otherwise: (ctx) =>
      ctx.reply('Use the buttons!', { reply_markup: cityKeyboard }),
  });

  const city = cityContext.msg?.text;
  if (!city) {
    await ctx.reply(`Something went wrong. Conversation is stopped.`, {
      reply_markup: { remove_keyboard: true },
    });
    throw new Error(`city is empty.`);
  }

  return { region, city };
}

export async function setupTimeZone(
  conversation: TAppConversation,
  ctx: TAppContext
) {
  try {
    for (let attempts = 0; attempts < 3; attempts++) {
      const { region, city } = await askTimezone(conversation, ctx);

      const currentDateTime = formatDateTime(new Date(), `${region}/${city}`);
      const approveTimezoneOptions = ['yes', 'no'];
      const approveKeyboard = Keyboard.from([approveTimezoneOptions]).resized();
      await ctx.reply(
        `Ok, you chose is ${region}/${city}. You date is ${currentDateTime}. Is it correct?`,
        {
          reply_markup: approveKeyboard,
        }
      );
      const approveTimezoneContext = await conversation.waitForHears(
        approveTimezoneOptions,
        {
          otherwise: (ctx) =>
            ctx.reply('Use the buttons!', { reply_markup: approveKeyboard }),
        }
      );
      const approveTimezone = approveTimezoneContext.msg?.text;
      console.log('💩 ~ approveTimezone:', approveTimezone);
      if (approveTimezone === 'yes') {
        approveTimezoneContext.session.timezone = {
          region,
          city,
        };
        ctx.reply(`Ok, I saved it.`, {
          reply_markup: { remove_keyboard: true },
        });
        return;
      }
    }
  } catch (err) {
    await ctx.reply(`Stopping conversation.`, {
      reply_markup: { remove_keyboard: true },
    });
    throw new Error(`setupTimeZone error. ${(err as Error).message}`);
  }

  return;
}
