"use client";

import { useState, useEffect } from "react";

// Simulate a heavy component that would be code-split
const data = Array.from({ length: 100 }, (_, i) => ({
  label: `Item ${i}`,
  value: Math.random() * 100,
}));

export default function HeavyChart() {
  const [sorted, setSorted] = useState(false);

  useEffect(() => {
    console.log("HeavyChart mounted with", data.length, "items");
  }, []);

  const items = sorted ? [...data].sort((a, b) => b.value - a.value) : data;

  return (
    <div>
      <button onClick={() => setSorted((s) => !s)}>
        {sorted ? "Unsort" : "Sort by value"}
      </button>
      <ul>
        {items.slice(0, 10).map((item) => (
          <li key={item.label}>
            {item.label}: {item.value.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}
