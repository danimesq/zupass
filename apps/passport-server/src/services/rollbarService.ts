import Rollbar from "rollbar";
import { ApplicationContext } from "../types";
import { logger } from "../util/logger";
import { requireEnv } from "../util/util";

function isError(err: unknown): err is Error {
  return err instanceof Error;
}

/**
 * Takes an error, and continues yielding errors by tracing the chain of
 * '.cause' properties on the error object.
 * Finally yields a "rootCause" object for Rollbar to log as a custom
 * property.
 */
function* causalChain(err: Error): Generator<Error | { rootCause: string }> {
  // There's always at least one error
  yield err;

  // While the error has a cause, yield it and see if there's another one
  while (isError(err.cause)) {
    yield err.cause;
    err = err.cause;
  }

  // The message of the last error in the chain is the root cause.
  // This object will get logged as a custom property on the "item"
  // in Rollbar.
  const rootCause = err.message;
  yield { rootCause };
}

export class RollbarService {
  private rollbar: Rollbar;

  public constructor(
    rollbarToken: string,
    rollbarEnvironmentName: string,
    gitCommitHash: string
  ) {
    this.rollbar = new Rollbar({
      accessToken: rollbarToken,
      captureUncaught: true,
      captureUnhandledRejections: true,
      environment: rollbarEnvironmentName,
      payload: {
        custom: { gitCommitHash }
      }
    });
  }

  public reportError(e: any): void {
    if (isError(e)) {
      this.rollbar.error(...causalChain(e));
    } else {
      this.rollbar.error(e);
    }
  }

  public log(log: string): void {
    this.rollbar.log(log);
  }
}

/**
 * Responsible for error-reporting.
 */
export function startRollbarService(
  context: ApplicationContext
): RollbarService | null {
  let rollbarToken: string;
  let rollbarEnvironmentName: string;

  try {
    rollbarToken = requireEnv("ROLLBAR_TOKEN");
    rollbarEnvironmentName = requireEnv("ROLLBAR_ENV_NAME");
  } catch (e) {
    logger(`[ROLLBAR] not starting, missing env ${e}`);
    return null;
  }

  logger(`[ROLLBAR] starting`);
  const rollbarService = new RollbarService(
    rollbarToken,
    rollbarEnvironmentName,
    context.gitCommitHash
  );

  return rollbarService;
}
