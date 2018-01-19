import { Observable } from '../Observable';
import { IScheduler } from '../Scheduler';
import { Subscription } from '../Subscription';

export function fromPromise<T>(input: Promise<T>, scheduler: IScheduler) {
  if (!scheduler) {
    return new Observable<T>(subscriber => {
      input.then(value => {
        subscriber.next(value);
        subscriber.complete();
      }, err => subscriber.error(err));
    });
  } else {
    return new Observable<T>(subscriber => {
      const sub = new Subscription();
      sub.add(scheduler.schedule(() => input.then(
        value => {
          sub.add(scheduler.schedule(() => {
            subscriber.next(value);
            sub.add(scheduler.schedule(() => subscriber.complete()));
          }));
        },
        err => {
          sub.add(scheduler.schedule(() => subscriber.error(err)));
        }
      )));
      return sub;
    });
  }
}
