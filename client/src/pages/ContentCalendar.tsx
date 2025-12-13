import Layout from "@/components/Layout";
import { ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react";

export default function ContentCalendar() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calendarDays = Array.from({ length: 35 }, (_, i) => i + 1); // Mock days

  const events = [
    { day: 2, title: "Founder Story", platform: "LI", color: "bg-blue-100 border-blue-500 text-blue-800" },
    { day: 4, title: "Event Promo", platform: "IG", color: "bg-pink-100 border-pink-500 text-pink-800" },
    { day: 4, title: "Tech News", platform: "X", color: "bg-gray-100 border-gray-800 text-gray-800" },
    { day: 6, title: "Funding Friday", platform: "LI", color: "bg-green-100 border-green-500 text-green-800" },
    { day: 9, title: "Community Spotlight", platform: "IG", color: "bg-purple-100 border-purple-500 text-purple-800" },
    { day: 11, title: "AMA Session", platform: "X", color: "bg-gray-100 border-gray-800 text-gray-800" },
    { day: 13, title: "Weekly Roundup", platform: "LI", color: "bg-blue-100 border-blue-500 text-blue-800" },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
              Content Calendar
            </h1>
            <p className="text-gray-600 font-mono text-sm md:text-base">
              Schedule and manage your social media pipeline.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="neo-btn bg-white text-black hover:bg-gray-100 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="neo-btn flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Event
            </button>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between bg-black text-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_#3B82F6]">
          <div className="flex items-center gap-4">
            <button className="p-1 hover:bg-gray-800 rounded"><ChevronLeft /></button>
            <h2 className="font-mono font-bold text-xl uppercase">December 2025</h2>
            <button className="p-1 hover:bg-gray-800 rounded"><ChevronRight /></button>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-brand-blue text-white font-mono text-xs font-bold uppercase border border-white">Month</button>
            <button className="px-3 py-1 bg-transparent text-gray-400 hover:text-white font-mono text-xs font-bold uppercase border border-transparent hover:border-gray-600">Week</button>
            <button className="px-3 py-1 bg-transparent text-gray-400 hover:text-white font-mono text-xs font-bold uppercase border border-transparent hover:border-gray-600">List</button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b-2 border-black bg-gray-50">
            {days.map((day) => (
              <div key={day} className="p-3 text-center font-mono font-bold uppercase text-sm border-r border-gray-200 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="grid grid-cols-7 auto-rows-[120px]">
            {calendarDays.map((day, i) => {
              const dayEvents = events.filter(e => e.day === day);
              const isToday = day === 13; // Mock today

              return (
                <div key={i} className={`
                  p-2 border-b border-r border-gray-200 relative hover:bg-gray-50 transition-colors
                  ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}
                `}>
                  <span className={`
                    font-mono text-sm font-bold block mb-2
                    ${isToday ? 'bg-brand-blue text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-gray-500'}
                  `}>
                    {day <= 31 ? day : ""}
                  </span>

                  <div className="space-y-1">
                    {day <= 31 && dayEvents.map((event, idx) => (
                      <div 
                        key={idx}
                        className={`
                          text-[10px] font-bold px-1.5 py-1 border-l-2 truncate cursor-pointer hover:opacity-80
                          ${event.color}
                        `}
                      >
                        {event.platform}: {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
