import { err, ok, Result } from "@/src/core/result";

type Envelope<T> = { version: number; data: T };

export class VersionedStorage<T> {
  constructor(
    private readonly key: string,
    private readonly version: number,
    private readonly fallback: T,
    private readonly validate: (value: unknown) => value is T,
  ) {}

  read(): Result<T> {
    if (typeof window === "undefined") return ok(this.fallback);
    try {
      const raw = window.localStorage.getItem(this.key);
      if (!raw) return ok(this.fallback);
      const parsed: unknown = JSON.parse(raw);
      if (!this.isEnvelope(parsed) || parsed.version !== this.version || !this.validate(parsed.data)) {
        return err("storage", "Saved data was incompatible, so a safe default was loaded.");
      }
      return ok(parsed.data);
    } catch (cause) {
      return err("storage", "Saved data could not be read.", false, cause);
    }
  }

  write(data: T): Result<T> {
    if (typeof window === "undefined") return ok(data);
    try {
      const envelope: Envelope<T> = { version: this.version, data };
      window.localStorage.setItem(this.key, JSON.stringify(envelope));
      return ok(data);
    } catch (cause) {
      return err("storage", "Your change could not be saved on this device.", true, cause);
    }
  }

  private isEnvelope(value: unknown): value is Envelope<unknown> {
    return typeof value === "object" && value !== null && "version" in value && "data" in value;
  }
}
