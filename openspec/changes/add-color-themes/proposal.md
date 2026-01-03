# Color Themes Proposal

## Summary
Add support for multiple color themes to allow users to customize the extension's appearance. This includes the default Orange theme, new Blue and Green themes, and a Monochrome (White-based) theme optimized for dark mode.

## Motivation
- Users want to customize the look and feel to match their editor theme or personal preference.
- The default orange theme might not fit all VS Code themes.
- A monochrome/white theme provides a clean, high-contrast option that fits well with dark editor themes.

## Proposed Changes
1.  **CSS Architecture**: Refactor `App.css` to support theme switching via CSS variables.
2.  **New Themes**:
    - **Orange** (Default): Existing branding.
    - **Blue**: Calm, productive blue palette.
    - **Green**: Natural, relaxed green palette.
    - **Monochrome**: White-based accent for dark mode (adapts to black in light mode), offering a minimal look.
3.  **Settings**: Add a new configuration option to select the active theme.
4.  **UI Update**: Update the Settings view to allow theme selection.

## Alternatives Considered
- **Auto-matching VS Code Theme**: Automatically deriving colors from the current VS Code theme colors. This is harder to get right and might lose the "Tsumiki" identity, but we will ensure all themes respect the base VS Code background/foreground colors (which we already do). Explicit themes give users more control.
