declare module 'forever' {
  import * as events from 'events';

  export function startDaemon(target: string): events.EventEmitter;
  export function stop(target: string): events.EventEmitter;
}
