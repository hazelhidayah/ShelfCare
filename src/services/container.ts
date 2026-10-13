import { ServiceContainer } from "./contracts";
import { LocalBarcodeService } from "./local/barcode-service";
import { LocalCommunityService } from "./local/community-service";
import { LocalCalendarService } from "./local/calendar-service";
import { LocalIngredientService } from "./local/ingredient-service";
import { LocalInsightService } from "./local/insight-service";
import { LocalProductTrackingService } from "./local/product-service";
import { LocalReminderService } from "./local/reminder-service";
import { LocalRoutineService } from "./local/routine-service";

// Composition root: the only place that knows concrete implementations.
export function createServiceContainer(): ServiceContainer {
  return Object.freeze({
    products: new LocalProductTrackingService(),
    barcode: new LocalBarcodeService(),
    ingredients: new LocalIngredientService(),
    routines: new LocalRoutineService(),
    reminders: new LocalReminderService(),
    community: new LocalCommunityService(),
    insights: new LocalInsightService(),
    calendar: new LocalCalendarService(),
  });
}
