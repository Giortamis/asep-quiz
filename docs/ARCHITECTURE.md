# ASEPIA — Architecture

> **Χαρακτήρας:** Technical Architecture Reference  
> **Κατάσταση:** Active — Living Document  
> **Scope:** Η πραγματική, τρέχουσα υλοποίηση του repository

Το παρόν έγγραφο περιγράφει πώς είναι δομημένο και πώς λειτουργεί σήμερα το ASEPIA. Δεν αποτελεί roadmap, πρόταση refactor ή περιγραφή της μελλοντικής εμπορικής υποδομής. Σε περίπτωση απόκλισης υπερισχύει ο πραγματικός κώδικας.

## 1. Αρχιτεκτονική σύνοψη

Το ASEPIA είναι client-side single-page web application χωρίς framework, bundler, backend ή build step.

```text
Browser
  ├── index.html        DOM, screens και controls
  ├── style.css         visual system και responsive layout
  ├── app.js            navigation, engines, state και rendering
  ├── data/*.json       Registry και Work Behaviour datasets
  └── Web Storage       τοπική πρόοδος και προτιμήσεις
```

Η εφαρμογή σερβίρεται ως στατικά αρχεία μέσω HTTP. Το `app.js` λειτουργεί στο global browser scope. Τα screens συνυπάρχουν στο DOM και η πλοήγηση εμφανίζει το ενεργό section ενώ αποκρύπτει τα υπόλοιπα.

## 2. Όρια και ευθύνες αρχείων

| Περιοχή | Ευθύνη |
| --- | --- |
| `index.html` | Δομή, application screens, controls, help texts και σύνδεση assets |
| `style.css` | Styling, component states και desktop/tablet/mobile layout |
| `app.js` | Initialization, navigation, data loading, engines, rendering, scoring και persistence orchestration |
| `data/categories.json` | Registry κατάλογος κατηγοριών και δηλωμένα totals |
| `data/{category-id}.json` | Ερωτήσεις ανά Registry κατηγορία |
| `data/work_behaviour.json` | Work Behaviour triads και metadata τράπεζας |
| `tools/validate-data.js` | Έλεγχος JSON contracts, IDs και totals |
| `tools/smoke-tests.js` | Headless browser έλεγχος βασικών flows και shared state |

Η μονολιθική μορφή είναι η τρέχουσα πραγματικότητα, όχι άδεια για ανεξέλεγκτη σύζευξη. Framework, build system, backend ή μεγάλος διαχωρισμός modules απαιτεί ξεχωριστό εγκεκριμένο Specification.

## 3. Runtime lifecycle

1. Ο browser φορτώνει `index.html`, `style.css` και `app.js`.
2. Η `init()` φορτώνει το `data/categories.json` με `fetch` και δημιουργεί το category map.
3. Αρχικοποιούνται category controls, Smart Welcome και home metrics.
4. Οι ενέργειες χρήστη καλούν τα αντίστοιχα global entry points.
5. Κάθε engine φορτώνει ή παράγει question pool, ενημερώνει το DOM και καταγράφει πρόοδο μέσω `ApplicationState`.
6. Το `showOnly()` ελέγχει την ενεργή οθόνη και το `goHome()` ανανεώνει την αρχική προβολή.

Επειδή τα datasets φορτώνονται με `fetch`, απαιτείται HTTP server και όχι άνοιγμα ως `file://`.

## 4. Domain engines

### Registry / Question Engine

Ο κοινός Registry pipeline υποστηρίζει Study, Registry Test, Quick Test, Smart Test, Favorites, Wrongs και Unread.

- Το Study παρέχει reveal και πλοήγηση.
- Τα tests κλειδώνουν την απάντηση, υπολογίζουν score και ενημερώνουν statistics.
- Το Smart Test συνθέτει pools με 50% wrong, 30% unread και 20% random, με fallback στους διαθέσιμους pools.
- Τα recent δεδομένα προτιμούν μη πρόσφατες ερωτήσεις, χωρίς απόλυτη εγγύηση όταν ο pool δεν επαρκεί.
- Η μοναδικότητα μέσα σε attempt βασίζεται στο question key `category:id`.

### CAT Engine

Το CAT δημιουργεί runtime ερωτήσεις από το `CAT_GENERATORS` και διατηρεί attempt state για difficulty, score, timing, responses και category statistics.

- Το Practice εκτελεί επιλεγμένο πλήθος ερωτήσεων.
- Το Simulation εκτελεί adaptive attempt με συνολικό χρονικό όριο.
- Το Ability είναι η βασική αξιολόγηση και ο χρόνος δεν το επηρεάζει.
- Question signatures αποτρέπουν duplicates μέσα στην ίδια προσπάθεια.
- Το history διατηρεί έως 100 εγγραφές.

### Work Behaviour Engine

Το Work Behaviour φορτώνει το `data/work_behaviour.json` και χρησιμοποιεί κοινό attempt flow για Practice και Simulation. Κάθε triad έχει τρία statements. Τα seen IDs μειώνουν άμεσες επαναλήψεις όταν επαρκεί ο pool, ενώ το history διατηρεί έως 50 εγγραφές.

### Study Plan

