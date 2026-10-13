# ShelfCare architecture

ShelfCare is a mobile-first progressive web app. Its frontend follows ports-and-adapters architecture so it can later move to React Native or native shells without coupling screens to infrastructure.

## Bounded services

| Service | Owns | Contract |
|---|---|---|
| Product tracking | Product inventory, expiry and shelf health inputs | `ProductTrackingService` |
| Barcode | Barcode-to-product lookup only | `BarcodeService` |
| Ingredients | Ingredient risk/profile analysis only | `IngredientService` |
| Routines | Routine definitions and completion events | `RoutineService` |
| Reminders | Reminder preferences and scheduling | `ReminderService` |
| Community | Posts, reactions and social feed | `CommunityService` |
| Insights | Daily insight rotation and saved notebook | `InsightService` |
| Calendar | Daily skin diary, routine history and product usage | `CalendarService` |

The contracts live in `src/services/contracts.ts`. Concrete adapters live under `src/services/local`. `src/services/container.ts` is the composition root and is the only module allowed to construct implementations.

The current prototype uses local adapters so it works offline and requires no account. Each adapter can be replaced independently by an HTTP client when a separately deployed backend is available. UI feature modules must not import concrete service adapters.

## Dependency rule

Dependencies point inward:

1. Domain models have no framework or storage dependencies.
2. Service contracts depend only on domain models and the shared result type.
3. Adapters implement contracts and own persistence/integration details.
4. Feature hooks depend on contracts, never adapters.
5. Screens compose feature hooks and present data.

Cross-service calls are forbidden inside service implementations. Workflows that need more than one service are coordinated by the app layer. For example, barcode lookup returns a candidate; the app asks the user to confirm it; product tracking then saves it.

## Robustness rules

- All service calls return `Result<T>`; expected failures never escape as uncaught exceptions.
- Persisted payloads use a versioned envelope and runtime validation.
- Remote-style calls use a timeout and expose retryable errors.
- Routine interactions use optimistic updates with rollback.
- Product inputs are normalized and validated inside the product service.
- Every list uses stable IDs and immutable domain models.
- Screens provide loading, error and retry states.
- A route error boundary protects the mobile shell.
- No feature may read another feature's storage directly.

## Moving to deployed microservices

Create one independently deployed service per bounded context with its own datastore. Generate typed HTTP adapters implementing the existing contracts and switch implementations only in `createServiceContainer`. Use an API gateway/BFF for authentication, request IDs and rate limiting. Prefer asynchronous events for `ProductAdded`, `ProductExpiryApproaching` and `RoutineCompleted`; avoid synchronous service-to-service chains.

Each deployed service should have health/readiness endpoints, OpenTelemetry traces, structured logs, idempotency keys for writes, contract tests, schema migrations, least-privilege secrets and independent rollback.
