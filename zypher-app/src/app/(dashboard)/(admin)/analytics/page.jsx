"use client";

import { useState } from "react";
import { Lexend } from "next/font/google";
import {
  Users,
  TrendingUp,
  Bug,
  Wrench,
  AlertTriangle,
  BarChart as BarChartIcon,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const lexend = Lexend({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function AdminAnalyticsPage() {
  const [timeframe, setTimeframe] = useState("month");

  const stats = {
    day: { users: 12, retention: "67%", customRules: 3 },
    week: { users: 73, retention: "72%", customRules: 14 },
    month: { users: 310, retention: "81%", customRules: 52 },
  };

  const mostCommonVuln = "Hardcoded credentials";
  const mostMissedPractice = "Missing input validation";

  const activityData = {
  day: [
    { name: "12 AM", users: 1 },
    { name: "4 AM", users: 2 },
    { name: "8 AM", users: 3 },
    { name: "12 PM", users: 4 },
    { name: "4 PM", users: 1 },
    { name: "8 PM", users: 1 },
  ],
  week: [
    { name: "Mon", users: 12 },
    { name: "Tue", users: 18 },
    { name: "Wed", users: 10 },
    { name: "Thu", users: 23 },
    { name: "Fri", users: 17 },
    { name: "Sat", users: 25 },
    { name: "Sun", users: 14 },
  ],
  month: [
    { name: "Week 1", users: 65 },
    { name: "Week 2", users: 80 },
    { name: "Week 3", users: 92 },
    { name: "Week 4", users: 73 },
  ],
};


  return (
    <div className={`p-2 md:p-8 lg:p-4 ${lexend.className} animate-fadeInUp`}>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[var(--foreground)]">
        Analytics
      </h1>

      {/* Timeframe Filter */}
      <div className="flex justify-end mb-6">
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard
          icon={<Users size={28} />}
          title="Total Users"
          value={stats[timeframe].users}
        />
        <StatCard
          icon={<TrendingUp size={28} />}
          title="User Retention"
          value={stats[timeframe].retention}
        />
        <StatCard
          icon={<Wrench size={28} />}
          title="Custom Rule Requests"
          value={stats[timeframe].customRules}
        />
        <StatCard
          icon={<Bug size={28} />}
          title="Top Vulnerability"
          value={mostCommonVuln}
        />
        <StatCard
          icon={<AlertTriangle size={28} />}
          title="Most Missed Best Practice"
          value={mostMissedPractice}
        />
      </div>

      {/* Graph Section */}
      <div className="bg-[var(--input-bg)] rounded-xl p-6 border border-[var(--border-input)] shadow-lg">
        <div className="flex items-center gap-3 mb-4 text-[var(--foreground)] font-semibold text-lg">
          <BarChartIcon size={22} />
          User Activity Graph
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData[timeframe]}>
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="var(--brand-yellow)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Reusable StatCard component
function StatCard({ icon, title, value }) {
  return (
    <div className="bg-[var(--input-bg)] p-6 rounded-xl border border-[var(--border-input)] shadow-md flex items-start gap-4">
      <div className="text-[var(--brand-yellow)]">{icon}</div>
      <div>
        <h4 className="text-[var(--text-secondary)] text-sm font-semibold mb-1">{title}</h4>
        <p className="text-[var(--foreground)] text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
