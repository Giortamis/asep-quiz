# CHANGELOG.md

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
