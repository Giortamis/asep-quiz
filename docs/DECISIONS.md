# ASEPIA — Decision Log

Το `DECISIONS.md` καταγράφει σημαντικές εγκεκριμένες αποφάσεις και κυρίως το γιατί λήφθηκαν. Οι καθημερινοί κανόνες ανήκουν στο `PROJECT_RULES.md`, η πραγματική αρχιτεκτονική στο `ARCHITECTURE.md` και οι αλλαγές στο `CHANGELOG.md`.

Οι ημερομηνίες των αρχικών αποφάσεων δεν έχουν καταγραφεί με επαρκή ακρίβεια και δεν επινοούνται αναδρομικά.

## Decision Index

| ADR ID | Title | Status | Area | Date |
| --- | --- | --- | --- | --- |
| ADR-001 | Cross Platform First | Accepted | Architecture | Not recorded |
| ADR-002 | Lifetime License | Accepted | Business | Not recorded |
| ADR-003 | Login | Accepted | Product / Commercial Infrastructure | Not recorded |
| ADR-004 | Active Session | Accepted | Account / Access | Not recorded |
| ADR-005 | Study Planner | Accepted | Product Architecture | Not recorded |
| ADR-006 | Functional First — Refactor Later | Accepted | Engineering | Not recorded |
| ADR-007 | One Engine Rule | Accepted | Architecture | Not recorded |
| ADR-008 | No Duplicate Rule | Accepted | Product Logic | Not recorded |
| ADR-009 | ApplicationState Gateway | Accepted | State / Compatibility | Not recorded |
| ADR-010 | Smart Test Composition | Accepted | Product Logic | Not recorded |
| ADR-011 | CAT Ability Excludes Time | Accepted | Scoring | Not recorded |

## ADR-001 — Cross Platform First

### Status

Accepted

### Context

Το ASEPIA έχει εγκεκριμένη μακροπρόθεσμη κατεύθυνση για Web, Android και iOS. Ανεξάρτητη business logic ανά πλατφόρμα θα δημιουργούσε ασυνέπεια και πολλαπλό κόστος συντήρησης.

### Decision

Η business logic σχεδιάζεται ώστε να είναι κοινή και επαναχρησιμοποιήσιμη για Web, Android και iOS όπου είναι πρακτικά εφικτό. Οι platform differences περιορίζονται κυρίως στο UI και στις device-specific δυνατότητες.

### Rationale

Η κοινή λογική προστατεύει τη συνέπεια των κανόνων, των δεδομένων και της εμπειρίας καθώς το προϊόν επεκτείνεται σε περισσότερες πλατφόρμες.

### Consequences

- Δεν δημιουργούνται τρεις ανεξάρτητες επιχειρησιακές υλοποιήσεις.
- Device-specific UI επιτρέπεται χωρίς αλλαγή των κοινών product rules.
- Η απόφαση δεν απαιτεί ένα μοναδικό source file ή ήδη υλοποιημένους native clients.

### Related

- `PROJECT_CHARTER.md` — 8.6 Cross-Platform First.
- `docs/PROJECT_RULES.md` — UI / Cross-Platform First.
- `docs/EPICS.md` — EPIC-005.

## ADR-002 — Lifetime License

### Status

Accepted

### Context

Το ASEPIA χρειάζεται σταθερή εμπορική κατεύθυνση πριν σχεδιαστούν licensing και account capabilities.

### Decision

Το εμπορικό μοντέλο είναι εφάπαξ αγορά / lifetime license και όχι subscription. Μία αγορά αντιστοιχεί σε έναν λογαριασμό.

### Rationale

Η επιλογή έχει κλειδωθεί ως βασική επιχειρηματική αρχή του προϊόντος και καθορίζει τον μελλοντικό σχεδιασμό πρόσβασης και licensing.

### Consequences

