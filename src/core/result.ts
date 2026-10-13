export type AppErrorCode = "validation" | "not_found" | "storage" | "network" | "unavailable";

export type AppError = Readonly<{
  code: AppErrorCode;
  message: string;
  retryable: boolean;
  cause?: unknown;
}>;

export type Result<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; error: AppError }>;

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const err = (code: AppErrorCode, message: string, retryable = false, cause?: unknown): Result<never> => ({
  ok: false,
  error: { code, message, retryable, cause },
});

export async function withTimeout<T>(operation: Promise<Result<T>>, milliseconds = 5000): Promise<Result<T>> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<Result<T>>((resolve) => {
        timer = setTimeout(() => resolve(err("network", "The service took too long to respond.", true)), milliseconds);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
