# ASEPIA — Project Context

> **Χαρακτήρας:** Core Project Overview  
> **Κατάσταση:** Active — Living Document  
> **Product:** ASEPIA  
> **Repository:** `Giortamis/asep-quiz`

Το παρόν αρχείο αποτελεί τη συνολική, ανθρώπινα αναγνώσιμη περιγραφή του ASEPIA. Παρουσιάζει το προϊόν, τα βασικά modules, την τεχνική βάση και τη φιλοσοφία ανάπτυξης. Δεν αποτελεί live Sprint tracker· η τρέχουσα κατάσταση εργασιών καταγράφεται στο `PROJECT_BOOTSTRAP.md`, στο `docs/SPRINTS.md` και στο `docs/CHANGELOG.md`.

## Τι είναι το ASEPIA

Το ASEPIA είναι εφαρμογή προετοιμασίας για τον Πανελλήνιο Γραπτό Διαγωνισμό ΑΣΕΠ. Δεν είναι απλό quiz. Στόχος του είναι να συνδυάζει σε ένα ενιαίο περιβάλλον:

- μελέτη,
- εξάσκηση,
- προσομοίωση,
- έξυπνη επανάληψη,
- παρακολούθηση προόδου,
- οργάνωση μελέτης.

## Πρόβλημα που λύνει

Το ASEPIA επιχειρεί να μειώσει:

- την αποσπασματική μελέτη,
- την άσκοπη επανάληψη,
- τη δυσκολία οργάνωσης της ύλης,
- την αδυναμία αντικειμενικής παρακολούθησης της προόδου,
- την ανάγκη χρήσης πολλών διαφορετικών εργαλείων.

## Βασικός χρήστης

> Υποψήφιος του Πανελλήνιου Γραπτού Διαγωνισμού ΑΣΕΠ που θέλει οργανωμένη και μετρήσιμη προετοιμασία μέσα από μία εφαρμογή.

## Τρέχουσα γενική κατάσταση

Το ASEPIA βρίσκεται σε ενεργή ανάπτυξη και διαθέτει ήδη λειτουργική web βάση σε vanilla HTML, CSS και JavaScript. Η εφαρμογή προσφέρει responsive εμπειρία σε desktop, tablet και mobile και περιλαμβάνει Επίσημο Μητρώο Ερωτήσεων, CAT, Εργασιακές Συμπεριφορές, Study Plan, Statistics και Help.

Το Smart Welcome έχει ήδη υλοποιημένες φάσεις προσωπικής υποδοχής και adaptive παρουσίασης. Το `EPIC-007 — Project Governance & Documentation` έχει ολοκληρωθεί και το handbook παραμένει ενεργό ως Living Documentation.

Το επίσημο branding asset δεν έχει ακόμη οριστικοποιηθεί. Η ενσωμάτωση του mobile branding παραμένει blocked μέχρι να παραδοθεί εγκεκριμένο logo/icon asset.

## Βασικά Product Modules

### Επίσημο Μητρώο Ερωτήσεων

Το Μητρώο αποτελεί τον βασικό χώρο μελέτης και εξάσκησης. Περιλαμβάνει:

- Διάβασμα,
- Τεστ Ενοτήτων / Registry Test,
- Quick Test,
- Smart Test,
- Favorites,
- Wrongs,
- Unread filters,
- Statistics.

Το επιβεβαιωμένο dataset περιλαμβάνει 11 κατηγορίες και 1.988 ερωτήσεις.

### Smart Test

Ο Smart Test συνθέτει την προσπάθεια με τον κλειδωμένο αλγόριθμο:

- 50% wrong questions,
- 30% unread questions,
- 20% random questions.

Αν ένας pool δεν επαρκεί, το υπόλοιπο συμπληρώνεται από τους άλλους διαθέσιμους pools. Ο Smart Test δεν αποτελεί δεύτερο ανεξάρτητο test engine.

### CAT

Το CAT περιλαμβάνει:

- Practice,
- Simulation,
- adaptive επιλογή ερωτήσεων,
- Ability-based αξιολόγηση,
- ιστορικό και σύγκριση προσπαθειών.

Ο χρόνος δεν επηρεάζει το Ability score. Μπορεί να χρησιμοποιείται μόνο ως πληροφορία διαχείρισης χρόνου.

### Εργασιακές Συμπεριφορές

