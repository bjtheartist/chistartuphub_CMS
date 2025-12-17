import { useState, useRef, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import * as fabric from "fabric";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Undo2,
  Redo2,
  Download,
  Save,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  Palette,
  Loader2,
} from "lucide-react";
import {
  DesignCanvas,
  DesignCanvasRef,
  ElementToolbar,
  PropertiesPanel,
  ExportDialog,
} from "@/components/design";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DesignEditorProps {
  templateId?: number;
  initialWidth?: number;
  initialHeight?: number;
}

export default function DesignEditor() {
  const [, params] = useRoute<{ id: string }>("/design/:id");
  const [, navigate] = useLocation();
  
  const templateId = params?.id ? parseInt(params.id) : undefined;
  const isNew = templateId === undefined || isNaN(templateId);

  // Get URL parameters for new designs
  const urlParams = new URLSearchParams(window.location.search);
  const initialWidth = parseInt(urlParams.get("width") || "1080");
  const initialHeight = parseInt(urlParams.get("height") || "1080");

  const canvasRef = useRef<DesignCanvasRef>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [templateName, setTemplateName] = useState("Untitled Design");
  const [canvasWidth, setCanvasWidth] = useState(initialWidth);
  const [canvasHeight, setCanvasHeight] = useState(initialHeight);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [zoom, setZoom] = useState(1);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch existing template
  const { data: template, isLoading: templateLoading } = trpc.templates.getById.useQuery(
    { id: templateId! },
    { enabled: !isNew && !!templateId }
  );

  // Fetch assets for the toolbar
  const { data: assets } = trpc.assets.list.useQuery();

  // Mutations
  const createMutation = trpc.templates.create.useMutation({
    onSuccess: (data) => {
      toast.success("Template saved!");
      setHasChanges(false);
      if (isNew && data.id) {
        navigate(`/design/${data.id}`, { replace: true });
      }
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const updateMutation = trpc.templates.update.useMutation({
    onSuccess: () => {
      toast.success("Template updated!");
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const exportMutation = trpc.templates.exportToAsset.useMutation({
    onSuccess: () => {
      toast.success("Design saved to asset library!");
    },
    onError: (error) => {
      toast.error(`Failed to export: ${error.message}`);
    },
  });

  // Load template data when available
  useEffect(() => {
    if (template && canvasRef.current) {
      setTemplateName(template.name);
      setCanvasWidth(template.width);
      setCanvasHeight(template.height);
      
      if (template.canvasJson) {
        canvasRef.current.loadJSON(template.canvasJson);
      }
    }
  }, [template]);

  const handleSave = async () => {
    if (!canvasRef.current) return;

    setIsSaving(true);
    const canvasJson = canvasRef.current.toJSON();

    try {
      if (isNew) {
        await createMutation.mutateAsync({
          name: templateName,
          canvasJson,
          width: canvasWidth,
          height: canvasHeight,
          category: "custom",
        });
      } else {
        await updateMutation.mutateAsync({
          id: templateId!,
          name: templateName,
          canvasJson,
          width: canvasWidth,
          height: canvasHeight,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportToAssets = async (name: string, dataUrl: string) => {
    await exportMutation.mutateAsync({
      name,
      imageData: dataUrl,
      width: canvasWidth,
      height: canvasHeight,
    });
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.25));
  };

  const handleBackgroundChange = (color: string) => {
    setBackgroundColor(color);
    canvasRef.current?.setBackgroundColor(color);
    setHasChanges(true);
  };

  // Calculate scaled canvas dimensions for display
  const displayWidth = canvasWidth * zoom;
  const displayHeight = canvasHeight * zoom;

  if (!isNew && templateLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  const imageAssets = assets?.filter((a) => a.mimeType?.startsWith("image/")) || [];

  return (
    <Layout>
      <div className="h-[calc(100vh-120px)] flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b-2 border-black px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/design")}
              className="font-mono"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <Input
              value={templateName}
              onChange={(e) => {
                setTemplateName(e.target.value);
                setHasChanges(true);
              }}
              className="border-0 font-bold text-lg w-64 focus-visible:ring-0 px-0"
              placeholder="Untitled Design"
            />
            {hasChanges && (
              <span className="font-mono text-xs text-gray-500">• Unsaved changes</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => canvasRef.current?.undo()}
                className="border-2 border-black"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => canvasRef.current?.redo()}
                className="border-2 border-black"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            {/* Zoom */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="border-2 border-black"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="font-mono text-sm w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="border-2 border-black"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            {/* Background Color */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="border-2 border-black">
                  <Palette className="w-4 h-4 mr-2" />
                  <div
                    className="w-4 h-4 border border-gray-300"
                    style={{ backgroundColor }}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="end">
                <div className="space-y-2">
                  <p className="font-mono text-xs font-bold uppercase">Background</p>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => handleBackgroundChange(e.target.value)}
                      className="w-10 h-10 border-2 border-black cursor-pointer"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => handleBackgroundChange(e.target.value)}
                      className="border-2 border-black font-mono text-sm w-24"
                    />
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {["#ffffff", "#000000", "#3B82F6", "#FCD34D", "#EF4444", "#10B981"].map(
                      (color) => (
                        <button
                          key={color}
                          className="w-6 h-6 border-2 border-black"
                          style={{ backgroundColor: color }}
                          onClick={() => handleBackgroundChange(color)}
                        />
                      )
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className="h-6 w-px bg-gray-300" />

            {/* Export & Save */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportDialogOpen(true)}
              className="border-2 border-black"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="neo-btn"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Element Toolbar */}
          <div className="w-64 bg-white border-r-2 border-black overflow-y-auto p-4">
            <h2 className="font-mono font-bold uppercase text-sm mb-4 border-b-2 border-black pb-2">
              Elements
            </h2>
            <ElementToolbar canvasRef={canvasRef} assets={imageAssets} />
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center p-8">
            <div
              className="transition-transform"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
              }}
            >
              <DesignCanvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                backgroundColor={backgroundColor}
                initialJson={template?.canvasJson || undefined}
                onSelect={setSelectedObject}
                onModified={() => setHasChanges(true)}
              />
            </div>
          </div>

          {/* Right Sidebar - Properties Panel */}
          <div className="w-72 bg-white border-l-2 border-black overflow-y-auto">
            <h2 className="font-mono font-bold uppercase text-sm p-4 border-b-2 border-black">
              Properties
            </h2>
            <PropertiesPanel
              selectedObject={selectedObject}
              canvasRef={canvasRef}
              onUpdate={() => setHasChanges(true)}
            />

            {/* Canvas Info */}
            <div className="p-4 border-t-2 border-gray-200 mt-auto">
              <h3 className="font-mono font-bold uppercase text-xs text-gray-500 mb-2">
                Canvas Size
              </h3>
              <p className="font-mono text-sm">
                {canvasWidth} × {canvasHeight} px
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        canvasRef={canvasRef}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        onSaveToAssets={handleExportToAssets}
      />
    </Layout>
  );
}

