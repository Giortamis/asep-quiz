# CHANGELOG.md

## DOC-008 — Decision Log & Roadmap

### Documentation
- Ενισχύθηκε το `docs/DECISIONS.md`.
- Καταγράφηκαν rationale και consequences για σημαντικές ήδη εγκεκριμένες αποφάσεις.
- Δημιουργήθηκε το `docs/ROADMAP.md`.
- Καταγράφηκαν μόνο τα επίσημα Epics και οι τεκμηριωμένες dependencies.
- Δεν δημιουργήθηκε EPIC-006 ή νέο product commitment.

---

## DOC-007 — UI & Brand Governance

### Documentation
- Δημιουργήθηκε το `docs/UI_GUIDELINES.md`.
- Καταγράφηκαν responsive, layout, navigation και Design Freeze rules.
- Δημιουργήθηκε το `docs/BRAND_GUIDELINES.md`.
- Καταγράφηκε η υπάρχουσα branding direction και το pending official logo asset.
- Δεν δημιουργήθηκε ή τροποποιήθηκε branding asset.

---

## DOC-006 — AI Governance

### Documentation
- Δημιουργήθηκε το `docs/AI_RULES.md`.
- Καθορίστηκαν οι ρόλοι και τα όρια ChatGPT και Codex.
- Καταγράφηκαν startup, source-of-truth, blocker και validation rules.
- Προστέθηκαν reusable templates για implementation και Technical Review.
- Ενημερώθηκε το documentation index.

---

## DOC-005 — Architecture & Development Workflow

### Documentation
- Δημιουργήθηκε το `docs/ARCHITECTURE.md` ως τεχνική αποτύπωση της τρέχουσας υλοποίησης.
- Δημιουργήθηκε το `docs/DEVELOPMENT_GUIDE.md` με setup, roles, standard flow, implementation/review rules, Git delivery, validation και Completion Report template.
- Καταγράφηκαν οι υπάρχοντες engines, τα data και persistence contracts και τα architecture boundaries χωρίς αλλαγή application scope.
- Ενημερώθηκαν το documentation index, το project context, το repository README και το Sprint Registry.

---

## DOC-004 — Core Project Context

### Documentation
- Δημιουργήθηκε το `docs/PROJECT_CONTEXT.md`.
- Καταγράφηκαν η ταυτότητα, τα modules, η τεχνική βάση και η φιλοσοφία του ASEPIA.
- Διαχωρίστηκαν σαφώς implemented, in-progress και planned δυνατότητες.
- Ενημερώθηκαν οι documentation references.

---

## DOC-003 — Documentation Inventory & Information Architecture

### Documentation governance
- Δημιουργήθηκε το `docs/README.md` ως κεντρικός χάρτης της τεκμηρίωσης.
- Καθορίστηκε η σειρά ανάγνωσης και η ιεραρχία πηγών αλήθειας.
- Καταγράφηκαν οι αρμοδιότητες των υπαρχόντων και προγραμματισμένων εγγράφων.
- Προστέθηκε το EPIC-007.
- Διορθώθηκε η ονοματολογία ASEPIA στα `PROJECT_RULES.md` και `VISION.md`.
- Διευκρινίστηκε ότι το `PROJECT_CHARTER.md` είναι το ανώτατο κανονιστικό έγγραφο.

---

## V14-004 — Smart Welcome Engine Phase 2

### Adaptive Desktop Hero
- Η desktop Hero Card μετατράπηκε σε κεντραρισμένο editorial Hero Section χωρίς περίγραμμα, background ή σκιά.
- Διατηρήθηκε η ίδια θέση στο desktop grid και προστέθηκε περισσότερος λευκός χώρος.
- Προστέθηκε διακριτικό προσωρινό ASEPIA wordmark, με σαφή ένδειξη αντικατάστασης όταν παραδοθεί το επίσημο logo asset.
- Τα tablet και mobile Hero Card styles παρέμειναν αμετάβλητα.

---

## V14-003 — Smart Welcome Engine Phase 1

### Hero Card MVP
- Προστέθηκε ανεξάρτητη, μη διαδραστική Hero Card στην Αρχική οθόνη.
- Προστέθηκαν τέσσερις χαιρετισμοί ανά ώρα και προαιρετική εμφάνιση αποθηκευμένου ονόματος.
- Προστέθηκαν 24 σύντομα ελληνικά motivational messages χωρίς συνεχόμενη επανάληψη.
- Η Hero Card συμπληρώνει το desktop grid και προηγείται των menu cards σε tablet/mobile.

### Epic
- Το EPIC-002 — Smart Welcome Engine τέθηκε σε κατάσταση `In Progress`.

---

## V14-002 — Application State Unification

