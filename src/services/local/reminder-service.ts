import { ok, Result } from "@/src/core/result";
import { Reminder } from "@/src/domain/models";
import { ReminderService } from "@/src/services/contracts";

export class LocalReminderService implements ReminderService {
  private reminders: Reminder[] = [];
  async list(): Promise<Result<readonly Reminder[]>> { return ok(this.reminders); }
  async setExpiryReminder(productId: string, daysBefore: number): Promise<Result<Reminder>> {
    const reminder = { id: `expiry:${productId}`, productId, daysBefore: Math.max(1, daysBefore), enabled: true };
    this.reminders = [reminder, ...this.reminders.filter((item) => item.id !== reminder.id)];
    return ok(reminder);
  }
}
