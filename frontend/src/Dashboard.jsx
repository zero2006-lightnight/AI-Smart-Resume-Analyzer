import { useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const palette = [
  "#7c3aed",
  "#22d3ee",
  "#34d399",
  "#f97316",
  "#eab308",
  "#3b82f6",
  "#f472b6",
  "#06b6d4",
  "#a855f7",
  "#f43f5e",
];

export default function Dashboard({ data }) {
  const distribution = data.skill_distribution || {};
  const detectedSkills = data.detected_skills || [];
  const missingSkills = data.missing_skills || [];
  const jobRecs = data.job_recommendations || [];
  const suggestions = data.suggestions || [];
  const breakdown = data.ats_breakdown || {};

  const distChart = useMemo(() => {
    const labels = Object.keys(distribution);
    const values = labels.map((k) => distribution[k]);
    return {
      labels,
      datasets: [
        {
          label: "Skills",
          data: values,
          backgroundColor: labels.map((_, i) => palette[i % palette.length]),
          borderWidth: 0,
        },
      ],
    };
  }, [distribution]);

  const breakdownChart = useMemo(() => {
    const labels = Object.keys(breakdown);
    const values = labels.map((k) => breakdown[k]);
    return {
      labels,
      datasets: [
        {
          label: "Points",
          data: values,
          backgroundColor: "rgba(124, 58, 237, 0.6)",
          borderRadius: 6,
        },
      ],
    };
  }, [breakdown]);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass rounded-2xl border border-white/10 p-6 shadow-glow">
          <p className="text-sm text-slate-400">ATS Score</p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-4xl font-semibold text-white">{Math.round(data.ats_score)}%</span>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300">
              Keyword density {data.keyword_density?.toFixed?.(1) ?? data.keyword_density}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Weighted formula: 30% skills, 20% keywords, 15% experience, 15% education, 10% projects, 10% formatting.
          </p>
        </div>

        <div className="glass rounded-2xl border border-white/10 p-6 shadow-glow chart-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-200 font-semibold">Skill distribution</p>
            <span className="text-xs text-slate-400">by category</span>
          </div>
          <div className="h-52">
            <Doughnut
              data={distChart}
              options={{
                plugins: { legend: { position: "bottom", labels: { color: "#cbd5e1" } } },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        <div className="glass rounded-2xl border border-white/10 p-6 shadow-glow">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-200 font-semibold">Breakdown</p>
            <span className="text-xs text-slate-400">/100 pts</span>
          </div>
          <div className="h-52">
            <Bar
              data={breakdownChart}
              options={{
                indexAxis: "y",
                scales: {
                  x: { ticks: { color: "#cbd5e1" }, grid: { color: "#1f2937" } },
                  y: { ticks: { color: "#cbd5e1" } },
                },
                plugins: { legend: { display: false } },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Detected skills" description="What the model found in your resume">
          <TagList items={detectedSkills} empty="No skills detected" variant="success" />
        </InfoCard>

        <InfoCard title="Missing skills" description="Job-aligned skills to add">
          <TagList items={missingSkills} empty="None detected — great match" variant="alert" />
        </InfoCard>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard title="Job recommendations" description="Top matches by skill overlap">
          <ul className="space-y-2 text-sm text-slate-200">
            {jobRecs.length === 0 && <li className="text-slate-500">Add more skills to improve matches.</li>}
            {jobRecs.map(([role, score]) => (
              <li key={role} className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2">
                <span>{role}</span>
                <span className="text-mint-400 font-semibold">{score}%</span>
              </li>
            ))}
          </ul>
        </InfoCard>

        <InfoCard title="AI suggestions" description="Quick wins to boost ATS">
          <ul className="space-y-2 text-sm text-slate-200">
            {suggestions.length === 0 && <li className="text-slate-500">Strong match already. Consider fine-tuning wording.</li>}
            {suggestions.map((s, idx) => (
              <li key={idx} className="bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 leading-relaxed">
                {s}
              </li>
            ))}
          </ul>
        </InfoCard>

        <InfoCard title="Tips" description="Formatting & keyword ideas">
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
            <li>Mirror the job's phrasing for key responsibilities.</li>
            <li>Use bullet points with impact metrics (%, $, time saved).</li>
            <li>Group skills by category to improve parsability.</li>
            <li>Keep line lengths short; avoid dense paragraphs.</li>
          </ul>
        </InfoCard>
      </div>
    </section>
  );
}

function InfoCard({ title, description, children }) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-5 shadow-glow card-hover">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-slate-200 font-semibold">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function TagList({ items, empty, variant = "default" }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-500">{empty}</p>;
  }

  const variantClass = {
    success: "bg-mint-500/10 text-mint-200 border-mint-500/30",
    alert: "bg-red-500/10 text-red-200 border-red-500/30",
    default: "bg-slate-800 text-slate-200 border-slate-700",
  }[variant];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`px-3 py-1 rounded-full text-xs border ${variantClass}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
