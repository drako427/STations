"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export default function Charts({ caseData, categoryData }: any) {
  return (
    <>
      <div className="glass-card p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-6">Case Frequency Trends</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={caseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
              <Tooltip contentStyle={{ backgroundColor: "rgba(10, 10, 10, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} itemStyle={{ color: "var(--color-primary)" }} labelStyle={{ color: "white", marginBottom: "4px" }} />
              <Line type="monotone" dataKey="cases" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--color-primary)", strokeWidth: 2, stroke: "var(--color-background)" }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Case Distribution</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="white" fontSize={12} tickLine={false} axisLine={false} width={70} />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ backgroundColor: "rgba(10, 10, 10, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {categoryData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
