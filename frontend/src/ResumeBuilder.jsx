import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";

const sampleData = {
  name: "Alex Morgan",
  title: "Full-Stack Engineer",
  location: "Remote • New York, NY",
  email: "alex.morgan@email.com",
  phone: "+1 (555) 123-4567",
  summary:
    "Full-stack engineer with 4+ years of experience building SaaS dashboards and data-driven products. Strong at translating business goals into secure, performant, and maintainable web apps.",
  skills: "JavaScript, TypeScript, React, Node.js, Express, PostgreSQL, Docker, AWS, TailwindCSS, Cypress",
  experience:
    "Built an AI resume analyzer (React, FastAPI) that improved candidate screening speed by 35%\nReduced API latency by 22% by optimizing Postgres queries and Redis caching\nLed migration to Docker-based CI/CD, cutting deploy time from 25m to 8m",
  projects:
    "Career Compass — Personalized career insights platform (React, Chart.js, FastAPI)\nServerless Image Pipeline — Automated image moderation and tagging on AWS Lambda",
  education: "B.S. Computer Science — NYU (2019)\nCertified AWS Solutions Architect Associate",
};

const textareaClass =
  "w-full rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:border-accent-600";

function parseCommaList(text) {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseLines(text) {
  return text
    .split(/\n|\r/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ResumeBuilder() {
  const [form, setForm] = useState(sampleData);

  const skillList = useMemo(() => parseCommaList(form.skills), [form.skills]);
  const expList = useMemo(() => parseLines(form.experience), [form.experience]);
  const projectList = useMemo(() => parseLines(form.projects), [form.projects]);
  const educationList = useMemo(() => parseLines(form.education), [form.education]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetSample = () => setForm(sampleData);

  const exportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 40;
    const maxWidth = 520;
    let y = 60;

    const addHeader = (title) => {
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(16, 185, 129);
      doc.rect(marginX, y - 12, 10, 10, "F");
      doc.setTextColor(34, 197, 94);
      doc.text(title, marginX + 18, y - 3);
      doc.setTextColor(55);
      y += 14;
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(236, 240, 245);
    doc.text(form.name || "Your Name", marginX, y);

    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180);
    doc.text(form.title || "Role", marginX, (y += 18));

    const contact = [form.location, form.email, form.phone].filter(Boolean).join("  •  ");
    if (contact) {
      doc.setFontSize(11);
      doc.text(contact, marginX, (y += 16));
    }

    y += 18;

    addHeader("Profile");
    doc.setFontSize(11);
    doc.setTextColor(60);
    const summaryLines = doc.splitTextToSize(form.summary || "", maxWidth);
    doc.text(summaryLines, marginX, y);
    y += summaryLines.length * 14 + 6;

    addHeader("Skills");
    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text(skillList.join(" • "), marginX, y, { maxWidth });
    y += 18;

    addHeader("Experience");
    doc.setTextColor(60);
    expList.forEach((item) => {
      if (y > 760) {
        doc.addPage();
        y = 60;
      }
      const bullet = doc.splitTextToSize(`• ${item}`, maxWidth);
      doc.text(bullet, marginX, y);
      y += bullet.length * 14 + 4;
    });

    addHeader("Projects");
    projectList.forEach((item) => {
      if (y > 760) {
        doc.addPage();
        y = 60;
      }
      const bullet = doc.splitTextToSize(`• ${item}`, maxWidth);
      doc.text(bullet, marginX, y);
      y += bullet.length * 14 + 4;
    });

    addHeader("Education & Certifications");
    educationList.forEach((item) => {
      if (y > 760) {
        doc.addPage();
        y = 60;
      }
      const bullet = doc.splitTextToSize(`• ${item}`, maxWidth);
      doc.text(bullet, marginX, y);
      y += bullet.length * 14 + 4;
    });

    doc.save("career-assistant-resume.pdf");
  };

  return (
    <section className="glass rounded-2xl border border-white/10 p-6 md:p-8 shadow-glow card-hover">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-mint-400 font-semibold">Step 2</p>
          <h2 className="text-2xl font-semibold text-white">Build & export a polished resume</h2>
          <p className="text-slate-400 text-sm mt-1">
            Edit the template, preview live, and export a PDF tailored for ATS and recruiters.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={resetSample}
            type="button"
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-sm hover:border-accent-600"
          >
            Load sample
          </button>
          <button
            onClick={exportPdf}
            type="button"
            className="px-4 py-2 rounded-lg bg-mint-500 text-slate-900 font-semibold text-sm shadow-glow hover:bg-mint-400"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Name" value={form.name} onChange={handleChange("name")} />
            <Field label="Title" value={form.title} onChange={handleChange("title")} />
            <Field label="Location" value={form.location} onChange={handleChange("location")} />
            <Field label="Email" value={form.email} onChange={handleChange("email")} />
            <Field label="Phone" value={form.phone} onChange={handleChange("phone")} />
            <Field label="Skills (comma separated)" value={form.skills} onChange={handleChange("skills")} />
          </div>

          <FieldTextarea
            label="Profile summary"
            value={form.summary}
            onChange={handleChange("summary")}
            hint="1-3 sentences with impact and focus"
          />

          <FieldTextarea
            label="Experience bullets"
            value={form.experience}
            onChange={handleChange("experience")}
            hint="One bullet per line, include metrics and technologies"
          />

          <FieldTextarea
            label="Projects"
            value={form.projects}
            onChange={handleChange("projects")}
            hint="One project per line with stack and impact"
          />

          <FieldTextarea
            label="Education & certifications"
            value={form.education}
            onChange={handleChange("education")}
            hint="One line per item"
          />
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">{form.name || "Your Name"}</h3>
              <p className="text-sm text-slate-300">{form.title || "Role"}</p>
              <p className="text-xs text-slate-500 mt-1">
                {[form.location, form.email, form.phone].filter(Boolean).join(" • ") || "Contact details"}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs bg-slate-800 text-slate-200 border border-slate-700">
              Preview
            </span>
          </div>

          <PreviewBlock title="Profile" content={form.summary} />
          <PreviewList title="Skills" items={skillList} pill />
          <PreviewList title="Experience" items={expList} />
          <PreviewList title="Projects" items={projectList} />
          <PreviewList title="Education & Certifications" items={educationList} />
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="space-y-1 block text-sm text-slate-200">
      <span className="text-xs text-slate-400">{label}</span>
      <input
        className="w-full rounded-xl bg-slate-900/60 border border-slate-800 p-3 text-sm text-slate-100 focus:outline-none focus:border-accent-600"
        value={value}
        onChange={onChange}
      />
    </label>
  );
}

function FieldTextarea({ label, value, onChange, hint }) {
  return (
    <label className="space-y-1 block text-sm text-slate-200">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{label}</span>
        {hint && <span className="text-slate-500">{hint}</span>}
      </div>
      <textarea className={textareaClass} rows={4} value={value} onChange={onChange} />
    </label>
  );
}

function PreviewBlock({ title, content }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
        <span className="w-1.5 h-5 bg-accent-600 rounded-full" />
        {title}
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">
        {content || "Add a short summary about your impact, domain, and tools."}
      </p>
    </div>
  );
}

function PreviewList({ title, items, pill = false }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
        <span className="w-1.5 h-5 bg-accent-600 rounded-full" />
        {title}
      </div>
      {items && items.length > 0 ? (
        pill ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                key={item}
                className="px-3 py-1 rounded-full text-xs bg-slate-800 text-slate-200 border border-slate-700"
              >
                {item}
              </span>
            ))}
          </div>
        ) : (
          <ul className="space-y-2 text-sm text-slate-300">
            {items.map((item, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-mint-400">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        )
      ) : (
        <p className="text-sm text-slate-500">Add items to see them here.</p>
      )}
    </div>
  );
}