Το module περιλαμβάνει:

- Practice,
- Simulation,
- αποτελέσματα και παρακολούθηση προόδου,
- κοινό μηχανισμό επιλογής triads.

Η επιβεβαιωμένη τράπεζα δεδομένων περιλαμβάνει 228 triads.

### Study Plan

Το Study Plan είναι orchestration layer πάνω στους υπάρχοντες engines. Οργανώνει το τι, πότε και πόσο θα μελετηθεί και αναθέτει την εκτέλεση στα Registry, CAT και Work Behaviour entry points.

Δεν:

- δημιουργεί δικές του ερωτήσεις,
- δημιουργεί δικό του Question Engine,
- βαθμολογεί ανεξάρτητα,
- αντιγράφει selection logic.

### Smart Welcome

Το Smart Welcome είναι προσωπική περιοχή υποδοχής και όχι λειτουργικό dashboard ή κουμπί. Τα υλοποιημένα στοιχεία είναι:

- χαιρετισμός ανά ώρα,
- προαιρετική εμφάνιση αποθηκευμένου ονόματος,
- ελληνικά motivational messages χωρίς άμεση επανάληψη,
- adaptive responsive παρουσίαση,
- desktop editorial Hero,
- tablet/mobile Hero Card.

Reminders, streaks, notifications και άλλες μελλοντικές δυνατότητες δεν έχουν υλοποιηθεί.

### Βοήθεια

Η περιοχή Βοήθειας περιλαμβάνει:

- Οδηγό ΑΣΕΠ,
- Οδηγό Εφαρμογής.

## Τεχνική βάση

Η σημερινή βασική δομή είναι:

```text
index.html
style.css
app.js
data/*.json
tools/
docs/
```

Η εφαρμογή είναι προς το παρόν monolithic vanilla web application. Δεν χρησιμοποιεί framework ή build system. Τα δεδομένα φορτώνονται από JSON αρχεία και η τοπική πρόοδος αποθηκεύεται μέσω browser persistence. Η πρόσβαση στο application state γίνεται μέσω του κοινού `ApplicationState` gateway.

Η πλήρης τεχνική ανάλυση δεν ανήκει στο παρόν αρχείο και καταγράφεται στο `docs/ARCHITECTURE.md`.

## Κοινό Application State

Ο κοινός `ApplicationState` αποτελεί το gateway για state όπως:

- answered και question progress,
- wrongs,
- favorites,
- statistics,
- recent Registry/CAT questions,
- Work progress και history,
- Study Plan progress και log.

Τα υπάρχοντα storage keys και schemas δεν αλλάζουν χωρίς εγκεκριμένο migration plan.

## Θεμελιώδης αρχιτεκτονική φιλοσοφία

### One Engine Rule

Οι κοινές λειτουργίες επαναχρησιμοποιούν τους υπάρχοντες engines. Δεν δημιουργείται δεύτερος engine όταν υπάρχει ήδη κατάλληλος κοινός μηχανισμός.

### No Duplicate Rule

Ερωτήσεις ή triads δεν επαναλαμβάνονται αδικαιολόγητα μέσα στην ίδια προσπάθεια, όταν ο διαθέσιμος pool επιτρέπει μοναδική επιλογή.

### Functional First — Refactor Later

Προηγούνται η συμφωνημένη λειτουργικότητα και η σταθερότητα. Μεγάλος refactor γίνεται αργότερα, μέσω ξεχωριστού εγκεκριμένου Sprint.

### Cross-Platform First

Η μακροπρόθεσμη κατεύθυνση είναι κοινή επιχειρησιακή λογική για Web, Android και iOS, με τις διαφορές να περιορίζονται κυρίως στο UI και στις device-specific δυνατότητες.

Οι πλήρεις κανόνες βρίσκονται στα `PROJECT_CHARTER.md` και `docs/PROJECT_RULES.md`.

## Product και Development Philosophy

Το ASEPIA αναπτύσσεται με τις αρχές:

- πραγματική αξία πριν από εντυπωσιασμό,
- απλότητα,
- συνέπεια,
- αξιοπιστία,
- προστασία της προόδου του χρήστη,
- responsive design,
- ελεγχόμενη εξέλιξη,
- μικρά και επαληθεύσιμα Sprints,
- no feature creep.

## Ρόλοι

### Product Owner

