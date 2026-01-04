# UI Redesign System Design

## Architecture
The redesign will strictly be a frontend change (CSS/React). No changes to the extension host communication or data models are required.

## Visual Language

### Color Palette: "Tsumiki Orange"
- **Primary**: Bright Orange (e.g., `#FF9F1C` or similar warm tone) for primary actions (Timer) and highlights.
- **Secondary**: Softer yellows and warm grays for secondary stats.
- **Background**: Clean, likely using VS Code's sidebar background but potentially with slight adjustments for "brightness" if in light mode, or distinct cards in dark mode.
- **Boundary**: A distinct 1px border (`var(--vscode-sideBarSectionHeader-border)`) to separate the view from the workspace.

### Component Breakdown & Responsiveness

#### 1. Header & Timer
- **Design**: "Control Center" block. Large timer text.
- **Responsiveness**:
    - **Wide**: Timer and Start/Stop button side-by-side.
    - **Narrow**: Timer and button stack vertically or scale down font size using `clamp()`. **Crucial**: Prevent "squashing" or overlap.

#### 2. Stats Grid
- **Design**: "Bento Box" style grid of cards.
- **Responsiveness**:
    - **Wide**: 2 or 3 columns.
    - **Narrow**: Auto-flow to 1 column or wrap flex items to ensure content fits.

#### 3. Language Visualization
- **Design**: Stacked Bar.
- **Responsiveness**: Labels may move to a legend below the bar if width is insufficient for inline labels.

#### 4. File List
- **Design**: Grouped list with file type icons.
- **Responsiveness**: Filenames truncate with ellipsis (`text-overflow: ellipsis`) properly.

## CSS Strategy
- **Variables**: Define `--theme-primary: [orange-value]` and derived shades.
- **Layout**: Use CSS Grid for the main structure and Flexbox for components.
- **Container Queries (if supported/polyfilled)** or **Media Queries**: Apply specific styles when the container width drops below ~250px.
- **Boundary**: Ensure the root container has a `border-right` (or `border-left` depending on position, though usually VS Code handles the split, we will add an inner border if the native one is insufficient or invisible). *Correction*: VS Code WebViews are inside an iframe. We might need a border on the `body` or main app container to visually separate if the VS Code theme doesn't provide enough contrast.
