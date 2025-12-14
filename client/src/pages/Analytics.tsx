import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Heart, MessageCircle, Share2, Eye, Target } from "lucide-react";

export default function Analytics() {
  const { data: stats } = trpc.dashboard.stats.useQuery();

  const metrics = [
    {
      label: "Total Reach",
      value: "45,230",
      change: "+12.5%",
      trend: "up",
      icon: Eye,
      color: "blue",
    },
    {
      label: "Engagement Rate",
      value: "5.2%",
      change: "+0.8%",
      trend: "up",
      icon: Heart,
      color: "pink",
    },
    {
      label: "Total Followers",
      value: stats?.totalFollowers.toLocaleString() || "12,450",
      change: "+123",
      trend: "up",
      icon: Users,
      color: "purple",
    },
    {
      label: "Avg. Comments",
      value: "28",
      change: "-3",
      trend: "down",
      icon: MessageCircle,
      color: "green",
    },
    {
      label: "Share Rate",
      value: "2.1%",
      change: "+0.3%",
      trend: "up",
      icon: Share2,
      color: "yellow",
    },
    {
      label: "Goal Progress",
      value: "67%",
      change: "+15%",
      trend: "up",
      icon: Target,
      color: "orange",
    },
  ];

  const platformPerformance = [
    { platform: "LinkedIn", posts: 24, engagement: "6.8%", reach: "18.5K", color: "blue" },
    { platform: "X (Twitter)", posts: 45, engagement: "4.2%", reach: "15.2K", color: "black" },
    { platform: "Instagram", posts: 18, engagement: "5.9%", reach: "11.5K", color: "pink" },
  ];

  const topPosts = [
    {
      id: 1,
      content: "Chicago's startup ecosystem is heating up! 🔥 Just announced: $2.5M seed round for...",
      platform: "LinkedIn",
      engagement: "892",
      reach: "12.3K",
      date: "Dec 10, 2024",
    },
    {
      id: 2,
      content: "Founder spotlight: Meet Sarah Chen, building the future of healthcare tech in Chicago...",
      platform: "LinkedIn",
      engagement: "654",
      reach: "9.8K",
      date: "Dec 8, 2024",
    },
    {
      id: 3,
      content: "5 Chicago-specific resources every founder should know 🚀 Thread 👇",
      platform: "X",
      engagement: "523",
      reach: "8.2K",
      date: "Dec 6, 2024",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
            Analytics
          </h1>
          <p className="text-gray-600 font-mono text-sm md:text-base">
            Track performance across all platforms and campaigns.
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const colorClasses = {
              blue: "bg-blue-100 text-blue-600",
              pink: "bg-pink-100 text-pink-600",
              purple: "bg-purple-100 text-purple-600",
              green: "bg-green-100 text-green-600",
              yellow: "bg-yellow-100 text-yellow-600",
              orange: "bg-orange-100 text-orange-600",
            };

            return (
              <Card
                key={metric.label}
                className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-mono font-bold ${
                    metric.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}>
                    {metric.trend === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {metric.change}
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 font-mono text-sm uppercase mb-1">
                    {metric.label}
                  </p>
                  <p className="text-3xl font-black">{metric.value}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Platform Performance */}
        <Card className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black uppercase mb-6">Platform Performance</h2>
          <div className="space-y-4">
            {platformPerformance.map((platform) => (
              <div
                key={platform.platform}
                className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{platform.platform}</h3>
                  <span className="font-mono text-sm text-gray-600">
                    {platform.posts} posts
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-mono text-gray-600 uppercase mb-1">
                      Engagement Rate
                    </p>
                    <p className="text-xl font-black">{platform.engagement}</p>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-gray-600 uppercase mb-1">
                      Total Reach
                    </p>
                    <p className="text-xl font-black">{platform.reach}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Performing Posts */}
        <Card className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black uppercase mb-6">Top Performing Posts</h2>
          <div className="space-y-4">
            {topPosts.map((post, index) => (
              <div
                key={post.id}
                className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 border-2 border-black flex items-center justify-center font-black text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-sm mb-2 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-600">
                      <span className="font-bold">{post.platform}</span>
                      <span>•</span>
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.engagement} engagements</span>
                      <span>•</span>
                      <span>{post.reach} reach</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Coming Soon Section */}
        <Card className="p-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(252,211,77,1)] text-center">
          <h2 className="text-2xl font-black uppercase mb-4">More Analytics Coming Soon</h2>
          <p className="text-gray-600 font-mono mb-6 max-w-2xl mx-auto">
            We're building advanced analytics features including:
            <br />
            • Audience demographics and growth trends
            <br />
            • Best posting times analysis
            <br />
            • Competitor benchmarking
            <br />
            • Content performance predictions
          </p>
          <div className="inline-block bg-black text-white px-4 py-2 font-mono font-bold uppercase text-sm">
            Stay Tuned
          </div>
        </Card>
      </div>
    </Layout>
  );
}