- Subscription model απαιτεί νέα ρητή Product Owner απόφαση.
- Η απόφαση δεν σημαίνει ότι payment ή license enforcement έχουν ήδη υλοποιηθεί.
- Η μελλοντική εμπορική υποδομή πρέπει να διατηρεί τη σχέση μίας αγοράς με έναν λογαριασμό.

### Related

- `PROJECT_CHARTER.md` — Επιχειρηματικές αρχές.
- `docs/PROJECT_RULES.md` — Επιχειρηματικό Μοντέλο.
- `docs/VISION.md` — Επιχειρηματικό μοντέλο.

## ADR-003 — Login

### Status

Accepted

### Context

Οι μελλοντικές commercial και cloud δυνατότητες χρειάζονται ταυτοποίηση χρήστη για πρόοδο, στατιστικά, Study Plan, Cloud Sync και προστασία άδειας.

### Decision

Login είναι υποχρεωτικό όταν υλοποιηθεί η εμπορική υποδομή.

### Rationale

Ο λογαριασμός είναι το κοινό σημείο σύνδεσης για προστατευμένη πρόσβαση και συγχρονισμό προσωπικών δεδομένων σε μελλοντικές πλατφόρμες.

### Consequences

- Authentication προηγείται της χρήσης account-based Cloud Sync.
- Login, backend και Cloud Sync παραμένουν planned και δεν αποτελούν σημερινές runtime capabilities.
- Η υλοποίηση απαιτεί ξεχωριστό Epic/Sprint/Specification.

### Related

- `PROJECT_CHARTER.md` — Επιχειρηματικές αρχές.
- `docs/EPICS.md` — EPIC-003 και EPIC-004.

## ADR-004 — Active Session

### Status

Accepted

### Context

Ο ίδιος λογαριασμός προβλέπεται να χρησιμοποιείται σε πολλές προσωπικές συσκευές, ενώ απαιτείται σαφής έλεγχος ταυτόχρονης χρήσης.

### Decision

Ένας λογαριασμός μπορεί να εγκαθίσταται σε πολλές προσωπικές συσκευές, αλλά επιτρέπεται μόνο μία ενεργή συνεδρία κάθε φορά. Νέο login αντικαθιστά την προηγούμενη συνεδρία.

### Rationale

Η απόφαση συνδυάζει προσωπική cross-device χρήση με τον κλειδωμένο κανόνα μίας ενεργής πρόσβασης ανά λογαριασμό.

### Consequences

- Η μελλοντική authentication υποδομή πρέπει να διαχειρίζεται session replacement.
- Η αλλαγή ενεργής συνεδρίας πρέπει να γνωστοποιείται καθαρά στον χρήστη.
- Η απόφαση δεν αποτελεί υλοποιημένο session service στην τρέχουσα εφαρμογή.

### Related

- `PROJECT_CHARTER.md` — Επιχειρηματικές αρχές.
- `docs/PROJECT_RULES.md` — Μία ενεργή συνεδρία ανά λογαριασμό.

## ADR-005 — Study Planner

### Status

Accepted

### Context

Το Study Plan πρέπει να οργανώνει τη μελέτη χωρίς να δημιουργεί δεύτερη πηγή ερωτήσεων, επιλογής ή βαθμολόγησης.

### Decision

Το Study Plan είναι orchestration layer. Δεν δημιουργεί ερωτήσεις, δεν βαθμολογεί και δεν διαθέτει δικό του question bank, selection engine ή scoring engine. Χρησιμοποιεί τους υπάρχοντες Registry, CAT και Work Behaviour engines.

### Rationale

Η ανάθεση στους υπάρχοντες engines διατηρεί μία κοινή domain logic και αποφεύγει αποκλίσεις μεταξύ κανονικής χρήσης και Study Plan tasks.

### Consequences

- Τα Study Plan tasks καλούν τα υπάρχοντα entry points.
- Νέα selection/scoring logic μέσα στο Study Plan απαγορεύεται χωρίς νέα απόφαση.
- Η βασική ενοποίηση υλοποιήθηκε στο V14-001.

