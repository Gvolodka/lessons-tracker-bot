import { Context, SessionFlavor } from 'grammy';

import {
  type Conversation,
  type ConversationFlavor,
} from '@grammyjs/conversations';

export type TSessionData = {
  spreadsheet: {
    url: string;
    id: string;
  } | null;
  timezone: {
    region: string;
    city: string;
  } | null;
};

export type TAppContext = Context &
  ConversationFlavor &
  SessionFlavor<TSessionData>;

export type TAppConversation = Conversation<TAppContext>;
