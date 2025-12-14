import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Calendar, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Drafts() {
  const utils = trpc.useUtils();
  
  const { data: drafts, isLoading } = trpc.posts.list.useQuery({
    status: "draft",
  });

  const deleteMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      toast.success("Draft deleted");
      utils.posts.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete draft: ${error.message}`);
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this draft?")) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tight mb-2">
              REVIEW DRAFTS
            </h1>
            <p className="text-gray-600 font-mono text-sm">
              {drafts?.length || 0} draft{drafts?.length !== 1 ? "s" : ""} waiting for review
            </p>
          </div>
          <Link href="/create-post">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              + NEW DRAFT
            </Button>
          </Link>
        </div>

        {/* Drafts List */}
        {!drafts || drafts.length === 0 ? (
          <Card className="p-12 text-center border-4 border-black shadow-[8px_8px_0px_0px_rgba(252,211,77,1)]">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-black uppercase mb-4">NO DRAFTS YET</h2>
              <p className="text-gray-600 font-mono mb-6">
                Create your first draft to start building content for your social media channels.
              </p>
              <Link href="/create-post">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold border-2 border-black">
                  CREATE FIRST DRAFT
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <Card
                key={draft.id}
                className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Platform Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-black text-white font-mono text-xs px-2 py-1 border-2 border-black">
                        PLATFORM #{draft.platformId}
                      </Badge>
                      {draft.postType && (
                        <Badge className="bg-white text-black font-mono text-xs px-2 py-1 border-2 border-black">
                          {draft.postType}
                        </Badge>
                      )}
                    </div>

                    {/* Content Preview */}
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">
                      {draft.content.substring(0, 100)}
                      {draft.content.length > 100 ? "..." : ""}
                    </h3>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 font-mono">
                      <span>
                        Created: {format(new Date(draft.createdAt), "MMM d, yyyy")}
                      </span>
                      {draft.scheduledFor && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Scheduled: {format(new Date(draft.scheduledFor), "MMM d, yyyy h:mm a")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/create-post?id=${draft.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        EDIT
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(draft.id)}
                      className="border-2 border-red-500 text-red-500 hover:bg-red-50 shadow-[2px_2px_0px_0px_rgba(239,68,68,1)]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