### Related

- `PROJECT_CHARTER.md` — 8.4 Study Plan ως orchestration layer.
- `docs/PROJECT_RULES.md` — Study Planner.
- `docs/SPRINTS.md` — V14-001.
- `docs/EPICS.md` — EPIC-001.

## ADR-006 — Functional First — Refactor Later

### Status

Accepted

### Context

Η εφαρμογή είναι λειτουργική monolithic vanilla web βάση. Μεγάλος refactor μέσα σε feature work θα αύξανε τον κίνδυνο και θα διεύρυνε το scope πριν σταθεροποιηθεί η συμφωνημένη λειτουργικότητα.

### Decision

Προηγούνται η εγκεκριμένη λειτουργικότητα και η σταθερότητα. Μεγάλος refactor, modularization ή redesign γίνεται μόνο ως ξεχωριστό εγκεκριμένο Sprint.

### Rationale

Μικρές, επαληθεύσιμες αλλαγές περιορίζουν regressions και επιτρέπουν καθαρό validation και review.

### Consequences

- Feature Sprints δεν χρησιμοποιούνται για opportunistic refactor.
- Τεχνικό χρέος καταγράφεται και αξιολογείται χωριστά.
- Refactor απαιτεί συγκεκριμένο πρόβλημα, scope και validation plan.

### Related

- `PROJECT_CHARTER.md` — 8.1 και Διαχείριση τεχνικού χρέους.
- `docs/ARCHITECTURE.md` — Κανόνες μεταβολής.
- `docs/DEVELOPMENT_GUIDE.md` — Codex Implementation Rules.

## ADR-007 — One Engine Rule

### Status

Accepted

### Context

Πολλαπλές οθόνες και orchestration flows χρειάζονται τις ίδιες domain λειτουργίες. Παράλληλοι engines θα δημιουργούσαν διαφορετικούς κανόνες και αποτελέσματα.

### Decision

Η κοινή domain logic επαναχρησιμοποιείται. Δεν δημιουργείται δεύτερος engine όταν υπάρχει κατάλληλος υπάρχων μηχανισμός.

### Rationale

Ένας engine ανά domain διατηρεί συνεπή επιλογή, βαθμολόγηση, state και behavior σε όλες τις entry flows.

### Consequences

- Νέα οθόνη ή planner task αναθέτει την εκτέλεση σε υπάρχον entry point.
- Duplicate domain logic απορρίπτεται ή απαιτεί ξεχωριστή αρχιτεκτονική απόφαση.
- Το V14-001 αποτελεί εφαρμογή του κανόνα.

### Related

- `PROJECT_CHARTER.md` — 8.2 One Engine Rule.
- `docs/PROJECT_RULES.md` — Αρχιτεκτονική.
- `docs/SPRINTS.md` — V14-001.

## ADR-008 — No Duplicate Rule

### Status

Accepted

### Context

Η επανάληψη ερώτησης ή triad μέσα στο ίδιο attempt μειώνει την εγκυρότητα της εξάσκησης όταν υπάρχει επαρκής διαθέσιμος pool.

### Decision

Ερωτήσεις και triads δεν επαναλαμβάνονται μέσα στην ίδια προσπάθεια όταν ο διαθέσιμος pool επιτρέπει uniqueness.

### Rationale

Η μοναδική επιλογή προστατεύει την ποιότητα, την ποικιλία και την αξιοπιστία κάθε attempt.

### Consequences

- Selection mechanisms διατηρούν attempt-level used keys/signatures.
- Σε ανεπαρκή pool εφαρμόζονται οι τεκμηριωμένοι fallbacks χωρίς υπόσχεση αδύνατης μοναδικότητας.
- Ο κανόνας ισχύει σε Registry, Smart Test, CAT, Work Behaviour και delegated Study Plan tasks.

### Related

