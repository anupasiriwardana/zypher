'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { DollarSign, Users, TrendingUp, Package, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const COLORS = ['#FCE803', '#A020F0', '#00C49F', '#FF8042'];

const StatCard = ({ title, value, icon: Icon, change = null, changeType = 'positive' }) => (
  <div className="bg-[var(--background-light)] p-6 rounded-xl shadow-md border border-[var(--border-input)] flex flex-col gap-2 transition-transform hover:scale-105">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-[var(--text-secondary)]">{title}</h3>
      {Icon && <Icon size={24} className="text-[var(--brand-yellow)]" />}
    </div>
    <p className="text-3xl font-bold text-[var(--foreground)]">{value}</p>
    {change && (
      <div className="flex items-center gap-2 text-sm">
        <TrendingUp
          size={16}
          className={clsx(
            changeType === 'positive' && 'text-green-400 transform rotate-0',
            changeType === 'negative' && 'text-red-400 transform rotate-180'
          )}
        />
        <span className={clsx(
          changeType === 'positive' && 'text-green-400',
          changeType === 'negative' && 'text-red-400'
        )}>
          {change}
        </span>
        <span className="text-[var(--text-secondary)]">since last month</span>
      </div>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#0D0D0D',
        border: '1px solid #FCE803',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 0 10px rgba(252, 232, 3, 0.4)',
        color: '#F0F0F0',
      }}>
        <p className="text-lg font-bold text-[var(--brand-yellow)] mb-1">{label}</p>
        {payload.map((p, index) => (
          <p key={index} className="text-sm font-medium mt-1" style={{ color: p.color }}>
            {`${p.name}: ${p.value.toLocaleString()}${p.name.includes('Revenue') ? ' $' : ''}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ManagerDashboardPage () {
  const [data, setData] = useState(null);
  const [timeframe, setTimeframe] = useState('monthly');

  useEffect(() => {
    fetch('/api/ManagerAnalytics')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setData(json.data);
        } else {
          console.error('Failed to fetch analytics');
        }
      })
      .catch(err => console.error(err));
  }, []);

  if (!data) {
    return <div>Loading analytics…</div>;
  }

  // Normalize arrays to avoid runtime map errors if backend omits fields
  const revenueByPlan = Array.isArray(data.revenueByPlan) ? data.revenueByPlan : [];
  const statusDistribution = Array.isArray(data.statusDistribution) ? data.statusDistribution : [];
  const monthlyTrend = Array.isArray(data.monthlyTrend) ? data.monthlyTrend : [];

  // Build KPI cards (for example revenue of each plan)
  const kpiCards = revenueByPlan.map(plan => ({
    title: `${plan.planId.charAt(0).toUpperCase() + plan.planId.slice(1)} Revenue`,
    value: `$${plan.totalRevenue.toLocaleString()}`,
    // icon etc can map based on plan
  }));

  // Build bar chart data for purchases: we have count & revenue
  const barData = revenueByPlan.map(plan => ({
    name: plan.planId,
    purchases: plan.count,
    revenue: plan.totalRevenue
  }));

  // Build pie chart data for status distribution
  const pieData = statusDistribution.map(s => ({
    name: s.status,
    value: s.count
  }));

  // Build line chart data for monthly trend
  const lineData = monthlyTrend.map(item => ({
    name: `${item.year}-${('0'+item.month).slice(-2)}`,
    revenue: item.revenue,
    subscriptions: item.count
  }));

  return (
    <div className="min-h-screen">
      <h1 className="text-4xl font-extrabold text-[var(--foreground)] mb-8">
        Manager Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {kpiCards.map((card, idx) => (
          <StatCard key={idx} title={card.title} value={card.value} icon={DollarSign} />
        ))}
      </div>

      <div className="bg-[var(--background-light)] p-8 rounded-xl shadow-md border border-[var(--border-input)] mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Revenue & Subscriptions Trend</h2>
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="appearance-none bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--foreground)] py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
            >
              <option value="monthly">Monthly</option>
              {/* you can add quarterly/yearly */}
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
          </div>
        </div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart
              data={lineData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-input)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis yId="left" stroke="var(--text-secondary)" />
              <YAxis yId="right" orientation="right" stroke="var(--text-secondary)" />
              <Legend wrapperStyle={{ color: 'var(--text-secondary)', paddingTop: '10px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line yId="left" type="monotone" dataKey="revenue" stroke="#FCE803" activeDot={{ r: 8 }} name="Revenue ($)" />
              <Line yId="right" type="monotone" dataKey="subscriptions" stroke="#A020F0" activeDot={{ r: 8 }} name="Subscriptions" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-[var(--background-light)] p-8 rounded-xl shadow-md border border-[var(--border-input)]">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">Pricing Plan Purchases</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart
                data={barData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-input)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Legend wrapperStyle={{ color: 'var(--text-secondary)', paddingTop: '10px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="purchases" fill="#FCE803" name="Purchases" />
                <Bar dataKey="revenue" fill="#A020F0" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--background-light)] p-8 rounded-xl shadow-md border border-[var(--border-input)]">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">Subscription Status Distribution</h2>
          <div style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ResponsiveContainer width="90%" height="90%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ color: 'var(--text-secondary)', paddingTop: '10px' }} />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* You can still include your Recent Transactions table */}
    </div>
  );
}
