import { CancelToken } from "./CancelToken";

const timeout = (ms: number, ct: CancelToken) => {
  ct.checkCancelled();
  if (ms < 1.5) return new Promise((resolve) => resolve(undefined));
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export { timeout };
