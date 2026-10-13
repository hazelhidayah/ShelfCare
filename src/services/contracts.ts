import { Result } from "@/src/core/result";
import { BarcodeMatch, CalendarCheckIn, CalendarDay, CommunityPost, IngredientFinding, Insight, NewProduct, Product, Reminder, RoutineStep } from "@/src/domain/models";

// Every bounded context owns its contract. UI code never imports an adapter.
export interface ProductTrackingService {
  list(): Promise<Result<readonly Product[]>>;
  add(input: NewProduct): Promise<Result<Product>>;
  setFavourite(productId: string, favourite: boolean): Promise<Result<Product>>;
}

export interface BarcodeService {
  lookup(barcode: string): Promise<Result<BarcodeMatch>>;
}

export interface IngredientService {
  analyze(ingredients: readonly string[]): Promise<Result<readonly IngredientFinding[]>>;
}

export interface RoutineService {
  getToday(): Promise<Result<readonly RoutineStep[]>>;
  toggle(stepId: string): Promise<Result<readonly RoutineStep[]>>;
  replace(steps: readonly RoutineStep[]): Promise<Result<readonly RoutineStep[]>>;
}

export interface ReminderService {
  list(): Promise<Result<readonly Reminder[]>>;
  setExpiryReminder(productId: string, daysBefore: number): Promise<Result<Reminder>>;
}

export interface CommunityService {
  feed(): Promise<Result<readonly CommunityPost[]>>;
  like(postId: string): Promise<Result<CommunityPost>>;
}

export interface InsightService {
  getDaily(date: Date): Promise<Result<Insight>>;
  listFavourites(): Promise<Result<readonly Insight[]>>;
  setFavourite(insightId: string, favourite: boolean): Promise<Result<Insight>>;
}

export interface CalendarService {
  getWeek(): Promise<Result<readonly CalendarDay[]>>;
  getDay(date: string): Promise<Result<CalendarDay>>;
  saveCheckIn(input: CalendarCheckIn): Promise<Result<CalendarDay>>;
}

export type ServiceContainer = Readonly<{
  products: ProductTrackingService;
  barcode: BarcodeService;
  ingredients: IngredientService;
  routines: RoutineService;
  reminders: ReminderService;
  community: CommunityService;
  insights: InsightService;
  calendar: CalendarService;
}>;
