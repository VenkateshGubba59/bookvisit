"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useState } from "react";

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) return null;
    return new ConvexReactClient(url);
  });

  if (!client) {
    return (
      <div className="setup-screen">
        <div className="setup-card">
          <span className="eyebrow">One setup step left</span>
          <h1>Connect the local Convex project</h1>
          <p>Run <code>npx convex dev</code> in this folder. It creates the local connection and starts syncing data.</p>
        </div>
      </div>
    );
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