Ορίζει τις ανάγκες, τις προτεραιότητες, το product scope και το Product Approval.

### ChatGPT — Technical Architect

Αναλαμβάνει ανάλυση, αρχιτεκτονική κατεύθυνση, Sprint decomposition, Specifications και Reviews.

### Codex — Lead Developer / Implementer

Υλοποιεί εγκεκριμένα Specifications, εκτελεί validation και παραδίδει τεχνική αναφορά.

Η πλήρης διακυβέρνηση και οι αρμοδιότητες περιγράφονται στο `PROJECT_CHARTER.md`.

## Development Flow

```text
Problem / Idea
      ↓
Epic
      ↓
Sprint
      ↓
Specification
      ↓
Implementation
      ↓
Validation
      ↓
Technical Review
      ↓
Product Approval όπου απαιτείται
      ↓
Commit
      ↓
Push
      ↓
Release / Deploy
```

## Implemented vs Planned

### Implemented / Existing

- Λειτουργική responsive web εφαρμογή σε vanilla HTML, CSS και JavaScript.
- Registry Study, Registry Test, Quick Test και Smart Test.
- Favorites, wrongs, unread filters και Statistics.
- CAT Practice και Simulation με Ability-based αξιολόγηση.
- Work Behaviour Practice, Simulation και αποτελέσματα.
- Study Plan ως orchestration layer.
- Smart Welcome με time-based greeting, optional name, motivational messages και adaptive Hero presentation.
- Help με Οδηγό ΑΣΕΠ και Οδηγό Εφαρμογής.
- Data validation και browser smoke-test εργαλεία.
- Κοινός `ApplicationState` gateway.

### In Progress

- `EPIC-002 — Smart Welcome Engine`.

### Completed

- `EPIC-001 — Study Planner`, ολοκληρωμένο στο συμφωνημένο Epic scope.
- `EPIC-007 — Project Governance & Documentation`.

### Planned

- `EPIC-003 — Authentication`.
- `EPIC-004 — Cloud Sync`.
- `EPIC-005 — Android / iOS`.

Οι planned δυνατότητες δεν αποτελούν υλοποιημένα features ή δεσμευτικό roadmap πέρα από την κατάσταση που καταγράφεται στο `docs/EPICS.md`.

## Εμπορική κατεύθυνση

Οι κλειδωμένες επιχειρηματικές αποφάσεις προβλέπουν:

- Lifetime License,
- Login όταν υλοποιηθεί η εμπορική υποδομή,
- μία αγορά ανά λογαριασμό,
- χρήση σε πολλαπλές προσωπικές συσκευές,
- μία ενεργή συνεδρία κάθε φορά.

Οι λεπτομέρειες παραμένουν στα `PROJECT_CHARTER.md` και `docs/DECISIONS.md`.

## Τι δεν είναι το PROJECT_CONTEXT.md

Το παρόν αρχείο δεν είναι:

- Sprint tracker,
- Changelog,
- Decision Log,
- Technical Architecture reference,
- UI specification,
- Development manual,
- Roadmap,
- replacement του Charter.

## Related Documentation

- `docs/ROADMAP.md` — Epic sequencing και dependencies.
- `docs/UI_GUIDELINES.md` — UI/UX governance.
- `docs/BRAND_GUIDELINES.md` — branding rules και asset status.
- `docs/AI_RULES.md` — AI collaboration και governance.
- `docs/ARCHITECTURE.md` — τεχνική αρχιτεκτονική, engines και contracts.
- `docs/DEVELOPMENT_GUIDE.md` — τοπική εκτέλεση, αλλαγές και validation workflow.
- `PROJECT_BOOTSTRAP.md` — τρέχουσα κατάσταση.
- `PROJECT_CHARTER.md` — διακυβέρνηση και θεμελιώδεις αρχές.
- `docs/PROJECT_RULES.md` — πρακτικοί κλειδωμένοι κανόνες.
- `docs/DECISIONS.md` — rationale εγκεκριμένων architectural/product αποφάσεων.
- `docs/EPICS.md` — μεγάλα product initiatives.
- `docs/SPRINTS.md` — Sprint status.
- `docs/CHANGELOG.md` — πραγματικές αλλαγές.
- `docs/VISION.md` — μακροπρόθεσμο όραμα.
- `docs/README.md` — documentation index.
