import { useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2, Palette, LayoutGrid } from "lucide-react";
import { TemplateCard, SizePresetPicker } from "@/components/design";

export default function Design() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sizePickerOpen, setSizePickerOpen] = useState(false);

  // Fetch templates and presets
  const { data: templates, isLoading, refetch } = trpc.templates.list.useQuery();
  const { data: presets = [] } = trpc.templates.presets.useQuery();

  // Mutations
  const deleteMutation = trpc.templates.delete.useMutation({
    onSuccess: () => {
      toast.success("Template deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const handleCreateNew = (width: number, height: number, presetId?: string) => {
    navigate(`/design/new?width=${width}&height=${height}${presetId ? `&preset=${presetId}` : ""}`);
  };

  const handleSelectTemplate = (id: number) => {
    navigate(`/design/${id}`);
  };

  const handleDuplicateTemplate = async (id: number) => {
    // TODO: Implement duplicate functionality
    toast.info("Duplicating template...");
  };

  const handleDeleteTemplate = (id: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate({ id });
    }
  };

  // Filter templates
  const filteredTemplates = templates?.filter((template) => {
    const matchesSearch =
      !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "system" && template.userId === null) ||
      (filter === "custom" && template.userId !== null);
    return matchesSearch && matchesFilter;
  });

  const systemTemplates = filteredTemplates?.filter((t) => t.userId === null) || [];
  const customTemplates = filteredTemplates?.filter((t) => t.userId !== null) || [];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
              Design Studio
            </h1>
            <p className="text-gray-600 font-mono text-sm md:text-base">
              Create stunning social media graphics with templates and custom designs.
            </p>
          </div>
          <Button onClick={() => setSizePickerOpen(true)} className="neo-btn">
            <Plus className="w-4 h-4 mr-2" />
            New Design
          </Button>
        </div>

        {/* Quick Start - Size Presets */}
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="font-mono font-bold uppercase text-sm mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Quick Start
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {presets.slice(0, 5).map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleCreateNew(preset.width, preset.height, preset.id)}
                className="p-3 border-2 border-black hover:bg-brand-yellow transition-colors text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">
                    {preset.platform === "instagram"
                      ? "📷"
                      : preset.platform === "linkedin"
                      ? "💼"
                      : preset.platform === "x"
                      ? "🐦"
                      : "📱"}
                  </span>
                  <span className="font-bold text-sm capitalize">{preset.platform}</span>
                </div>
                <p className="font-mono text-xs text-gray-600">{preset.format}</p>
                <p className="font-mono text-[10px] text-gray-400">
                  {preset.width} × {preset.height}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {["all", "system", "custom"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  px-4 py-2 font-mono font-bold uppercase text-sm border-2 border-black transition-all whitespace-nowrap
                  ${
                    filter === f
                      ? "bg-black text-white shadow-[2px_2px_0px_0px_#FCD34D]"
                      : "bg-white text-black hover:bg-gray-100"
                  }
                `}
              >
                {f === "all" ? "All Templates" : f === "system" ? "Pre-built" : "My Designs"}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-2 border-black pl-10 font-mono text-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <>
            {/* System Templates */}
            {(filter === "all" || filter === "system") && systemTemplates.length > 0 && (
              <div>
                <h2 className="font-mono font-bold uppercase text-sm mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
                  <LayoutGrid className="w-4 h-4" />
                  Pre-built Templates
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {systemTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={handleSelectTemplate}
                      showActions={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Custom Templates */}
            {(filter === "all" || filter === "custom") && (
              <div>
                <h2 className="font-mono font-bold uppercase text-sm mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
                  <Palette className="w-4 h-4" />
                  My Designs
                </h2>
                {customTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {customTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onSelect={handleSelectTemplate}
                        onDuplicate={handleDuplicateTemplate}
                        onDelete={handleDeleteTemplate}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="neo-card p-12 text-center">
                    <Palette className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="font-bold text-xl mb-2">No Custom Designs Yet</h3>
                    <p className="text-gray-600 mb-4 font-mono text-sm">
                      Create your first custom design or start from a template.
                    </p>
                    <Button onClick={() => setSizePickerOpen(true)} className="neo-btn">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Design
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {filteredTemplates?.length === 0 && (
              <div className="neo-card p-12 text-center">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="font-bold text-xl mb-2">No Templates Found</h3>
                <p className="text-gray-600 font-mono text-sm">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Size Preset Picker Dialog */}
      <SizePresetPicker
        open={sizePickerOpen}
        onOpenChange={setSizePickerOpen}
        presets={presets}
        onSelect={handleCreateNew}
      />
    </Layout>
  );
}

