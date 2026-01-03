# Color Themes Design

## Architecture

We will implement theming using CSS variables scoped to a data attribute on the root element (e.g., `data-theme="blue"`).

### CSS Variable Strategy

Current variables in `App.css`:
```css
:root {
  --theme-primary: #FF9F1C;
  --theme-secondary: #FFBF69;
  --theme-accent: #FFAD42;
  --theme-bg-soft: rgba(255, 159, 28, 0.1);
  --theme-text-on-primary: #FFFFFF;
}
```

We will refactor this to:

```css
/* Default (Orange) */
:root, [data-theme="orange"] {
  --theme-primary: #FF9F1C;
  --theme-secondary: #FFBF69;
  --theme-accent: #FFAD42;
  --theme-bg-soft: rgba(255, 159, 28, 0.1);
  --theme-text-on-primary: #FFFFFF;
}

[data-theme="blue"] {
  --theme-primary: #3A86FF;
  --theme-secondary: #8ECAE6;
  --theme-accent: #4361EE;
  --theme-bg-soft: rgba(58, 134, 255, 0.1);
  --theme-text-on-primary: #FFFFFF;
}

[data-theme="green"] {
  --theme-primary: #2A9D8F;
  --theme-secondary: #8AB17D;
  --theme-accent: #264653;
  --theme-bg-soft: rgba(42, 157, 143, 0.1);
  --theme-text-on-primary: #FFFFFF;
}

[data-theme="monochrome"] {
  /* Dynamic depending on VS Code mode, but let's define a base White accent for Dark mode users as requested */
  --theme-primary: #F8F9FA;
  --theme-secondary: #DEE2E6;
  --theme-accent: #ADB5BD;
  --theme-bg-soft: rgba(248, 249, 250, 0.1);
  --theme-text-on-primary: #212529; /* Dark text on white */
}
```

### Settings Integration

- Add `tsumiki.appearance.theme` to `package.json` configuration.
- Types: `'orange' | 'blue' | 'green' | 'monochrome'`
- Default: `'orange'`
- The `Config` class in `src/settings/config.ts` will expose this value.
- The WebView will receive this setting via the `settings` message or initial state.

### UI Implementation

1.  **WebView Host**: Inject the theme preference into the WebView HTML or send it via `postMessage`.
2.  **React App**: Read the theme from props/context and apply `data-theme` to the root `div` (class `.app` or `html`/`body`).
3.  **Settings View**: Add a dropdown or radio group to select the theme.

## Visual Design

- **Orange**: Energetic, Tsumiki brand identity.
- **Blue**: Professional, calm, standard for dev tools.
- **Green**: Relaxing, "eye-friendly".
- **Monochrome**: Minimalist. Specifically requested to look good in dark mode (White accents). In Light mode, White accents might be invisible, so we might need `monochrome` to actually mean "High Contrast" where it's Black in Light mode and White in Dark mode. However, for simplicity, we will start with fixed palettes. If "White" is selected, it uses White primary.
    - *Correction*: To make "White" work on Light backgrounds, we can use a media query or just a smart choice. But standard "Monochrome" usually implies Black/White. Let's stick to the user's request: "White based one that fits dark theme". We will define it as White Primary. If a user uses it on Light mode, it might have low contrast. We can add a note or make it adaptive later. For now, we define the palette as "White/Gray".

