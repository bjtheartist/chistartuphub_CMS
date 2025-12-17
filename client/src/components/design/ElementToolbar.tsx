import { useRef } from "react";
import { 
  Type, 
  Square, 
  Circle, 
  Image as ImageIcon, 
  Upload,
  Heading1,
  Heading2,
  AlignLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DesignCanvasRef } from "./DesignCanvas";

interface ElementToolbarProps {
  canvasRef: React.RefObject<DesignCanvasRef | null>;
  assets?: Array<{ id: number; url: string; name: string }>;
}

export default function ElementToolbar({ canvasRef, assets }: ElementToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddHeading = () => {
    canvasRef.current?.addText("Heading", {
      fontSize: 48,
      fontWeight: "bold",
      fontFamily: "Inter, sans-serif",
    });
  };

  const handleAddSubheading = () => {
    canvasRef.current?.addText("Subheading", {
      fontSize: 32,
      fontWeight: "600",
      fontFamily: "Inter, sans-serif",
    });
  };

  const handleAddBody = () => {
    canvasRef.current?.addText("Body text goes here", {
      fontSize: 18,
      fontWeight: "normal",
      fontFamily: "Inter, sans-serif",
    });
  };

  const handleAddRect = () => {
    canvasRef.current?.addRect();
  };

  const handleAddCircle = () => {
    canvasRef.current?.addCircle();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      canvasRef.current?.addImage(dataUrl);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddAsset = (url: string) => {
    canvasRef.current?.addImage(url);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-mono font-bold uppercase text-xs mb-3 text-gray-500">Text</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start border-2 border-black hover:bg-brand-yellow hover:text-black"
            onClick={handleAddHeading}
          >
            <Heading1 className="w-4 h-4 mr-2" />
            Heading
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start border-2 border-black hover:bg-brand-yellow hover:text-black"
            onClick={handleAddSubheading}
          >
            <Heading2 className="w-4 h-4 mr-2" />
            Subheading
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start border-2 border-black hover:bg-brand-yellow hover:text-black"
            onClick={handleAddBody}
          >
            <AlignLeft className="w-4 h-4 mr-2" />
            Body Text
          </Button>
        </div>
      </div>

      <div>
        <h3 className="font-mono font-bold uppercase text-xs mb-3 text-gray-500">Shapes</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="border-2 border-black hover:bg-brand-blue hover:text-white"
            onClick={handleAddRect}
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="border-2 border-black hover:bg-brand-yellow hover:text-black"
            onClick={handleAddCircle}
          >
            <Circle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div>
        <h3 className="font-mono font-bold uppercase text-xs mb-3 text-gray-500">Images</h3>
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            className="w-full justify-start border-2 border-black hover:bg-gray-100"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </Button>

          {assets && assets.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-black hover:bg-gray-100"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  From Library
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-2" align="start">
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {assets.map((asset) => (
                    <button
                      key={asset.id}
                      className="aspect-square border-2 border-black hover:border-brand-blue overflow-hidden"
                      onClick={() => handleAddAsset(asset.url)}
                    >
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
}

