# ASEPIA – Epic Registry

## Εισαγωγή

Το Epic Registry αποτελεί τον κεντρικό χάρτη των μεγάλων δυνατοτήτων του ASEPIA. Καταγράφει το εύρος και την κατάσταση κάθε στρατηγικής περιοχής του προϊόντος.

## Τι είναι Epic

Ένα Epic είναι μια μεγάλη λειτουργική ή προϊοντική περιοχή που απαιτεί περισσότερα από ένα επιμέρους βήματα για να ολοκληρωθεί. Περιγράφει την κατεύθυνση και τον επιδιωκόμενο σκοπό, όχι συγκεκριμένη υλοποίηση.

## Πώς συνδέεται με τα Sprints

Το Vision ορίζει τον συνολικό προορισμό του ASEPIA. Τα Epics οργανώνουν τις μεγάλες δυνατότητες που υπηρετούν αυτό το όραμα και τα Sprints παραδίδουν συγκεκριμένα, ελεγχόμενα τμήματα ενός Epic.

```text
VISION
  ↓
EPICS
  ↓
SPRINTS
```

## Status Legend

- **Planned:** Έχει καταγραφεί αλλά δεν έχει ξεκινήσει.
- **In Progress:** Υλοποιείται μέσω ενεργών ή επόμενων Sprints.
- **Completed:** Ο στόχος και το συμφωνημένο scope έχουν ολοκληρωθεί.
- **On Hold:** Έχει τεθεί προσωρινά σε αναμονή.

## EPIC-001 — Study Planner

- **ID:** EPIC-001
- **Title:** Study Planner
- **Status:** Completed
- **Description:** Προσωπικός προγραμματισμός μελέτης που αξιοποιεί τους υπάρχοντες engines και οργανώνει ημερήσιους στόχους και πρόοδο.

## EPIC-002 — Smart Welcome Engine

- **ID:** EPIC-002
- **Title:** Smart Welcome Engine
- **Status:** Completed
- **Description:** Η «Έξυπνη Κάρτα Υποδοχής» αποτελεί τη ζωντανή προσωπικότητα του ASEPIA. Δεν είναι κουμπί ή dashboard, αλλά ένα δυναμικό component που εξελίσσεται μαζί με την εφαρμογή.

### Μελλοντικές δυνατότητες

- Χαιρετισμός ανά ώρα
- Εξατομικευμένα μηνύματα
- Μηνύματα ενθάρρυνσης
- Study reminders
- Daily streak
- Progress messages
- Ανακοινώσεις εφαρμογής

## EPIC-003 — Authentication

- **ID:** EPIC-003
- **Title:** Authentication
- **Status:** Planned
- **Description:** Ασφαλής ταυτοποίηση και διαχείριση λογαριασμού χρήστη.

## EPIC-004 — Cloud Sync

- **ID:** EPIC-004
- **Title:** Cloud Sync
- **Status:** Planned
- **Description:** Συγχρονισμός προόδου, ρυθμίσεων και δεδομένων χρήστη μεταξύ συσκευών.

## EPIC-005 — Android / iOS

- **ID:** EPIC-005
- **Title:** Android / iOS
- **Status:** Planned
- **Description:** Διάθεση του ASEPIA σε Android και iOS με κοινή κατεύθυνση προϊόντος και εμπειρία χρήσης.

## EPIC-007 — Project Governance & Documentation

- **ID:** EPIC-007
- **Title:** Project Governance & Documentation
- **Status:** Completed
- **Description:** Δημιουργία πλήρους, συνεπούς και επαναχρησιμοποιήσιμου συστήματος τεκμηρίωσης και διακυβέρνησης, ώστε το ASEPIA να μπορεί να συνεχίζεται από νέο developer ή AI χωρίς εξάρτηση από προηγούμενες συνομιλίες.

Το Epic:

- δεν προσθέτει λειτουργίες στην εφαρμογή,
- δεν αλλάζει business logic,
- δεν αλλάζει UI,
- δεν περιλαμβάνει refactor,
- υλοποιείται μέσω διαδοχικών documentation Sprints.
