# ASEPIA — Roadmap

> **Χαρακτήρας:** Epic Sequencing & Dependency Reference
>
> **Κατάσταση:** Active — Living Document
>
> **Product:** ASEPIA

Το Roadmap οργανώνει μόνο ήδη εγκεκριμένα Epics και γνωστές εξαρτήσεις. Δεν μετατρέπει ιδέες σε δεσμεύσεις και δεν αντικαθιστά το `EPICS.md` ή το `SPRINTS.md`.

## 1. Source Rules

Το παρόν document αντλεί current state αποκλειστικά από:

- `docs/EPICS.md`,
- `docs/SPRINTS.md`,
- `docs/PROJECT_CONTEXT.md`,
- `docs/DECISIONS.md`,
- `PROJECT_BOOTSTRAP.md`.

Το `EPICS.md` παραμένει η πηγή για το επίσημο Epic portfolio και status. Το `SPRINTS.md` παραμένει η πηγή για συγκεκριμένες παραδόσεις. Το Roadmap δεν δημιουργεί initiative, priority ή ημερομηνία.

## 2. Official Epic Portfolio

| Epic | Title | Status |
| --- | --- | --- |
| EPIC-001 | Study Planner | Completed |
| EPIC-002 | Smart Welcome Engine | Completed |
| EPIC-003 | Authentication | Planned |
| EPIC-004 | Cloud Sync | Planned |
| EPIC-005 | Android / iOS | Planned |
| EPIC-007 | Project Governance & Documentation | Completed |

Η αρίθμηση έχει σκόπιμα κενό. **Δεν υπάρχει και δεν δημιουργείται EPIC-006.**

## 3. Current Foundation — Implemented

Η σημερινή operational βάση περιλαμβάνει:

- responsive vanilla HTML/CSS/JavaScript web application,
- Registry Study, Registry Test, Quick Test και Smart Test,
- Favorites, Wrongs, Unread και Statistics,
- CAT Practice και Simulation με Ability-based αξιολόγηση,
- Work Behaviour Practice, Simulation και history,
- Study Plan ως orchestration layer,
- Smart Welcome με time-based greeting, optional name και adaptive Hero,
- Help guides,
- κοινό `ApplicationState` gateway,
- data validation και browser smoke-test εργαλεία,
- ενεργό documentation/governance handbook set.

Η foundation περιγραφή δεν αλλάζει το status των σχετικών Epics: τα EPIC-001 και EPIC-002 είναι `Completed` σύμφωνα με το `EPICS.md`.

## 4. Active Initiatives — In Progress

Δεν υπάρχει ενεργό product initiative ή εγκεκριμένο επόμενο Sprint. Δεν ορίζεται νέο product priority.

## 5. Completed Initiatives

### EPIC-002 — Smart Welcome Engine

Το Smart Welcome Engine ολοκληρώθηκε στο συμφωνημένο scope των V14-003 και V14-004 μετά το AUD-002, το Technical Architect Review και το Product Owner Approval. Οι πρόσθετες καταγεγραμμένες δυνατότητες παραμένουν future και δεν αποτελούν completion blockers ή ενεργό commitment.

### EPIC-001 — Study Planner

Το Study Plan ολοκληρώθηκε στο συμφωνημένο scope του EPIC-001 μετά τις διορθώσεις του EPIC-001-C1, το Product Completion Re-check και το Product Approval.

### EPIC-007 — Project Governance & Documentation

Το documentation workstream ολοκληρώθηκε μέσω των DOC-003 έως DOC-009. Το handbook παραμένει ενεργό ως Living Documentation και ενημερώνεται όταν αλλάζει πραγματικά το project.

## 6. Planned Initiatives — Unscheduled

### EPIC-003 — Authentication

Επίσημο status: `Planned`. Δεν υπάρχει εγκεκριμένη ημερομηνία ή ενεργό implementation Sprint.

### EPIC-004 — Cloud Sync

Επίσημο status: `Planned`. Δεν αποτελεί σημερινή runtime capability.

### EPIC-005 — Android / iOS

