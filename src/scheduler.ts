import cron from 'node-cron';

import { Subject } from 'rxjs';

export class AppScheduler {
  public event$ = new Subject<void>();

  constructor(schedule: string) {
    cron.schedule(schedule, () => this.event$.next());
  }
}
