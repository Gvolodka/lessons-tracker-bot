import { getTimeZoneOptions } from './functions';

export const timeZoneNestedOptions = getTimeZoneOptions();

export const regionsOption = [...timeZoneNestedOptions.keys()];