### State management
- Προστέθηκε κοινός `ApplicationState` gateway για όλους τους Engines.
- Ενοποιήθηκαν JSON parsing, fallbacks, writes και removals χωρίς αλλαγή των υπαρχόντων storage keys ή schemas.
- Αφαιρέθηκαν οι επαναλαμβανόμενες άμεσες προσπελάσεις στο `localStorage` από τα domain helpers.
- Διατηρήθηκε ο διαχωρισμός μόνο για state με διαφορετική σημασία, όπως CAT history, Work profile και Study Plan progress.

### Έλεγχοι
- Επιβεβαιώθηκε ότι answered, wrongs, favorites, statistics, recents και progress προσπελαύνονται μέσω του κοινού state gateway.

---

## V14-001 — Study Plan Engine Unification

### Engine unification
- Το Study Plan Registry αναθέτει πλέον την εκτέλεση στο υπάρχον Study pipeline.
- Τα tasks νέων ερωτήσεων και επανάληψης χρησιμοποιούν τα κοινά `unread` και `wrongs` filters.
- Τα Work Behaviour tasks αναθέτουν την εκτέλεση στο υπάρχον Work Practice entry point.
- Αφαιρέθηκε η ανεξάρτητη σύνθεση και fallback λογική ερωτήσεων του Study Plan.

### Έλεγχοι
- Προστέθηκε smoke coverage για μοναδικές ερωτήσεις, shared appearances και review filters μέσα από το Study Plan.

---

## DOC-002 — Epic Registry

### Τεκμηρίωση
- Προστέθηκε το `docs/EPICS.md` ως κεντρικό μητρώο των μεγάλων δυνατοτήτων του ASEPIA.
- Καταγράφηκαν τα αρχικά Epics και η κατάστασή τους.
- Τεκμηριώθηκε η οργανωτική αλυσίδα `VISION → EPICS → SPRINTS`.
- Ενημερώθηκαν το README και το Sprint Registry.

---

## FS-3 — Responsive Layout & Adaptive UI

### Responsive layout
- Αυξήθηκε το αξιοποιήσιμο πλάτος της εφαρμογής σε desktop χωρίς αλλαγή του UI concept.
- Ενοποιήθηκε το responsive grid σε τρεις βαθμίδες: desktop, tablet και mobile.
- Βελτιώθηκαν οι αναλογίες, τα κενά και τα paddings των καρτών ανά viewport.
- Προστέθηκε προστασία από overflow σε grids, κείμενα και σύνθετα στοιχεία.

### Έλεγχοι
- Επιβεβαιώθηκε η απουσία horizontal page overflow σε desktop, tablet και mobile.
- Επαληθεύτηκαν οι υπάρχουσες λειτουργίες με τα FS-2 quality checks.

---

## FS-2 — Data Validation and Smoke Tests

### Εργαλεία ποιότητας
- Προστέθηκε validation για JSON, IDs, κείμενα ερωτήσεων, correct indexes και category totals.
- Προστέθηκαν browser smoke tests για τις βασικές λειτουργίες της εφαρμογής.
- Προστέθηκε ενιαία εντολή εκτέλεσης όλων των quality checks.

### Τεκμηρίωση
- Προστέθηκαν στο README οδηγίες εγκατάστασης και χρήσης των εργαλείων.
- Ενημερώθηκε το Sprint Registry με την ολοκλήρωση του FS-2.

---

## DOC-001 — Sprint Registry

### Τεκμηρίωση
- Προστέθηκε το `docs/SPRINTS.md` ως κεντρικό μητρώο ολοκληρωμένων, προγραμματισμένων και ενεργών sprints.
- Προστέθηκε επαναχρησιμοποιήσιμο sprint template.

---

## FS-1 — Foundation Sprint

### Καθαρισμός βάσης
- Αφαιρέθηκε το ανενεργό legacy snapshot V13.x από τον φάκελο `data`.
- Αφαιρέθηκαν δύο μη χρησιμοποιούμενες JavaScript functions.
- Αφαιρέθηκαν μη χρησιμοποιούμενοι CSS selectors.

### Δεδομένα
- Το συνολικό πλήθος ερωτήσεων υπολογίζεται πλέον δυναμικά από το `data/categories.json`.
- Καταργήθηκαν όλες οι hardcoded χρήσεις του παλιού συνολικού αριθμού.

### Τεκμηρίωση
- Επεκτάθηκε το README με περιγραφή, τεχνολογία, οδηγίες εκτέλεσης και δομή φακέλων.

---

## V14 (Design Freeze)

### Αρχιτεκτονική
- Cross Platform First
- Lifetime License
- Login Architecture
- Single Active Session

### Νέα Modules
- Study Planner
- Βοήθεια
- Οδηγός Εφαρμογής

### UI
- Responsive Redesign
- Desktop / Tablet / Mobile Layout

### Documentation
- PROJECT_RULES.md
- DECISIONS.md
- VISION.md
- CHANGELOG.md

---

## V13.9
- Ability Score
- Smart Engine
- Responsive menu improvements
- Internal statistics
