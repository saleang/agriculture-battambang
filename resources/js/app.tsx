// import '../css/app.css';

// import { createInertiaApp } from '@inertiajs/react';
// import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import { initializeTheme } from './hooks/use-appearance';

// const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// createInertiaApp({
//     title: (title) => (title ? `${title} - ${appName}` : appName),
//     resolve: (name) =>
//         resolvePageComponent(
//             `./pages/${name}.tsx`,
//             import.meta.glob('./pages/**/*.tsx'),
//         ),
//     setup({ el, App, props }) {
//         const root = createRoot(el);

//         root.render(
//             <StrictMode>
//                 <App {...props} />
//             </StrictMode>,
//         );
//     },
//     progress: {
//         color: '#4B5563',
//     },
// });

// // This will set light / dark mode on load...
// initializeTheme();

import './bootstrap';
import '../css/app.css';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.{tsx,jsx,js,ts}');

        const lookup = `./pages/${name}.tsx`;
        if (pages[lookup]) {
            return resolvePageComponent(lookup, pages);
        }

        // Try common alternative case / name guesses
        const pascal = name
            .split('/')
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join('/');
        const pascalLookup = `./pages/${pascal}.tsx`;
        if (pages[pascalLookup]) {
            return resolvePageComponent(pascalLookup, pages);
        }

        // Try .jsx and .js fallbacks
        const jsLookup = `./pages/${name}.jsx`;
        if (pages[jsLookup]) {
            return resolvePageComponent(jsLookup, pages);
        }
        const jsLookup2 = `./pages/${name}.js`;
        if (pages[jsLookup2]) {
            return resolvePageComponent(jsLookup2, pages);
        }

        // If nothing found, let resolvePageComponent throw the default error
        return resolvePageComponent(lookup, pages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
