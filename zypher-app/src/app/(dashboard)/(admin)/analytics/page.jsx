"use client";

import { useState, useEffect } from "react";
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
  const [users, setUsers] = useState(null);
  const [rolesCount, setRolesCount] = useState({});
  const [totalUsers, setTotalUsers] = useState(0);
  const [computedStats, setComputedStats] = useState({
    day: { users: 0, retention: "0%", customRules: 0 },
    week: { users: 0, retention: "0%", customRules: 0 },
    month: { users: 0, retention: "0%", customRules: 0 },
  });
  const [computedActivityData, setComputedActivityData] = useState({ day: [], week: [], month: [] });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateRangeData, setDateRangeData] = useState([]);

  // We'll compute stats from the users collection. If users are not loaded yet,
  // fall back to the computedStats state (initialized to zeroes).

  // these are not available from the User model; removed from UI per request

  // placeholder until users load; computedActivityData will be used instead


  // helper to format YYYY-MM-DD
  function toYMD(d) {
    const dt = new Date(d);
    if (isNaN(dt)) return null;
    return dt.toISOString().slice(0, 10);
  }

  // Build per-date buckets between start and end (inclusive)
  function buildDateBuckets(usersList, start, end) {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s) || isNaN(e) || s > e) return [];
    const days = [];
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d).toISOString().slice(0, 10));
    }
    const counts = Object.fromEntries(days.map((dt) => [dt, 0]));
    usersList.forEach((u) => {
      const created = u.createdAt || u.created_at || u.created;
      const day = created ? toYMD(created) : null;
      if (day && counts.hasOwnProperty(day)) counts[day] += 1;
    });
    return days.map((dt) => ({ name: dt, users: counts[dt] }));
  }

  // Fetch users from API and compute analytics
  useEffect(() => {
    let mounted = true;
    async function fetchUsers() {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        // data may be an object with users array or array directly depending on API
        const usersList = Array.isArray(data) ? data : data.users || [];
        setUsers(usersList);
        setTotalUsers(usersList.length);

        // Roles breakdown
        const roles = {};
        usersList.forEach((u) => {
          const r = (u.role || 'user').toString();
          roles[r] = (roles[r] || 0) + 1;
        });
        setRolesCount(roles);

        const now = new Date();
        // timeframe cutoffs
        const dayAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24);
        const weekAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7);
        const monthAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);

        function safeDate(d) {
          if (!d) return null;
          const dt = new Date(d);
          return isNaN(dt.getTime()) ? null : dt;
        }

        const statsAcc = { day: { users: 0, active: 0 }, week: { users: 0, active: 0 }, month: { users: 0, active: 0 } };

        usersList.forEach((u) => {
          const created = safeDate(u.createdAt || u.created_at || u.created);
          const updated = safeDate(u.updatedAt || u.updated_at || u.updated);
          if (!created) return;
          if (created >= dayAgo) {
            statsAcc.day.users += 1;
            if (updated && updated >= dayAgo) statsAcc.day.active += 1;
          }
          if (created >= weekAgo) {
            statsAcc.week.users += 1;
            if (updated && updated >= weekAgo) statsAcc.week.active += 1;
          }
          if (created >= monthAgo) {
            statsAcc.month.users += 1;
            if (updated && updated >= monthAgo) statsAcc.month.active += 1;
          }
        });

        function makeRetention(active, total) {
          if (!total) return '0%';
          return Math.round((active / total) * 100) + '%';
        }

        const computed = {
          day: { users: statsAcc.day.users, retention: makeRetention(statsAcc.day.active, statsAcc.day.users), customRules: roles['rule-developer'] || 0 },
          week: { users: statsAcc.week.users, retention: makeRetention(statsAcc.week.active, statsAcc.week.users), customRules: roles['rule-developer'] || 0 },
          month: { users: statsAcc.month.users, retention: makeRetention(statsAcc.month.active, statsAcc.month.users), customRules: roles['rule-developer'] || 0 },
        };

        setComputedStats(computed);

        // initialize date range to last 30 days if not set
        const defaultStart = monthAgo.toISOString().slice(0, 10);
        const defaultEnd = now.toISOString().slice(0, 10);
        if (!startDate && !endDate) {
          setStartDate(defaultStart);
          setEndDate(defaultEnd);
          const dr = buildDateBuckets(usersList, defaultStart, defaultEnd);
          setDateRangeData(dr);
        } else if (startDate && endDate) {
          const dr = buildDateBuckets(usersList, startDate, endDate);
          setDateRangeData(dr);
        }
      } catch (err) {
        console.error('Failed to fetch users for analytics', err);
      }
    }
    fetchUsers();
    return () => { mounted = false; };
  }, []);

  // recompute dateRangeData when users or manual date range changes
  useEffect(() => {
    if (!users || !startDate || !endDate) return;
    const dr = buildDateBuckets(users, startDate, endDate);
    setDateRangeData(dr);
  }, [users, startDate, endDate]);


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
          value={totalUsers}
        />
        <StatCard
          icon={<TrendingUp size={28} />}
          title="New Signups"
          value={computedStats[timeframe]?.users ?? 0}
        />
        <StatCard
          icon={<Wrench size={28} />}
          title="Custom Rule Requests"
          value={computedStats[timeframe]?.customRules ?? 0}
        />
        {/* removed cards that cannot be derived from User model */}
      </div>

      {/* Date range controls */}
      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm text-[var(--text-secondary)]">Range:</label>
        <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] py-1 px-2 rounded">
          <option value="day">Last 24h</option>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
        </select>

        <div className="flex items-center gap-2 ml-4">
          <input type="date" value={startDate||''} onChange={(e)=>setStartDate(e.target.value)} className="bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] py-1 px-2 rounded" />
          <span className="text-[var(--text-secondary)]">to</span>
          <input type="date" value={endDate||''} onChange={(e)=>setEndDate(e.target.value)} className="bg-[var(--background)] border border-[var(--border-input)] text-[var(--foreground)] py-1 px-2 rounded" />
          <button onClick={()=>{ if (startDate && endDate) { const dr = buildDateBuckets(users||[], startDate, endDate); setDateRangeData(dr); } }} className="ml-2 bg-[var(--brand-yellow)] text-black py-1 px-3 rounded">Apply</button>
        </div>
        <div className="ml-auto text-sm text-[var(--text-secondary)]">Total users: <span className="font-semibold text-[var(--foreground)]">{totalUsers}</span></div>
      </div>

      {/* Roles breakdown */}
      {users && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2 text-[var(--foreground)]">Roles</h3>
          <div className="flex gap-4 flex-wrap">
            {Object.entries(rolesCount).map(([role, count]) => (
              <div key={role} className="bg-[var(--input-bg)] p-3 rounded-lg border border-[var(--border-input)]">
                <div className="text-sm text-[var(--text-secondary)]">{role}</div>
                <div className="text-xl font-bold text-[var(--foreground)]">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graph Section */}
      <div className="bg-[var(--input-bg)] rounded-xl p-6 border border-[var(--border-input)] shadow-lg">
        <div className="flex items-center gap-3 mb-4 text-[var(--foreground)] font-semibold text-lg">
          <BarChartIcon size={22} />
          User Activity Graph
        </div>
        <div className="h-64">
          {dateRangeData && dateRangeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dateRangeData}>
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="var(--brand-yellow)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">No activity data for selected range</div>
          )}
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
