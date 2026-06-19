# cms-data-layer — Delta: Project Schema & Source-Agnostic Data Layer

## ADDED Requirements

### Requirement: Project Schema

The site SHALL define a `Project` content type with the fields: `title` (string), `category` (one of `architecture` | `interior` | `product` | `experimental`), `year` (number), `engine` (string, e.g. "Corona", "V-Ray", "Unreal"), `image` (main render image asset, served via the image CDN), `depthMap` (optional grayscale image asset for the WebGL hero), `featured` (boolean marking the hero piece), and `order` (number for sort). The same schema SHALL be expressed for the chosen CMS (Sanity schema or Decap `config.yml` collection) so that authoring matches the rendered model.

#### Scenario: Schema fields drive the UI

- **WHEN** a project entry is read
- **THEN** its `title`, `category`, `year`, and `engine` populate the museum caption, its `image` supplies the render, and its `depthMap` (if present) feeds the WebGL hero

### Requirement: Source-Agnostic Data Access

The gallery and hero SHALL obtain projects exclusively through a data-layer interface (`getProjects()` returning projects sorted by `order`, and a featured selector) and SHALL NOT read from a hardcoded array or directly from a CMS SDK. A default placeholder adapter SHALL satisfy the interface from local data so the site runs with no CMS connected, and Sanity/Decap adapters SHALL be selectable (e.g. via `VITE_CMS_SOURCE`) without changing any consumer code.

#### Scenario: Consumers never touch the source

- **WHEN** the gallery and hero render
- **THEN** they call the data-layer interface (projects sorted by `order`) and remain unchanged regardless of whether the source is placeholder data, Sanity, or Decap

#### Scenario: Runs without a CMS

- **WHEN** no CMS is configured
- **THEN** the placeholder adapter supplies projects and the full site renders normally

### Requirement: Featured & Filter Derivation

The hero SHALL be driven by the project whose `featured` flag is set (falling back to the first project by `order` if none is flagged), and the gallery category filters SHALL be derived from the distinct `category` values present in the data. Adding a new project entry in the CMS SHALL cause it to appear in the gallery (and, if flagged, the hero) automatically, with no code change.

#### Scenario: Add a render with no code

- **WHEN** an author creates a new `Project` entry in the CMS and it is fetched
- **THEN** it appears in the gallery sorted by `order`, contributes its category to the filter row, and becomes the hero if `featured` is set

#### Scenario: Featured fallback

- **WHEN** no project has `featured: true`
- **THEN** the hero uses the first project by `order`
