export function getTimeZoneOptions() {
  const timeZoneNestedOptions = new Map<string, Array<string>>();

  for (const timeZone of Intl.supportedValuesOf('timeZone')) {
    // const timeZoneName =
    //   Intl.DateTimeFormat('en', {
    //     timeZone,
    //     timeZoneName: 'shortOffset',
    //   })
    //     .formatToParts()
    //     .find((part) => part.type === 'timeZoneName')?.value || '';
    const [region, cityName] = timeZone.split('/');
    timeZoneNestedOptions.set(region, [
      ...(timeZoneNestedOptions.get(region) || []),
      // `${cityName}/${timeZoneName}`,
      `${cityName}`,
    ]);
  }

  return timeZoneNestedOptions;
}

export function formatDateTime(date?: number | Date, timeZone?: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone,
  }).format(date);
}
