# CHANGELOG.md

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
