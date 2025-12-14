import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, ExternalLink, Trash2, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function MarketIntel() {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [newNote, setNewNote] = useState({
    content: "",
    source: "Internal",
    url: "",
    title: "",
  });

  const utils = trpc.useUtils();
  const { data: intelligence, isLoading } = trpc.intelligence.list.useQuery(
    filter ? { source: filter } : undefined
  );

  const createMutation = trpc.intelligence.create.useMutation({
    onSuccess: () => {
      toast.success("Intelligence saved!");
      setNewNote({ content: "", source: "Internal", url: "", title: "" });
      utils.intelligence.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const deleteMutation = trpc.intelligence.delete.useMutation({
    onSuccess: () => {
      toast.success("Intelligence deleted");
      utils.intelligence.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const handleAddNote = () => {
    if (!newNote.content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    createMutation.mutate(newNote);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this intelligence?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleConvertToPost = (intel: any) => {
    // Navigate to create post page with pre-filled content
    setLocation(`/posts/new?content=${encodeURIComponent(intel.content)}&source=intel-${intel.id}`);
  };

  const sources = ["TechCrunch", "Twitter", "Competitor Blog", "Internal"];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
            Market Intel
          </h1>
          <p className="text-gray-600 font-mono text-sm md:text-base">
            Capture news, notes, and competitive signals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - New Intelligence Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-4 border-black bg-yellow-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-8">
              <h2 className="text-xl font-black uppercase mb-4">NEW INTELLIGENCE</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-mono font-bold uppercase mb-2">
                    Title (Optional)
                  </label>
                  <Input
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="Quick title..."
                    className="border-2 border-black font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono font-bold uppercase mb-2">
                    Content
                  </label>
                  <Textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Paste URL or type note here..."
                    rows={6}
                    className="border-2 border-black font-mono text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono font-bold uppercase mb-2">
                    Source
                  </label>
                  <select
                    value={newNote.source}
                    onChange={(e) => setNewNote({ ...newNote, source: e.target.value })}
                    className="w-full border-2 border-black p-2 font-mono text-sm bg-white"
                  >
                    {sources.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-mono font-bold uppercase mb-2">
                    URL (Optional)
                  </label>
                  <Input
                    value={newNote.url}
                    onChange={(e) => setNewNote({ ...newNote, url: e.target.value })}
                    placeholder="https://..."
                    className="border-2 border-black font-mono text-sm"
                  />
                </div>

                <Button
                  onClick={handleAddNote}
                  disabled={createMutation.isPending}
                  className="w-full bg-black text-white font-mono font-bold uppercase py-6 border-2 border-black hover:bg-gray-900"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      SAVING...
                    </>
                  ) : (
                    "ADD NOTE"
                  )}
                </Button>
              </div>
            </Card>

            {/* Sources Filter */}
            <Card className="p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-6">
              <h3 className="text-sm font-black uppercase mb-3">SOURCES</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter(undefined)}
                  className={`px-3 py-1 text-xs font-mono font-bold uppercase border-2 border-black transition-all ${
                    filter === undefined
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  ALL
                </button>
                {sources.map((source) => (
                  <button
                    key={source}
                    onClick={() => setFilter(source)}
                    className={`px-3 py-1 text-xs font-mono font-bold uppercase border-2 border-black transition-all ${
                      filter === source
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-gray-100"
                    }`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Intelligence Cards */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : intelligence && intelligence.length > 0 ? (
              <div className="space-y-4">
                {intelligence.map((intel) => (
                  <Card
                    key={intel.id}
                    className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    {/* Source Badge */}
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="bg-black text-white font-mono text-xs px-2 py-1 border-2 border-black uppercase">
                        {intel.source || "Unknown"}
                      </Badge>
                      <span className="text-xs font-mono text-gray-500">
                        {format(new Date(intel.createdAt), "MM/dd/yyyy")}
                      </span>
                    </div>

                    {/* Title */}
                    {intel.title && (
                      <h3 className="font-bold text-lg mb-2">{intel.title}</h3>
                    )}

                    {/* Content */}
                    <p className="text-sm font-mono mb-4 whitespace-pre-wrap">
                      {intel.content}
                    </p>

                    {/* URL */}
                    {intel.url && (
                      <a
                        href={intel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1 mb-4"
                      >
                        {intel.url.substring(0, 50)}...
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t-2 border-gray-200">
                      <Button
                        onClick={() => handleConvertToPost(intel)}
                        className="flex-1 bg-white text-black font-mono font-bold text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      >
                        CONVERT TO POST
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(intel.id)}
                        variant="outline"
                        size="sm"
                        className="border-2 border-red-500 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center border-4 border-black shadow-[8px_8px_0px_0px_rgba(252,211,77,1)]">
                <h2 className="text-2xl font-black uppercase mb-4">NO INTELLIGENCE YET</h2>
                <p className="text-gray-600 font-mono mb-6">
                  Start capturing competitive signals and market insights to fuel your content strategy.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