Το Study Plan είναι orchestration layer. Υπολογίζει ημερήσιους στόχους και αναθέτει execution στα υπάρχοντα Registry, CAT και Work Behaviour entry points. Δεν έχει δικό του dataset, selection engine ή scoring logic.

### Smart Welcome και Help

Το Smart Welcome παράγει greeting βάσει ώρας, προαιρετικό stored name και motivational message χωρίς άμεση επανάληψη. Είναι presentation component, όχι dashboard. Το Help είναι στατικό navigation/content module.

## 5. Data contracts

Το `data/categories.json` είναι array από categories. Κάθε εγγραφή έχει μοναδικό `id` και `count` ίσο με το μήκος του αντίστοιχου `data/{id}.json`.

```json
{
  "id": "unique-id-within-category",
  "question": "Κείμενο ερώτησης",
  "answers": ["Απάντηση Α", "Απάντηση Β"],
  "correct": 0
}
```

Το `correct` είναι zero-based index. Το runtime προσθέτει προσωρινά category context. Το Work Behaviour contract απαιτεί array `triads`, μοναδικά IDs, ακριβώς τρία statements ανά triad και `bank_summary.triads` ίσο με το πραγματικό πλήθος.

Οι αλλαγές δεδομένων διατηρούν UTF-8 JSON, σταθερά IDs και συμβατά schemas. Αλλαγή schema ή ID strategy απαιτεί migration plan.

## 6. Application state και persistence

Το `ApplicationState` είναι το μοναδικό gateway για reads, writes και removals από `localStorage`, με ασφαλές JSON parsing και typed fallbacks.

| Πεδίο | Storage key |
| --- | --- |
| Favorites / Wrongs | `asepFavorites`, `asepWrongs` |
| Aggregate / question statistics | `asepStats`, `asepQuestionStatsV1` |
| Recent Registry / CAT | `asepRecentRegistryQuestionsV1`, `asepRecentCatQuestionsV1` |
| CAT history | `asepCatHistoryV139` |
| Work history / seen triads | `asepWorkBehaviourHistory`, `asepWorkBehaviourSeen` |
| Study Plan / log | `asepStudyPlanV14`, `asepStudyPlanLogV14` |
| Test categories / optional name | `asepTestCategories`, `asepUserName` |

Το τελευταίο welcome message είναι session-only presentation state στο `sessionStorage`. Storage keys και serialized schemas είναι compatibility contracts και δεν αλλάζουν χωρίς εγκεκριμένο migration Specification.

## 7. UI και navigation

- Τα screens βρίσκονται στο `index.html` και αναγνωρίζονται από σταθερά IDs.
- Το `hidden` state ελέγχει ποιο screen είναι ενεργό.
- Render functions ενημερώνουν συγκεκριμένα DOM targets.
- Το responsive layout ανήκει στο `style.css`.
- DOM IDs, event bindings και selectors είναι runtime interfaces. Αλλαγή τους απαιτεί ταυτόχρονο έλεγχο HTML, JavaScript, CSS και smoke tests.

Δεν υπάρχει router, component framework ή template engine.

## 8. Κανόνες μεταβολής

1. **One Engine Rule:** επαναχρησιμοποίηση υπάρχουσας domain logic.
2. **No Duplicate Rule:** αποφυγή επαναλήψεων όταν επαρκεί ο pool.
3. **State boundary:** κάθε persistent local state περνά από `ApplicationState`.
4. **Stable contracts:** IDs, schemas, storage keys και DOM interfaces δεν αλλάζουν σιωπηρά.
5. **Functional First — Refactor Later:** refactor δεν διευρύνει το εγκεκριμένο scope.
6. **Cross-Platform First:** business logic όσο γίνεται ανεξάρτητη από device presentation.
7. **No unapproved dependencies:** νέα τεχνολογία μόνο μέσω εγκεκριμένου Specification.

## 9. Quality boundaries

- `npm run validate`: JSON parsing, mappings, IDs, answer indexes, triads και totals.
- `npm run smoke`: startup και βασικά Registry, CAT, Work, Statistics, Study Plan, Welcome και state flows.
- `npm test`: πλήρης ακολουθία.

Duplicate question texts είναι warnings, επειδή μπορεί να έχουν διαφορετικές απαντήσεις. Structural errors αποτυγχάνουν το validation. Οι automated έλεγχοι δεν αντικαθιστούν manual responsive και content review όταν επηρεάζεται UI.

## 10. Εκτός τρέχουσας αρχιτεκτονικής

Δεν αποτελούν υλοποιημένα runtime components: authentication, backend/API, cloud sync, license enforcement, active-session service, native clients, production deployment pipeline και framework-based modular architecture. Απαιτούν νέα Specifications και, όπου χρειάζεται, ADRs.

## Related Documentation

- `docs/DEVELOPMENT_GUIDE.md` — πρακτική διαδικασία αλλαγών και validation.
- `docs/PROJECT_CONTEXT.md` — συνολική εικόνα προϊόντος και modules.
- `docs/PROJECT_RULES.md` — κλειδωμένοι πρακτικοί κανόνες.
- `docs/DECISIONS.md` — εγκεκριμένες αποφάσεις.
- `PROJECT_CHARTER.md` — αρχές, scope και διακυβέρνηση.
