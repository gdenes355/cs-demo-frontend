import { CancelledError } from "./CancelledError";

export class CancelToken {
  constructor() {
    this.cancelled = false;
  }
  cancel() {
    this.cancelled = true;
  }
  isCancelled() {
    return this.cancelled;
  }

  checkCancelled() {
    if (this.cancelled) {
      throw new CancelledError();
    }
  }

  private cancelled: boolean;
}
