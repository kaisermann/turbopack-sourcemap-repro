"use client";

import { useState } from "react";
import { Counter } from "../components/counter";

export default function Home() {
  const [name, setName] = useState("World");

  return (
    <main>
      <h1>Hello {name}</h1>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <Counter />
    </main>
  );
}
