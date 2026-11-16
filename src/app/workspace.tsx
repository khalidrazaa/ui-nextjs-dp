'use client';

import dynamic from 'next/dynamic';

// Preserve browser-local timestamps and the existing client-state lifecycle.
// Individual features can adopt server rendering as their APIs are introduced.
const Workspace = dynamic(() => import('../App'), { ssr: false });

export default Workspace;
