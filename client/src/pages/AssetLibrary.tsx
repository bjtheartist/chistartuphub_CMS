import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Search, Filter, Download, Copy, ExternalLink, Upload, Loader2, X, Palette, Edit } from "lucide-react";
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AssetLibrary() {
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    name: "",
    category: "social",
    assetType: "image",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: assets, isLoading, refetch } = trpc.assets.list.useQuery(
    filter !== "all" ? { category: filter } : undefined
  );
  
  const uploadMutation = trpc.assets.upload.useMutation({
    onSuccess: () => {
      toast.success("Asset uploaded successfully!");
      setUploadDialogOpen(false);
      resetUploadForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const deleteMutation = trpc.assets.delete.useMutation({
    onSuccess: () => {
      toast.success("Asset deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });

  const resetUploadForm = () => {
    setUploadData({ name: "", category: "social", assetType: "image" });
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadData(prev => ({ ...prev, name: file.name }));

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    if (!uploadData.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        // Get image dimensions if it's an image
        let width: number | undefined;
        let height: number | undefined;
        
        if (selectedFile.type.startsWith("image/")) {
          const img = new Image();
          img.src = previewUrl!;
          await new Promise(resolve => { img.onload = resolve; });
          width = img.width;
          height = img.height;
        }

        uploadMutation.mutate({
          name: uploadData.name,
          fileData: base64,
          mimeType: selectedFile.type,
          category: uploadData.category,
          assetType: uploadData.assetType,
          width,
          height,
        });
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error("Failed to process file");
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const filteredAssets = assets?.filter(asset => {
    if (!searchQuery) return true;
    return asset.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
              Asset Library
            </h1>
            <p className="text-gray-600 font-mono text-sm md:text-base">
              Central repository for all brand assets and templates.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate("/design")}
              className="neo-btn-outline flex items-center gap-2"
            >
              <Palette className="w-4 h-4" />
              Design Studio
            </button>
            <button 
              onClick={() => setUploadDialogOpen(true)}
              className="neo-btn flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Upload New
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {["all", "branding", "social", "campaigns", "designs"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  px-4 py-2 font-mono font-bold uppercase text-sm border-2 border-black transition-all
                  ${filter === f 
                    ? "bg-black text-white shadow-[2px_2px_0px_0px_#FCD34D]" 
                    : "bg-white text-black hover:bg-gray-100"}
                `}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="SEARCH ASSETS..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:shadow-[2px_2px_0px_0px_#3B82F6]"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Asset Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredAssets && filteredAssets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="neo-card group flex flex-col h-full">
                {/* Image Preview */}
                <div className="aspect-square bg-gray-100 border-b-2 border-black relative overflow-hidden">
                  {asset.mimeType?.startsWith("image/") ? (
                    <img 
                      src={asset.url} 
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-mono text-xs p-4">
                      <div className="text-center">
                        <div className="mb-2 font-bold">{asset.name}</div>
                        <div className="text-[10px] text-gray-500">{asset.mimeType}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {asset.category === "designs" && (
                      <button
                        onClick={() => navigate("/design/new")}
                        className="p-2 bg-white border-2 border-black hover:bg-brand-blue hover:text-white transition-colors"
                        title="Edit in Designer"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                    <a 
                      href={asset.url} 
                      download 
                      className="p-2 bg-white border-2 border-black hover:bg-brand-yellow transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                    <button 
                      onClick={() => handleCopyUrl(asset.url)}
                      className="p-2 bg-white border-2 border-black hover:bg-brand-blue hover:text-white transition-colors" 
                      title="Copy Link"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(asset.id, asset.name)}
                      className="p-2 bg-white border-2 border-black hover:bg-red-500 hover:text-white transition-colors" 
                      title="Delete"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-[10px] font-bold bg-gray-200 px-1 py-0.5 uppercase">
                        {asset.category || "uncategorized"}
                      </span>
                      <span className="font-mono text-[10px] text-gray-500">
                        {asset.assetType || "file"}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg leading-tight mb-1">{asset.name}</h3>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t-2 border-gray-100 flex justify-between items-center">
                    <span className="font-mono text-xs text-gray-500">
                      {asset.width && asset.height ? `${asset.width}x${asset.height}` : "N/A"}
                    </span>
                    <a 
                      href={asset.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold uppercase hover:underline flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="neo-card p-12 text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="font-bold text-xl mb-2">No Assets Found</h3>
            <p className="text-gray-600 mb-4">Upload your first asset to get started</p>
            <button 
              onClick={() => setUploadDialogOpen(true)}
              className="neo-btn"
            >
              Upload Asset
            </button>
          </div>
        )}

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-mono font-bold uppercase">Upload New Asset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="file" className="font-mono font-bold uppercase text-sm mb-2 block">
                  File
                </Label>
                <input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="w-full border-2 border-black p-2 font-mono text-sm"
                />
                {previewUrl && (
                  <div className="mt-4 border-2 border-black p-2">
                    <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-48 object-contain" />
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="name" className="font-mono font-bold uppercase text-sm mb-2 block">
                  Name
                </Label>
                <Input
                  id="name"
                  value={uploadData.name}
                  onChange={(e) => setUploadData(prev => ({ ...prev, name: e.target.value }))}
                  className="border-2 border-black font-mono"
                  placeholder="Asset name"
                />
              </div>
              
              <div>
                <Label htmlFor="category" className="font-mono font-bold uppercase text-sm mb-2 block">
                  Category
                </Label>
                <Select 
                  value={uploadData.category} 
                  onValueChange={(value) => setUploadData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="border-2 border-black font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="branding">Branding</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="campaigns">Campaigns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="assetType" className="font-mono font-bold uppercase text-sm mb-2 block">
                  Asset Type
                </Label>
                <Select 
                  value={uploadData.assetType} 
                  onValueChange={(value) => setUploadData(prev => ({ ...prev, assetType: value }))}
                >
                  <SelectTrigger className="border-2 border-black font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="template">Template</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setUploadDialogOpen(false);
                  resetUploadForm();
                }}
                className="font-mono font-bold"
              >
                Cancel
              </Button>
              <button
                onClick={handleUpload}
                disabled={uploadMutation.isPending || !selectedFile}
                className="neo-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
