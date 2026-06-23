## ADDED Requirements

### Requirement: Five Ordered Service Families

The service taxonomy SHALL define exactly five service families as the studio's information-architecture spine, presented in a fixed canonical order: (1) `visualisation`, (2) `visual-identity`, (3) `computational-design`, (4) `immersive-experiences`, (5) `digital-fabrication`. Each family MUST be a structured record exposing `id` (stable slug, one of the five), `label` (display name), `blurb` (short description), `disciplines` (non-empty string array), `active` (boolean), and `accent` (one of the pop palette tokens: violet, red, lime, or lilac). The taxonomy MUST be the single source of truth from which all family-driven UI is derived; no consumer may invent, reorder, or hardcode a family outside this list.

#### Scenario: Taxonomy exposes five families in canonical order

- **WHEN** a consumer calls the data layer's `getServices()`
- **THEN** it returns exactly five family records
- **AND** their `id` values appear in the order `visualisation`, `visual-identity`, `computational-design`, `immersive-experiences`, `digital-fabrication`

#### Scenario: Each family record is well-formed

- **WHEN** any service family record is read
- **THEN** it exposes `id`, `label`, `blurb`, a non-empty `disciplines` string array, a boolean `active`, and an `accent`
- **AND** `id` is one of the five canonical slugs and `accent` is a defined pop palette token (violet, red, lime, or lilac)

#### Scenario: Disciplines match the defined spine

- **WHEN** the `visualisation` family is read
- **THEN** its `disciplines` include Architectural rendering, Product rendering, Animation, Walkthroughs, and Interactive presentations
- **AND** the `visual-identity` family's `disciplines` include Packaging, Publication design, and Brand graphics
- **AND** the `computational-design` family's `disciplines` include Grasshopper development, Parametric modelling, Generative design, Design automation, and Analysis workflows

### Requirement: Active Versus In-Development Families

The taxonomy SHALL distinguish live families from surfaced-but-empty families via the `active` flag. Exactly two families MUST be `active:true` at launch — `visualisation` and `visual-identity` — and the remaining three (`computational-design`, `immersive-experiences`, `digital-fabrication`) MUST be `active:false`. In-development families MUST still be modelled and surfaced in the Services UI (visibly marked "In development") but MUST carry no associated projects. The active state MUST be read exclusively from the taxonomy, never inferred or duplicated elsewhere.

#### Scenario: Two active families at launch

- **WHEN** the taxonomy is read at launch
- **THEN** `visualisation` and `visual-identity` have `active:true`
- **AND** `computational-design`, `immersive-experiences`, and `digital-fabrication` have `active:false`

#### Scenario: In-development families are surfaced but empty

- **WHEN** the Services UI renders a family with `active:false`
- **THEN** that family is displayed and labelled "In development"
- **AND** `projectsByFamily(<that family id>)` returns an empty array

#### Scenario: Active families carry projects

- **WHEN** `projectsByFamily('visualisation')` or `projectsByFamily('visual-identity')` is called
- **THEN** it returns one or more projects whose `serviceFamily` matches that id

### Requirement: Derived Filters and Services Section

The WORK index filters and the SERVICES list section SHALL be generated programmatically by iterating the taxonomy returned from the data layer; neither may hardcode family ids, labels, order, accents, or counts. Adding, removing, reordering, or relabelling a family in the taxonomy MUST propagate to both the filter controls and the Services section without any change to component markup or styling code.

#### Scenario: Filters render from the taxonomy

- **WHEN** the WORK index filter bar is built
- **THEN** it produces one filter control per family from `getServices()`, in canonical taxonomy order, using each family's `label` and `accent`
- **AND** no family id or label is literally embedded in the filter component source

#### Scenario: Services section renders from the taxonomy

- **WHEN** the SERVICES section is built
- **THEN** it renders all five families from `getServices()` in canonical order with their `label`, `blurb`, and `disciplines`
- **AND** families with `active:false` are marked "In development"

#### Scenario: Taxonomy edit propagates without rebuild of components

- **WHEN** a family's `label` or `accent` is changed in the taxonomy data only
- **THEN** the filter controls and Services section reflect the new `label` and `accent`
- **AND** no filter or Services component markup or styling code is modified

### Requirement: Switch-On With Content Only

Activating an in-development family SHALL require only content changes — setting that family's `active:true` in the taxonomy and adding one or more projects whose `serviceFamily` equals its id — with no rebuild of components, IA, filters, or layout. Until both conditions are met, the family MUST remain marked "In development" and surface no projects, and a family marked `active:true` MUST have at least one associated project.

#### Scenario: Activation requires only data changes

- **WHEN** `computational-design` is set to `active:true` and at least one project with `serviceFamily: 'computational-design'` is added
- **THEN** the family stops showing "In development" and its projects appear in the WORK index and under its filter
- **AND** no component, filter, layout, or IA code is changed to achieve this

#### Scenario: Active flag without projects is invalid

- **WHEN** any family has `active:true`
- **THEN** `projectsByFamily(<that family id>)` returns at least one project

#### Scenario: Future family stays in-development until both conditions met

- **WHEN** an in-development family has `active:false` or has no projects
- **THEN** it remains labelled "In development" and surfaces no projects in the WORK index or filters
