import { Calendar } from '../../calendar';

export class FakeCalendar implements Calendar {
  private _isInWindow: boolean = false;
  _setIsInWindow(value: boolean) {
    this._isInWindow = value;
  }

  isInShutdownWindow() {
    return this._isInWindow;
  }
}
