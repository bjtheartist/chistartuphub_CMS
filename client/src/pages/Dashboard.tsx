import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { 
  TrendingUp, 
  Users, 
  Calendar as CalendarIcon, 
  ArrowUpRight,
  MessageSquare,
  AlertCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: upcomingPosts, isLoading: postsLoading } = trpc.posts.getUpcoming.useQuery();
  const { data: platforms } = trpc.platforms.list.useQuery();

  const getPlatformName = (platformId: number) => {
    const platform = platforms?.find(p => p.id === platformId);
    return platform?.name || "Unknown";
  };

  const getPlatformInitial = (platformId: number) => {
    const name = getPlatformName(platformId);
    return name[0];
  };

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
          <a href="/posts/new" className="neo-btn">
            + New Post
          </a>
        </div>

        {/* Stats Grid */}
        {statsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Followers", value: stats?.totalFollowers.toLocaleString() || "0", change: "+12%", icon: Users, color: "bg-brand-blue" },
              { label: "Engagement Rate", value: `${stats?.engagementRate}%` || "0%", change: "+0.8%", icon: TrendingUp, color: "bg-brand-yellow" },
              { label: "Posts Scheduled", value: stats?.postsScheduled.toString() || "0", change: "Next: 2h", icon: CalendarIcon, color: "bg-green-500" },
              { label: "Mentions", value: stats?.mentions.toString() || "0", change: "+5 today", icon: MessageSquare, color: "bg-purple-500" },
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
        )}

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

            {postsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : upcomingPosts && upcomingPosts.length > 0 ? (
              <div className="space-y-4">
                {upcomingPosts.map((post) => (
                  <div key={post.id} className="neo-card p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 border-2 border-black flex items-center justify-center font-bold text-xl">
                        {getPlatformInitial(post.platformId)}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg leading-tight">{post.title}</h4>
                        <div className="flex gap-2 text-xs font-mono mt-1 text-gray-600">
                          <span>{getPlatformName(post.platformId)}</span>
                          <span>•</span>
                          <span>{post.postType || "Post"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm">
                        {post.scheduledFor ? format(new Date(post.scheduledFor), "MMM d, h:mm a") : "Not scheduled"}
                      </div>
                      <span className={`
                        inline-block px-2 py-0.5 text-xs font-bold border border-black mt-1
                        ${post.status === 'scheduled' ? 'bg-blue-400' : 'bg-yellow-400'}
                      `}>
                        {post.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="neo-card p-8 text-center text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-mono">No upcoming posts scheduled</p>
                <a href="/posts/new" className="neo-btn mt-4">Create First Post</a>
              </div>
            )}
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
                <a href="/assets" className="w-full text-left px-3 py-2 hover:bg-gray-100 font-mono text-sm border border-transparent hover:border-black transition-all flex justify-between items-center group block">
                  Generate Asset <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                </a>
                <a href="/calendar" className="w-full text-left px-3 py-2 hover:bg-gray-100 font-mono text-sm border border-transparent hover:border-black transition-all flex justify-between items-center group block">
                  Review Drafts <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                </a>
                <a href="/analytics" className="w-full text-left px-3 py-2 hover:bg-gray-100 font-mono text-sm border border-transparent hover:border-black transition-all flex justify-between items-center group block">
                  Community Reports <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
