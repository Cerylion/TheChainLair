# The Chain Lair Portfolio

A portfolio website showcasing chainmaille artistry and creations by Manuel Alberto Moran Lazaro. Built with modern web technologies, this site presents handcrafted chainmaille pieces in an elegant and responsive design. Visit the live site at [thechainlair.com](https://thechainlair.com).

## Features

- Modern, responsive design using Bootstrap 5
- Single Page Application (SPA) with React Router
- Contact form integration with EmailJS
- Custom routing and navigation components
- Optimized for performance and SEO

## Technologies Used

- React 19.1.0
- React Router DOM 7.5.1
- Bootstrap 5.3.5
- React Bootstrap 2.10.9
- EmailJS Browser 4.4.1

## Getting Started

1. Clone the repository
2. Install dependencies:
    npm install
3. Start the development server:
    npm start
The site will be available at http://localhost:3000

## Available Scripts
- npm start - Runs the development server
- npm test - Runs the test suite
- npm run build - Creates a production build

## GCM React Overlay Usage

When using the Gamepad Control Module (GCM) React `CursorOverlay` component, disable the PointerDriver’s DOM overlay in the Provider to avoid duplicate cursors:

```jsx
import { GamepadControlProvider } from './modules/GCM';
import { CursorOverlay } from './modules/GCM';

export default function App() {
  return (
    <GamepadControlProvider config={{ mountPointer: false }}>
      {/* App content */}
      <CursorOverlay />
    </GamepadControlProvider>
  );
}
```

Notes:
- `mountPointer: false` ensures only the React `CursorOverlay` renders the cursor.
- If you are not using `CursorOverlay`, omit the config or set `mountPointer: true` (default) to let the Provider mount the pointer overlay automatically.

## GCM Configuration Surface

GCM exposes a clear configuration surface and helpful defaults:

- `GCM_DEFAULT_CONFIG` (from `modules/GCM`) provides the current default values.
- `GCM_CONFIG_KEYS` lists supported config keys for introspection/documentation.
- Use `controller.setConfig(partial)` (React/vanilla) to adjust runtime behavior.

Common options (with defaults):
- `axes` and `buttons` mappings (defaults align with standard pads)
- `deadzone: 0.15`, `sensitivity: 10`, `scrollSensitivity: 30`
- `pointerEnabled: true`, `focusEnabled: true`, `clickMode: 'tap'`
- `devicePreference: 'last-connected'`, `pauseWhenHidden: true`, `ownershipHysteresisMs: 75`
- Provider-only: `mountPointer: true`, `autoStart: true`, `styleInjection: true`, `showRing: false`

Example (React):
```jsx
import { GamepadControlProvider, GCM_DEFAULT_CONFIG } from './modules/GCM';

export default function Page() {
  const cfg = { ...GCM_DEFAULT_CONFIG, sensitivity: 12, useDPad: true };
  return (
    <GamepadControlProvider config={cfg}>
      {/* Content */}
    </GamepadControlProvider>
  );
}
```

Example (Vanilla):
```js
import { initGCM, GCM_DEFAULT_CONFIG } from './modules/GCM';

const cfg = { ...GCM_DEFAULT_CONFIG, pointerEnabled: true };
const { controller, teardown } = initGCM(cfg);
// Update at runtime
controller.setConfig({ sensitivity: 14 });
```

Notes:
- Future options like `hideNativeCursor` and `container` overrides may be added; consult `modules/GCM/README.md`.
- Avoid duplicate overlays by setting `mountPointer: false` when rendering `CursorOverlay`.

## Deployment
This project is configured for deployment on Vercel. The production build can be created using:

npm run build

## Author
Manuel Alberto Moran Lazaro

I am a chainmaille artist and web developer. This portfolio showcases my chainmaille artwork while demonstrating my web development skills through a modern React application.

- Portfolio: thechainlair.com
- Project Version: 0.1.0
## License
This project is proprietary software.
All rights reserved © Manuel Alberto Moran Lazaro

- Private repository
- Not open for public use, distribution, or modification
- All source code, designs, and assets are protected under copyright law