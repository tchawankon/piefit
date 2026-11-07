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
| `body_goal` | body.js | `bodyGoal` | target weight, kg |
| `yoga` | yoga.js | `yoga` | |
| `ylvl` | yoga.js | `ylvl` | |
| `yfeel` | yoga.js | none (BUG: should be backed up, see CURRENT-SPRINT) | |
| `activity_log_v1` | activity.js | `activities` | outside workouts |
| `habits_cfg` | habits.js | `habits` | import writes via `store.set` in app.js (bypasses the module) |
| `habits_logs` | habits.js | `habitsLogs` | same |
| `habits_inbody` | habits.js | `inbody` | same |
| `challenge_state_v4` | challenge.js | `challenge` | same |
| `nutrition_days_v1` | nutrition.js | `nutrition` | nested `{days, myFoods, customTargets}` via `Nutrition.exportState()` |
| `nutrition_my_foods_v1` | nutrition.js | `nutrition` | |
| `nutrition_custom_targets_v1` | nutrition.js | `nutrition` | |
| `nutri_key` | nutrition.js | none (secret) | Food tab key slot |
| `gemini_key` | nutrition.js | none (secret, legacy) | read only |

## AI key slots

- Each feature writes only its own slot: coach writes `aikey`, Food writes `nutri_key`.
- Food reads `nutri_key`, then `aikey`, then `gemini_key` through one helper, `getStoredKey` in nutrition-ai.js, which also cleans pasted prefixes.
- Clearing a key clears only the feature's own slot. Known gap: see CURRENT-SPRINT.

## Delete all data (`#wipe`, app.js)

It currently clears log, mastered, news, cal, active, coach checks and goals, chat, body entries, yoga, activity and photos.
It does not clear habits, challenge, nutrition, `body_goal` or the AI keys (tracked in CURRENT-SPRINT). A new key must be added here or listed as kept on purpose.