- `PROJECT_CHARTER.md` — 8.3 No Duplicate Rule.
- `docs/PROJECT_RULES.md` — Question Engine.
- `docs/ARCHITECTURE.md` — Domain engines.

## ADR-009 — ApplicationState Gateway

### Status

Accepted

### Context

Η άμεση, επαναλαμβανόμενη χρήση browser storage από διαφορετικά domain helpers δημιουργούσε ασυνεπή parsing, fallbacks και μεταβολές state.

### Decision

Το persistent browser application state προσπελαύνεται μέσω του κοινού `ApplicationState` gateway. Storage keys και serialized schemas δεν αλλάζουν χωρίς migration Specification.

### Rationale

Το κοινό gateway ενοποιεί ασφαλές JSON parsing, reads, writes, removals και fallbacks, ενώ τα σταθερά contracts προστατεύουν την υπάρχουσα πρόοδο χρήστη.

### Consequences

- Νέο persistent local application state χρησιμοποιεί το κοινό ApplicationState gateway.
- Silent key/schema changes και resets απαγορεύονται.
- Migration απαιτεί backward compatibility και recovery consideration.
- Η ενοποίηση υλοποιήθηκε στο V14-002.

### Related

- `PROJECT_CHARTER.md` — 8.5 Κοινό Application State.
- `docs/ARCHITECTURE.md` — Application state και persistence.
- `docs/SPRINTS.md` — V14-002.

## ADR-010 — Smart Test Composition

### Status

Accepted

### Context

Ο Smart Test χρειάζεται σταθερό, επαναλήψιμο selection policy που αξιοποιεί λάθη και αδιάβαστες ερωτήσεις χωρίς να δημιουργεί δεύτερο test engine.

### Decision

Η σύνθεση είναι 50% wrong, 30% unread και 20% random. Αν pool δεν επαρκεί, το υπόλοιπο συμπληρώνεται από άλλους διαθέσιμους pools. Δεν βασίζεται στις «3 χειρότερες κατηγορίες».

### Rationale

Η σύνθεση δίνει προτεραιότητα στη διόρθωση λαθών και στην κάλυψη νέου υλικού, διατηρώντας μέρος τυχαίας επανάληψης και λειτουργικό fallback.

### Consequences

- Αλλαγή ποσοστών ή πηγών απαιτεί νέα εγκεκριμένη απόφαση/Specification.
- Ο Smart Test παραμένει πάνω στον κοινό Registry/Test pipeline.
- Η πραγματική επιλογή οφείλει να σέβεται και το No Duplicate Rule.

### Related

- `PROJECT_BOOTSTRAP.md` — Smart Test.
- `docs/PROJECT_CONTEXT.md` — Smart Test.
- `docs/ARCHITECTURE.md` — Registry / Question Engine.

## ADR-011 — CAT Ability Excludes Time

### Status

Accepted

### Context

Το CAT χρειάζεται σαφή διάκριση ανάμεσα στην αξιολόγηση Ability και στην πληροφορία διαχείρισης χρόνου.

### Decision

Ο χρόνος δεν επηρεάζει το Ability score. Μπορεί να εμφανίζεται μόνο ως πληροφορία διαχείρισης χρόνου.

### Rationale

Το Ability αξιολογεί την απόδοση του adaptive attempt και δεν πρέπει να μεταβάλλεται από ξεχωριστό timing factor.

### Consequences

- Timing UI/history δεν αλλάζει τον υπολογισμό Ability.
- Προσθήκη χρόνου στο Ability απαιτεί αλλαγή της κλειδωμένης απόφασης.
- Οι συγκρίσεις προσπάθειας διατηρούν το Ability ως βασική βαθμολογία.

### Related

- `PROJECT_BOOTSTRAP.md` — CAT.
- `docs/PROJECT_RULES.md` — CAT Engine.
- `docs/ARCHITECTURE.md` — CAT Engine.
