import Image from "next/image";
import Lab1 from "./labs/lab1/components/Lab1";
import Lab2 from "./labs/lab2/components/Lab2";
import Lab4 from "./labs/lab4/components/Lab4";
import Lab5 from "./labs/lab5/components/Lab5";
import Lab6 from "./labs/lab6/components/Lab6";
import { Lab8 } from "./labs/lab8/components/Lab8";
import { Lab9 } from "./labs/lab9/components/Lab9";
import Link from "next/link";
const labs = [
  {
    id: "lab1",
    title: "Lab 1",
    description: "Introduction to Electrical Systems",
    icon: "⚡",
  },
  {
    id: "lab2",
    title: "Lab 2",
    description: "Circuit Analysis Fundamentals",
    icon: "🔌",
  },
  {
    id: "lab3",
    title: "Lab 3",
    description: "Power System Components",
    icon: "⚙️",
  },
  { id: "lab4", title: "Lab 4", description: "Load Flow Analysis", icon: "📊" },
  { id: "lab5", title: "Lab 5", description: "Fault Analysis", icon: "🚨" },
  {
    id: "lab6",
    title: "Lab 6",
    description: "Impedance Calculations",
    icon: "🔢",
  },
  {
    id: "lab7",
    title: "Lab 7",
    description: "Power System Stability",
    icon: "📈",
  },
  { id: "lab8", title: "Lab 8", description: "Calculator Tools", icon: "🧮" },
  {
    id: "lab9",
    title: "Lab 9",
    description: "Advanced Fault Studies",
    icon: "🔬",
  },
];

export default function Home() {
  return (
    <>
      {" "}
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-800">
        {/* Header */}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Bar */}
          <div className="flex items-center gap-6 mb-8">
            <div className="bg-white rounded-lg px-4 py-2 border border-slate-200 shadow-sm">
              <span className="text-slate-500 text-sm">Total Labs: </span>
              <span className="font-semibold">{labs.length}</span>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 border border-slate-200 shadow-sm">
              <span className="text-slate-500 text-sm">Status: </span>
              <span className="text-emerald-600 font-semibold">All Active</span>
            </div>
          </div>

          {/* Labs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {labs.map((lab) => (
              <Link
                key={lab.id}
                href={`/labs/${lab.id}`}
                className="group relative bg-white rounded-xl border border-slate-200 p-6 text-left 
                           hover:border-blue-500 hover:shadow-lg hover:shadow-blue-200/40 
                           transition-all duration-300"
              >
                {/* Hover Glow */}
                <div
                  className="absolute inset-0 rounded-xl bg-gradient-to-br 
                              from-blue-500/0 to-purple-500/0 
                              group-hover:from-blue-500/5 group-hover:to-purple-500/5 
                              transition-all duration-300"
                />

                <div className="relative">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-2xl mb-4 
                                group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300"
                  >
                    {lab.icon}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
                    {lab.title}
                  </h2>

                  {/* Description */}
                  <p className="text-slate-500 mt-2 text-sm group-hover:text-slate-600 transition-colors">
                    {lab.description}
                  </p>

                  {/* Arrow */}
                  <div
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 
                                transform translate-x-2 group-hover:translate-x-0 
                                transition-all duration-300"
                  >
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
