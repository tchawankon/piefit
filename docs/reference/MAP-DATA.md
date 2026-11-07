# MAP: user data, backup, delete

All keys go through `store` (app.js top) with the localStorage prefix `ringfit.`, which must never be renamed. Progress photos are in IndexedDB `piefit` (body.js) and are not part of the backup.

## Adding a storage key

1. Read and write it only in the owning module, through `store`.
2. Add a row to the table below.
3. If it is user data, add it to the backup:
   - Export: the module's `exportState()`, or the object in `exportData()` in app.js.
   - Import: the module's `importState(d)`, or `importData()`.
   - Export and import use the same field name.
   - Validate types on import.
4. Make "Delete all data" (`#wipe` in app.js) clear it, or note why not.
5. Never rename an existing key or backup field without a migration. Old backups carry the field names.

Checks: `storage-keys` (code keys = table keys) and `backup-fields` (each backup field is exported and imported).

## Storage keys

| Key | Owner | Backup field | Notes |
|---|---|---|---|
| `log` | app.js | `log` | strength sets; import validates each entry |
| `mastered` | app.js | `mastered` | progression steps unlocked |
| `news` | app.js | `news` | |
| `targets` | app.js | `targets` | weekly sets per muscle |
| `cal` | app.js | `cal` | calibration results |
| `settings` | app.js | `settings` | import accepts only keys present in `SET_DEFAULT`, so a new setting goes there |
| `active` | app.js | none (in-progress workout) | |
| `mode` | app.js | none (legacy, read once for migration) | |
| `venue` | app.js | none (legacy, read once for migration) | |
| `profile` | coach.js | `profile` | exported with `aiOn:false` |
| `checks` | coach.js | `checks` | readiness check-ins |
| `goals` | coach.js | `goals` | |
| `chat` | coach.js | none (AI chat history, device-only) | |
| `aikey` | coach.js | none (secret) | Claude key, shared read by the Food tab |
| `body` | body.js | `body` | weigh-ins |
| `body_goal` | body.js | `bodyGoal` | target weight, kg; absent in old backups: current goal kept |
| `yoga` | yoga.js | `yoga` | |
| `ylvl` | yoga.js | `ylvl` | |
| `yfeel` | yoga.js | `yfeel` | absent in old backups: current value kept |
| `activity_log_v1` | activity.js | `activities` | outside workouts |
| `habits_cfg` | habits.js | `habits` | via Habits.exportState/importState (type-checked) |
| `habits_logs` | habits.js | `habitsLogs` | via Habits.exportState/importState |
| `habits_inbody` | habits.js | `inbody` | via Habits.exportState/importState |
| `challenge_state_v4` | challenge.js | `challenge` | via Challenge.exportState/importState (type-checked) |
| `nutrition_days_v1` | nutrition.js | `nutrition` | nested `{days, myFoods, customTargets}` via `Nutrition.exportState()` |
| `nutrition_my_foods_v1` | nutrition.js | `nutrition` | |
| `nutrition_custom_targets_v1` | nutrition.js | `nutrition` | |
| `nutri_key` | nutrition.js | none (secret) | Food tab key slot |
| `gemini_key` | nutrition-ai.js | none (secret, legacy) | read by getStoredKey; cleared by clearAiKeys in app.js |

## AI key slots

- Saving: coach writes `aikey`; Food writes `nutri_key`, and a Claude key saved in Food is also written to `aikey` (shared).
- Reading: Food tries `nutri_key`, then `aikey`, then `gemini_key` through one helper, `getStoredKey` in nutrition-ai.js, which also cleans pasted prefixes.
- Removing: every "remove key" button and the Delete-all option call `clearAiKeys()` in app.js, which clears all three slots (owner decision 2026-11-07).

## Delete all data (`#wipe`, app.js)

It clears everything in the table except: `settings` and `targets` (preferences), the coach `profile`, and the AI keys. The keys are cleared only when the user ticks the "also remove AI keys" box.
It does this through each module's `clear()` (`Yoga`, `Activity`, `Habits`, `Challenge`, `Nutrition`) plus app.js state, `Body.goal`, and IndexedDB photos.
A new key must be cleared here or listed as kept on purpose.
