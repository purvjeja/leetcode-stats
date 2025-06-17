"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const API_URL = "https://api.jsonbin.io/v3/b/684fe1478a456b7966aef22b";
const API_KEY = "$2b$10$36wvnzpKZqVs9l1ZsHS2jON.JWV9pBcgmU98Oce5jnCYheagDHuyq";

type Problem = {
  difficulty: "easy" | "medium" | "hard";
  solved: number;
  total: number;
};

type LeetCodeRecord = {
  id: number;
  date: string;
  rank: string;
  problems: Problem[];
};

type ApiResponse = {
  record: {
    leetcode: LeetCodeRecord[];
  };
};

export default function Home() {
  const [data, setData] = useState<LeetCodeRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"stats" | "form">("stats");
  const [formData, setFormData] = useState<LeetCodeRecord>({
    id: 0,
    date: "",
    rank: "",
    problems: [
      { difficulty: "easy", solved: 0, total: 0 },
      { difficulty: "medium", solved: 0, total: 0 },
      { difficulty: "hard", solved: 0, total: 0 },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(API_URL, {
        headers: {
          "X-Master-Key": API_KEY,
        },
      });
      const json: ApiResponse = await res.json();
      setData(json.record.leetcode);
      setFormData((prev) => ({
        ...prev,
        id: json.record.leetcode.length,
        date: String(Date.now()),
      }));
    };

    fetchData();
  }, []);

  const handleFormChange = (
    field: keyof LeetCodeRecord | string,
    value: unknown
  ) => {
    if (["easy", "medium", "hard"].includes(field)) {
      setFormData((prev) => ({
        ...prev,
        problems: prev.problems.map((p) =>
          p.difficulty === field ? { ...p, solved: Number(value) } : p
        ),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const submitForm = () => {
    const updatedData = [...data, formData];

    const req = new XMLHttpRequest();
    req.onreadystatechange = () => {
      if (req.readyState === XMLHttpRequest.DONE) {
        alert("Submitted successfully!");
        console.log(req.responseText);
      }
    };

    req.open("PUT", API_URL, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("X-Master-Key", API_KEY);
    req.send(JSON.stringify({ leetcode: updatedData }));
  };

  return (
    <main className="p-4">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 rounded ${
            activeTab === "stats" ? "bg-blue-500 text-white" : "bg-gray-900"
          }`}
        >
          Stats
        </button>
        <button
          onClick={() => setActiveTab("form")}
          className={`px-4 py-2 rounded ${
            activeTab === "form" ? "bg-blue-500 text-white" : "bg-gray-900"
          }`}
        >
          Form
        </button>
      </div>

      {activeTab === "stats" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Rank Over Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={data.map((d) => ({
                ...d,
                rank: Number(d.rank),
                date: new Date(Number(d.date)).toLocaleDateString(),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis reversed /> {/* Rank decreasing means better */}
              <Tooltip />
              <Line type="monotone" dataKey="rank" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>

          <h2 className="text-xl font-bold mt-8 mb-4">Problem Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(() => {
              if (data.length === 0) return null;

              const latest = data[data.length - 1];

              return latest.problems.map((p, i) => {
                const pieData = [
                  { name: "Solved", value: p.solved },
                  { name: "Remaining", value: Math.max(0, p.total - p.solved) },
                ];

                return (
                  <div key={i} className="text-center w-full">
                    <h3 className="font-semibold capitalize mb-2">
                      {p.difficulty}
                    </h3>
                    <div
                      style={{ width: "100%", minWidth: "250px", height: 300 }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label
                            dataKey="value"
                          >
                            <Cell key="solved" fill="#4ade80" />
                            <Cell key="remaining" fill="#f87171" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {activeTab === "form" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Submit New Entry</h2>

          <div>
            <label className="block mb-1">Rank</label>
            <input
              type="text"
              value={formData.rank}
              onChange={(e) => handleFormChange("rank", e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block mb-1">Date (timestamp)</label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => handleFormChange("date", e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          {formData.problems.map((p, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 capitalize">
                  {p.difficulty} - Solved
                </label>
                <input
                  type="number"
                  value={p.solved}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      problems: prev.problems.map((prob) =>
                        prob.difficulty === p.difficulty
                          ? { ...prob, solved: Number(e.target.value) }
                          : prob
                      ),
                    }))
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block mb-1 capitalize">
                  {p.difficulty} - Total
                </label>
                <input
                  type="number"
                  value={p.total}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      problems: prev.problems.map((prob) =>
                        prob.difficulty === p.difficulty
                          ? { ...prob, total: Number(e.target.value) }
                          : prob
                      ),
                    }))
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>
          ))}

          <button
            onClick={submitForm}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      )}
    </main>
  );
}
