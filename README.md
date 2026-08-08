# ASEPIA

Το ASEPIA είναι web εφαρμογή προετοιμασίας για τον Πανελλήνιο Γραπτό Διαγωνισμό ΑΣΕΠ. Περιλαμβάνει μελέτη και τεστ από το Μητρώο Ερωτήσεων, προσαρμοστική εξάσκηση CAT, προσομοιώσεις Εργασιακών Συμπεριφορών, στατιστικά και Σχέδιο Μελέτης.

## Τεχνολογία

Η εφαρμογή χρησιμοποιεί HTML, CSS και JavaScript χωρίς framework ή build step. Τα δεδομένα των ερωτήσεων αποθηκεύονται σε JSON και η τοπική πρόοδος του χρήστη στο `localStorage` του browser.

## Εκτέλεση

Η εφαρμογή πρέπει να σερβίρεται μέσω τοπικού HTTP server, επειδή φορτώνει τα JSON δεδομένα με `fetch`. Από τον κεντρικό φάκελο του repository μπορεί να χρησιμοποιηθεί, για παράδειγμα:

```powershell
python -m http.server 8000
```

Έπειτα ανοίξτε το `http://localhost:8000` στον browser.

Δεν απαιτείται εγκατάσταση dependencies ή build command.

## Δομή project

```text
asep-quiz/
├── PROJECT_BOOTSTRAP.md    # Onboarding και τρέχουσα κατάσταση
├── PROJECT_CHARTER.md      # Αποστολή, αρχές και διακυβέρνηση
├── index.html              # Δομή και οθόνες της εφαρμογής
├── style.css               # Εμφάνιση και responsive layout
├── app.js                  # Λογική εφαρμογής και engines
├── data/
│   ├── categories.json     # Κατάλογος ενοτήτων και πλήθος ερωτήσεων
│   ├── work_behaviour.json # Τράπεζα Εργασιακών Συμπεριφορών
│   └── *.json              # Τράπεζες ερωτήσεων ανά ενότητα
├── docs/
│   ├── README.md           # Documentation index και σειρά ανάγνωσης
│   ├── PROJECT_CONTEXT.md  # Συνολική περιγραφή προϊόντος και τεχνικής βάσης
│   ├── AI_RULES.md         # AI collaboration και governance
│   ├── ARCHITECTURE.md     # Τρέχουσα τεχνική αρχιτεκτονική και contracts
│   ├── DEVELOPMENT_GUIDE.md # Development και validation workflow
│   ├── UI_GUIDELINES.md    # UI/UX και responsive governance
│   ├── BRAND_GUIDELINES.md # Branding governance και asset status
│   ├── VISION.md           # Όραμα προϊόντος
│   ├── EPICS.md            # Μητρώο μεγάλων δυνατοτήτων
│   ├── SPRINTS.md          # Μητρώο Sprints
│   ├── PROJECT_RULES.md     # Κανόνες του project
│   ├── DECISIONS.md        # Αρχιτεκτονικές αποφάσεις
│   └── CHANGELOG.md         # Ιστορικό αλλαγών
└── RELEASE_NOTES_*.txt     # Σημειώσεις προηγούμενων εκδόσεων
```

## Οργάνωση ανάπτυξης

Ο κεντρικός χάρτης και η προτεινόμενη σειρά ανάγνωσης της τεκμηρίωσης βρίσκονται στο `docs/README.md`.

Η εξέλιξη του project οργανώνεται σε τρία επίπεδα:

```text
VISION → EPICS → SPRINTS
```

- Το `docs/VISION.md` περιγράφει τον συνολικό προορισμό του προϊόντος.
- Το `docs/EPICS.md` καταγράφει τις μεγάλες δυνατότητες και την κατάστασή τους.
- Το `docs/SPRINTS.md` καταγράφει τις συγκεκριμένες παραδόσεις και τον προγραμματισμό τους.

## Βασικές ενότητες

- Μητρώο Ερωτήσεων: διάβασμα, τεστ, αγαπημένα, λάθη και στατιστικά.
- CAT: εξάσκηση και προσαρμοστική προσομοίωση.
- Εργασιακές Συμπεριφορές: εξάσκηση και πλήρης προσομοίωση.
- Σχέδιο Μελέτης: ημερήσιοι στόχοι με βάση τις υπάρχουσες ενότητες.
- Βοήθεια: οδηγοί για τον ΑΣΕΠ και την εφαρμογή.

## Δεδομένα

Το `data/categories.json` αποτελεί την κεντρική λίστα των θεματικών ενοτήτων. Κάθε εγγραφή συνδέεται με αντίστοιχο JSON αρχείο στον ίδιο φάκελο. Το συνολικό πλήθος ερωτήσεων υπολογίζεται δυναμικά από τα δηλωμένα counts αυτού του αρχείου.

## Εργαλεία ποιότητας

Τα εργαλεία ελέγχου βρίσκονται στον φάκελο `tools/` και απαιτούν Node.js. Για την πρώτη εκτέλεση:

```powershell
cd tools
npm install
npx playwright install chromium
```

Έλεγχος όλων των JSON δεδομένων:

```powershell
npm run validate
```

Τα ίδια κείμενα ερωτήσεων αναφέρονται ως warnings, επειδή μπορεί να έχουν διαφορετικές απαντήσεις. Τα δομικά σφάλματα, τα duplicate IDs, τα invalid correct indexes και τα λανθασμένα category totals αποτυγχάνουν το validation.

Εκτέλεση των βασικών browser smoke tests:

```powershell
npm run smoke
```

Πλήρης έλεγχος validation και smoke tests:

```powershell
npm test
```
