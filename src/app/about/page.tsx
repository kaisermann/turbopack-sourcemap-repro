"use client";

import { useState, useEffect } from "react";

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main>
      <h1>About Page</h1>
      <p>Mounted: {String(mounted)}</p>
    </main>
  );
}
