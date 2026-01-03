# UI Design Redesign Proposal

## Summary
The current UI design is functional but lacks visual appeal and distinctiveness. This proposal aims to completely redesign the WebView UI to be more modern, engaging, and aligned with the "Tsumiki" (building blocks) concept.
**Update:** The design will feature a **bright, modern Orange theme**, improve responsiveness (specifically for narrow sidebars), and clearly define the boundary between the sidebar and workspace.

## Goals
- **Modernize Aesthetic**: Move away from standard VS Code lists to a custom, polished card-based interface with an **Orange-based bright theme**.
- **Enhance Visual Hierarchy**: Make key metrics (Work Time, Save Count) pop out more effectively.
- **Improve Responsiveness**: Ensure UI elements (especially the Timer) scale correctly and do not collapse when the sidebar is narrow.
- **Clear Boundaries**: Add a distinct border line to separate the extension sidebar from the editor workspace.
- **Thematic Consistency**: Incorporate subtle "building block" visual motifs.

## Scope
- `webview/App.css`: Complete overhaul of styles, introducing orange theme variables and responsive rules.
- `webview/components/*.tsx`: Structure updates to support new design and responsiveness.
- `webview/App.tsx`: Layout adjustments.
- No changes to backend logic or data collection.

## Design Concept (Proposed)
- **Theme**: **Orange** as the primary accent color to convey energy and warmth ("Bright & Modern").
- **Cards**: Elevated cards with soft shadows/borders.
- **Responsiveness**: Use CSS Flexbox wrapping and Media Queries/Container Queries to adjust layout for narrow widths.
- **Boundary**: Explicit right-border (or appropriate side) styling to demarcate the sidebar.

## Image Generation Prompt
To visualize this, we will generate design mockups using the following prompt:
> A high-fidelity UI design for a VS Code extension sidebar. The theme is "Tsumiki" (Building Blocks) with a **bright, energetic Orange color scheme**.
> The interface should feature:
> 1. A prominent, stylish timer at the top that **remains legible and well-proportioned even in narrow views**.
> 2. A clear **border line** separating the sidebar from the main editor area.
> 3. "Stats Blocks": Rounded square cards displaying metrics, using warm oranges and yellows.
> 4. A "Language Stack": A horizontal stacked bar chart.
> 5. Overall aesthetic: Modern, clean, and bright.
