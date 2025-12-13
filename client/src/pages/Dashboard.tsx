import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  Calendar as CalendarIcon, 
  ArrowUpRight,
  MessageSquare,
  Share2,
  AlertCircle
} from "lucide-react";

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
              Mission Control
            </h1>
            <p className="text-gray-600 font-mono text-sm md:text-base">
              Welcome back, Admin. System status: <span className="text-green-600 font-bold">OPERATIONAL</span>
            </p>
          </div>
          <button className="neo-btn">
            + New Post
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Followers", value: "12,450", change: "+12%", icon: Users, color: "bg-brand-blue" },
            { label: "Engagement Rate", value: "5.2%", change: "+0.8%", icon: TrendingUp, color: "bg-brand-yellow" },
            { label: "Posts Scheduled", value: "18", change: "Next: 2h", icon: CalendarIcon, color: "bg-green-500" },
            { label: "Mentions", value: "45", change: "+5 today", icon: MessageSquare, color: "bg-purple-500" },
          ].map((stat, i) => (
            <div key={i} className="neo-card p-4 relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-16 h-16 ${stat.color} opacity-20 rounded-bl-full transition-transform group-hover:scale-110`} />
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 border-2 border-black ${stat.color} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                  <stat.icon className="w-5 h-5 text-black" />
                </div>
                <span className="font-mono text-xs font-bold bg-black text-white px-2 py-1">
                  {stat.change}
                </span>
              </div>
              <h3 className="font-mono text-sm text-gray-500 uppercase mb-1">{stat.label}</h3>
              <p className="text-3xl font-black tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b-4 border-black pb-2">
              <h2 className="text-2xl font-bold uppercase flex items-center gap-2">
                <CalendarIcon className="w-6 h-6" /> Upcoming Content
              </h2>
              <a href="/calendar" className="font-mono text-sm underline hover:text-brand-blue">View All</a>
            </div>

            <div className="space-y-4">
              {[
                { title: "Founder Story: ShipBob", platform: "LinkedIn", time: "Today, 2:00 PM", status: "Ready", type: "Carousel" },
                { title: "Funding Friday Round-up", platform: "Instagram", time: "Fri, 9:00 AM", status: "Drafting", type: "Story" },
                { title: "Chicago Tech Event Alert", platform: "X (Twitter)", time: "Fri, 11:00 AM", status: "Scheduled", type: "Text" },
              ].map((post, i) => (
                <div key={i} className="neo-card p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 border-2 border-black flex items-center justify-center font-bold text-xl">
                      {post.platform[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg leading-tight">{post.title}</h4>
                      <div className="flex gap-2 text-xs font-mono mt-1 text-gray-600">
                        <span>{post.platform}</span>
                        <span>•</span>
                        <span>{post.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm">{post.time}</div>
                    <span className={`
                      inline-block px-2 py-0.5 text-xs font-bold border border-black mt-1
                      ${post.status === 'Ready' ? 'bg-green-400' : post.status === 'Scheduled' ? 'bg-blue-400' : 'bg-yellow-400'}
                    `}>
                      {post.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions & Alerts */}
          <div className="space-y-6">
            <div className="border-b-4 border-black pb-2">
              <h2 className="text-2xl font-bold uppercase flex items-center gap-2">
                <AlertCircle className="w-6 h-6" /> System Alerts
              </h2>
            </div>

            <div className="bg-black text-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_#3B82F6]">
              <h3 className="font-mono text-brand-yellow font-bold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-brand-yellow rounded-full animate-pulse"></span>
                TREND DETECTED
              </h3>
              <p className="text-sm mb-4">
                "Chicago Tech Week" is trending on X. Engagement opportunity detected.
              </p>
              <button className="w-full bg-white text-black font-mono font-bold py-2 hover:bg-gray-200 transition-colors">
                CREATE POST
              </button>
            </div>

            <div className="neo-card p-4">
              <h3 className="font-bold uppercase mb-4 border-b-2 border-gray-200 pb-2">Quick Links</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100 font-mono text-sm border border-transparent hover:border-black transition-all flex justify-between items-center group">
                  Generate Asset <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100 font-mono text-sm border border-transparent hover:border-black transition-all flex justify-between items-center group">
                  Review Drafts <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100 font-mono text-sm border border-transparent hover:border-black transition-all flex justify-between items-center group">
                  Community Reports <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
