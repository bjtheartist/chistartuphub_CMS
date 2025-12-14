import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { CalendarIcon, Loader2, Save, Send, Eye, Sparkles } from "lucide-react";
import { format } from "date-fns";

interface PostFormData {
  title: string;
  content: string;
  platformId: number | null;
  postType: string;
  status: "draft" | "scheduled" | "published";
  scheduledFor?: Date;
  linkedGoalId?: number;
}

export default function CreatePost() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    content: "",
    platformId: null,
    postType: "text",
    status: "draft",
  });
  const [showScheduler, setShowScheduler] = useState(false);

  const { data: platforms } = trpc.platforms.list.useQuery();
  const { data: goals } = trpc.goals.list.useQuery({ status: "active" });
  const { data: assets } = trpc.assets.list.useQuery();

  const createMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      toast.success("Post created successfully!");
      navigate("/calendar");
    },
    onError: (error) => {
      toast.error(`Failed to create post: ${error.message}`);
    },
  });

  const handleSubmit = (status: "draft" | "scheduled" | "published") => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Please enter content");
      return;
    }
    if (!formData.platformId) {
      toast.error("Please select a platform");
      return;
    }
    if (status === "scheduled" && !formData.scheduledFor) {
      toast.error("Please select a schedule date");
      return;
    }

    createMutation.mutate({
      title: formData.title,
      content: formData.content,
      platformId: formData.platformId,
      postType: formData.postType,
      status,
      scheduledFor: status === "scheduled" ? formData.scheduledFor : undefined,
    });
  };

  const selectedPlatform = platforms?.find(p => p.id === formData.platformId);
  const characterLimit = selectedPlatform?.slug === "x" ? 280 : 3000;
  const remainingChars = characterLimit - formData.content.length;

  // Platform-specific templates
  const templates = {
    linkedin: {
      article: "🚀 [Hook]\n\n[Problem Statement]\n\n[Solution/Insight]\n\n[Call to Action]\n\n#ChicagoStartups #Entrepreneurship",
      announcement: "📢 Exciting News!\n\n[Announcement]\n\n[Details]\n\n[Next Steps]\n\n#ChicagoTech",
    },
    x: {
      thread: "1/ [Hook - Start with a bold statement]\n\n2/ [Expand on the problem]\n\n3/ [Share your insight]\n\n4/ [Provide actionable advice]\n\n5/ [Conclusion + CTA]",
      single: "[Hook] [Value] [CTA]\n\n#ChicagoStartups",
    },
    instagram: {
      caption: "✨ [Attention-grabbing opening]\n\n[Story or insight]\n\n[Value proposition]\n\n💡 [Call to action]\n\n---\n#ChicagoStartups #Entrepreneurship #StartupLife",
      story: "[Quick tip or insight]\n\nSwipe up to learn more! 👆",
    },
  };

  const applyTemplate = (template: string) => {
    setFormData(prev => ({ ...prev, content: template }));
    toast.success("Template applied!");
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
              Create New Post
            </h1>
            <p className="text-gray-600 font-mono text-sm">
              Craft your next social media masterpiece.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/calendar")}
              className="font-mono font-bold"
            >
              Cancel
            </Button>
            <button
              onClick={() => handleSubmit("draft")}
              disabled={createMutation.isPending}
              className="neo-btn bg-white text-black hover:bg-gray-100 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button
              onClick={() => {
                if (showScheduler && formData.scheduledFor) {
                  handleSubmit("scheduled");
                } else {
                  handleSubmit("published");
                }
              }}
              disabled={createMutation.isPending}
              className="neo-btn flex items-center gap-2"
            >
              {createMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
              ) : showScheduler ? (
                <><CalendarIcon className="w-4 h-4" /> Schedule</>
              ) : (
                <><Send className="w-4 h-4" /> Publish Now</>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="neo-card p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="font-mono font-bold uppercase text-sm mb-2 block">
                    Post Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter a descriptive title..."
                    className="border-2 border-black font-bold text-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="content" className="font-mono font-bold uppercase text-sm">
                      Content
                    </Label>
                    <span className={`font-mono text-xs ${remainingChars < 0 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                      {remainingChars} characters remaining
                    </span>
                  </div>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your post content here..."
                    className="border-2 border-black min-h-[300px] font-mono text-sm"
                  />
                </div>
              </div>
            </Card>

            {/* Templates */}
            {selectedPlatform && (
              <Card className="neo-card p-6">
                <h3 className="font-mono font-bold uppercase text-sm mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Platform Templates
                </h3>
                <Tabs defaultValue="template1" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    {selectedPlatform.slug === "linkedin" && (
                      <>
                        <TabsTrigger value="article">Article</TabsTrigger>
                        <TabsTrigger value="announcement">Announcement</TabsTrigger>
                      </>
                    )}
                    {selectedPlatform.slug === "x" && (
                      <>
                        <TabsTrigger value="thread">Thread</TabsTrigger>
                        <TabsTrigger value="single">Single Post</TabsTrigger>
                      </>
                    )}
                    {selectedPlatform.slug === "instagram" && (
                      <>
                        <TabsTrigger value="caption">Caption</TabsTrigger>
                        <TabsTrigger value="story">Story</TabsTrigger>
                      </>
                    )}
                  </TabsList>
                  {selectedPlatform.slug === "linkedin" && (
                    <>
                      <TabsContent value="article" className="space-y-2">
                        <pre className="bg-gray-50 p-3 rounded border text-xs font-mono whitespace-pre-wrap">
                          {templates.linkedin.article}
                        </pre>
                        <Button onClick={() => applyTemplate(templates.linkedin.article)} className="w-full">
                          Apply Template
                        </Button>
                      </TabsContent>
                      <TabsContent value="announcement" className="space-y-2">
                        <pre className="bg-gray-50 p-3 rounded border text-xs font-mono whitespace-pre-wrap">
                          {templates.linkedin.announcement}
                        </pre>
                        <Button onClick={() => applyTemplate(templates.linkedin.announcement)} className="w-full">
                          Apply Template
                        </Button>
                      </TabsContent>
                    </>
                  )}
                  {selectedPlatform.slug === "x" && (
                    <>
                      <TabsContent value="thread" className="space-y-2">
                        <pre className="bg-gray-50 p-3 rounded border text-xs font-mono whitespace-pre-wrap">
                          {templates.x.thread}
                        </pre>
                        <Button onClick={() => applyTemplate(templates.x.thread)} className="w-full">
                          Apply Template
                        </Button>
                      </TabsContent>
                      <TabsContent value="single" className="space-y-2">
                        <pre className="bg-gray-50 p-3 rounded border text-xs font-mono whitespace-pre-wrap">
                          {templates.x.single}
                        </pre>
                        <Button onClick={() => applyTemplate(templates.x.single)} className="w-full">
                          Apply Template
                        </Button>
                      </TabsContent>
                    </>
                  )}
                  {selectedPlatform.slug === "instagram" && (
                    <>
                      <TabsContent value="caption" className="space-y-2">
                        <pre className="bg-gray-50 p-3 rounded border text-xs font-mono whitespace-pre-wrap">
                          {templates.instagram.caption}
                        </pre>
                        <Button onClick={() => applyTemplate(templates.instagram.caption)} className="w-full">
                          Apply Template
                        </Button>
                      </TabsContent>
                      <TabsContent value="story" className="space-y-2">
                        <pre className="bg-gray-50 p-3 rounded border text-xs font-mono whitespace-pre-wrap">
                          {templates.instagram.story}
                        </pre>
                        <Button onClick={() => applyTemplate(templates.instagram.story)} className="w-full">
                          Apply Template
                        </Button>
                      </TabsContent>
                    </>
                  )}
                </Tabs>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Platform Selection */}
            <Card className="neo-card p-4">
              <h3 className="font-mono font-bold uppercase text-sm mb-4">Platform</h3>
              <Select
                value={formData.platformId?.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, platformId: parseInt(value) }))}
              >
                <SelectTrigger className="border-2 border-black font-mono">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms?.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id.toString()}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            {/* Post Type */}
            <Card className="neo-card p-4">
              <h3 className="font-mono font-bold uppercase text-sm mb-4">Post Type</h3>
              <Select
                value={formData.postType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, postType: value }))}
              >
                <SelectTrigger className="border-2 border-black font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Post</SelectItem>
                  <SelectItem value="image">Image Post</SelectItem>
                  <SelectItem value="video">Video Post</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="thread">Thread</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            {/* Scheduling */}
            <Card className="neo-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono font-bold uppercase text-sm">Schedule</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showScheduler}
                    onChange={(e) => setShowScheduler(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-mono">Enable</span>
                </label>
              </div>
              {showScheduler && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-mono border-2 border-black"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduledFor ? format(formData.scheduledFor, "PPP p") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.scheduledFor}
                      onSelect={(date) => setFormData(prev => ({ ...prev, scheduledFor: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </Card>

            {/* Link to Goal */}
            {goals && goals.length > 0 && (
              <Card className="neo-card p-4">
                <h3 className="font-mono font-bold uppercase text-sm mb-4">Link to Goal</h3>
                <Select
                  value={formData.linkedGoalId?.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, linkedGoalId: parseInt(value) }))}
                >
                  <SelectTrigger className="border-2 border-black font-mono">
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id.toString()}>
                        {goal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>
            )}

            {/* Preview */}
            <Card className="neo-card p-4">
              <h3 className="font-mono font-bold uppercase text-sm mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Preview
              </h3>
              <div className="bg-gray-50 border-2 border-gray-200 rounded p-4 min-h-[150px]">
                {formData.content ? (
                  <div className="space-y-2">
                    <p className="font-bold text-sm">{formData.title || "Untitled Post"}</p>
                    <p className="text-sm whitespace-pre-wrap">{formData.content}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm font-mono">Your preview will appear here...</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
