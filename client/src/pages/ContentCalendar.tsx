import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight, Plus, Filter, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from "date-fns";

export default function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: allPosts, isLoading } = trpc.posts.list.useQuery();
  const { data: platforms } = trpc.platforms.list.useQuery();

  const getPlatformColor = (platformId: number) => {
    const platform = platforms?.find(p => p.id === platformId);
    if (!platform?.color) return "bg-gray-100 border-gray-500 text-gray-800";
    
    // Map platform colors to Tailwind classes
    const colorMap: Record<string, string> = {
      "#0A66C2": "bg-blue-100 border-blue-500 text-blue-800",
      "#000000": "bg-gray-100 border-gray-800 text-gray-800",
      "#E4405F": "bg-pink-100 border-pink-500 text-pink-800",
      "#1877F2": "bg-blue-100 border-blue-600 text-blue-800",
      "#FF0000": "bg-red-100 border-red-500 text-red-800",
    };
    
    return colorMap[platform.color] || "bg-gray-100 border-gray-500 text-gray-800";
  };

  const getPlatformAbbrev = (platformId: number) => {
    const platform = platforms?.find(p => p.id === platformId);
    if (!platform) return "?";
    
    const abbrevMap: Record<string, string> = {
      "linkedin": "LI",
      "x": "X",
      "instagram": "IG",
      "facebook": "FB",
      "youtube": "YT",
    };
    
    return abbrevMap[platform.slug] || platform.slug.substring(0, 2).toUpperCase();
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const getPostsForDay = (day: Date) => {
    if (!allPosts) return [];
    return allPosts.filter(post => {
      if (!post.scheduledFor) return false;
      return isSameDay(new Date(post.scheduledFor), day);
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: Date) => isSameDay(day, new Date());

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
            <button onClick={goToPreviousMonth} className="p-1 hover:bg-gray-800 rounded">
              <ChevronLeft />
            </button>
            <h2 className="font-mono font-bold text-xl uppercase">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <button onClick={goToNextMonth} className="p-1 hover:bg-gray-800 rounded">
              <ChevronRight />
            </button>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-brand-blue text-white font-mono text-xs font-bold uppercase border border-white">Month</button>
            <button className="px-3 py-1 bg-transparent text-gray-400 hover:text-white font-mono text-xs font-bold uppercase border border-transparent hover:border-gray-600">Week</button>
            <button className="px-3 py-1 bg-transparent text-gray-400 hover:text-white font-mono text-xs font-bold uppercase border border-transparent hover:border-gray-600">List</button>
          </div>
        </div>

        {/* Calendar Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b-2 border-black bg-gray-50">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-3 text-center font-mono font-bold uppercase text-sm border-r border-gray-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className="grid grid-cols-7 auto-rows-[120px]">
              {calendarDays.map((day, i) => {
                const dayPosts = getPostsForDay(day);
                const today = isToday(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                return (
                  <div key={i} className={`
                    p-2 border-b border-r border-gray-200 relative hover:bg-gray-50 transition-colors
                    ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}
                    ${!isCurrentMonth ? 'bg-gray-50 opacity-50' : ''}
                  `}>
                    <span className={`
                      font-mono text-sm font-bold block mb-2
                      ${today ? 'bg-brand-blue text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-gray-500'}
                    `}>
                      {format(day, 'd')}
                    </span>

                    <div className="space-y-1 overflow-hidden">
                      {dayPosts.slice(0, 2).map((post) => (
                        <div 
                          key={post.id}
                          className={`
                            text-[10px] font-bold px-1.5 py-1 border-l-2 truncate cursor-pointer hover:opacity-80
                            ${getPlatformColor(post.platformId)}
                          `}
                          title={post.title}
                        >
                          {getPlatformAbbrev(post.platformId)}: {post.title}
                        </div>
                      ))}
                      {dayPosts.length > 2 && (
                        <div className="text-[10px] font-mono text-gray-500 px-1.5">
                          +{dayPosts.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