Επίσημο status: `Planned`. Η Cross-Platform First απόφαση καθορίζει κοινή business logic όπου είναι πρακτικά εφικτό, αλλά δεν σημαίνει ότι native clients υπάρχουν ήδη.

## 7. Dependencies

| Initiative | Depends on | Reason |
| --- | --- | --- |
| EPIC-001 — Study Planner | Υπάρχοντες Registry, CAT και Work Behaviour engines | Το ADR-005 ορίζει το Study Plan ως orchestration layer χωρίς δικό του engine. |
| EPIC-004 — Cloud Sync | EPIC-003 — Authentication | Το ADR-003 ορίζει Login για account-based Cloud Sync και προσωπική πρόοδο. |
| EPIC-005 — Android / iOS | Dependency not formally recorded | Υπάρχει Cross-Platform First direction, αλλά δεν έχει εγκριθεί συγκεκριμένη delivery dependency ή sequence. |
| EPIC-007 — Project Governance & Documentation | Εγκεκριμένη ακολουθία DOC Sprints | Το workstream παραδίδεται μέσω διαδοχικών documentation Sprints. |
| V14-005 — Mobile ASEPIA brand integration | Official logo/icon asset | Το Sprint παραμένει blocked μέχρι να παραδοθεί εγκεκριμένο production asset. |

Δεν τεκμηριώνεται άλλη sequencing dependency. Πιθανή τεχνική σχέση δεν παρουσιάζεται ως επίσημη εξάρτηση χωρίς repository evidence.

## 8. Governance Track

| Sprint | Status | Deliverable |
| --- | --- | --- |
| DOC-003 | ✅ Completed | Documentation Inventory & Information Architecture |
| DOC-004 | ✅ Completed | Core Project Context |
| DOC-005 | ✅ Completed | Architecture & Development Workflow |
| DOC-006 | ✅ Completed | AI Governance |
| DOC-007 | ✅ Completed | UI & Brand Governance |
| DOC-008 | ✅ Completed | Decision Log & Roadmap |
| DOC-009 | ✅ Completed | Documentation Validation & Handover |

Το governance documentation workstream και το EPIC-007 έχουν ολοκληρωθεί.

## 9. Blocked Item

### V14-005 — Mobile ASEPIA brand integration

- Status: `Blocked`.
- Blocker: missing official logo/icon asset.
- Δεν είναι Epic και δεν μετατρέπεται σε EPIC-006.
- Το documentation governance workstream δεν το ξεκινά και δεν δημιουργεί branding asset.

## 10. Unscheduled / No Date Commitment

- `Planned` δεν σημαίνει scheduled.
- Δεν έχουν εγκριθεί release dates, quarters, deadlines ή estimates για τα Planned Epics.
- Η σειρά εμφάνισης στο portfolio δεν αποτελεί priority order.
- **Next product priority: Pending Product Owner decision.**

## 11. Implemented vs In Progress vs Planned vs Completed vs Blocked

- **Implemented:** πραγματικές capabilities της Current Foundation.
- **In Progress:** None.
- **Planned:** EPIC-003, EPIC-004 και EPIC-005, χωρίς date commitment.
- **Completed:** EPIC-001, EPIC-002 και EPIC-007.
- **Blocked:** V14-005 λόγω missing official branding asset.

Planned infrastructure δεν παρουσιάζεται ως υπάρχουσα runtime δυνατότητα.

## 12. Τι δεν είναι το ROADMAP.md

Δεν είναι feature wishlist, release calendar, Sprint Registry, Changelog, νέο Product Vision ή approval μη εγκεκριμένων ιδεών.

## Related Documentation

- `docs/EPICS.md` — επίσημο Epic portfolio και statuses.
- `docs/SPRINTS.md` — συγκεκριμένα Sprints και completion status.
- `docs/DECISIONS.md` — rationale εγκεκριμένων αποφάσεων.
- `docs/PROJECT_CONTEXT.md` — implemented και planned product context.
- `PROJECT_BOOTSTRAP.md` — current-state onboarding.
