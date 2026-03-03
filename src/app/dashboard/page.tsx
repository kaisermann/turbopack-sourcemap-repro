"use client";

import dynamic from "next/dynamic";
import { Counter } from "../../components/counter";

const HeavyChart = dynamic(() => import("../../components/heavy-chart"), {
  loading: () => <p>Loading chart...</p>,
});

export default function DashboardPage() {
  return (
    <main>
      <h1>Dashboard</h1>
      <Counter />
      <HeavyChart />
    </main>
  );
}
