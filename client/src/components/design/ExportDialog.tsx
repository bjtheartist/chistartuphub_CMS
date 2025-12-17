import { useState } from "react";
import { Download, Save, FileImage, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DesignCanvasRef } from "./DesignCanvas";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvasRef: React.RefObject<DesignCanvasRef | null>;
  canvasWidth: number;
  canvasHeight: number;
  onSaveToAssets?: (name: string, dataUrl: string) => Promise<void>;
}

export default function ExportDialog({
  open,
  onOpenChange,
  canvasRef,
  canvasWidth,
  canvasHeight,
  onSaveToAssets,
}: ExportDialogProps) {
  const [fileName, setFileName] = useState("design");
  const [isSaving, setIsSaving] = useState(false);
  const [multiplier, setMultiplier] = useState(1);

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const dataUrl = canvasRef.current.toDataURL({
      format: "png",
      quality: 1,
      multiplier,
    });

    // Create download link
    const link = document.createElement("a");
    link.download = `${fileName}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onOpenChange(false);
  };

  const handleSaveToAssets = async () => {
    if (!canvasRef.current || !onSaveToAssets) return;

    setIsSaving(true);
    try {
      const dataUrl = canvasRef.current.toDataURL({
        format: "png",
        quality: 1,
        multiplier,
      });

      await onSaveToAssets(fileName, dataUrl);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save to assets:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const exportWidth = canvasWidth * multiplier;
  const exportHeight = canvasHeight * multiplier;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-mono font-bold uppercase">Export Design</DialogTitle>
          <DialogDescription>
            Download your design as a PNG image or save it to your asset library.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Name */}
          <div>
            <Label className="font-mono font-bold uppercase text-xs mb-2 block">
              File Name
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="border-2 border-black font-mono"
                placeholder="design"
              />
              <span className="font-mono text-gray-500">.png</span>
            </div>
          </div>

          {/* Export Size */}
          <div>
            <Label className="font-mono font-bold uppercase text-xs mb-2 block">
              Export Size
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((m) => (
                <Button
                  key={m}
                  variant={multiplier === m ? "default" : "outline"}
                  className={`border-2 border-black ${
                    multiplier === m ? "bg-black text-white" : ""
                  }`}
                  onClick={() => setMultiplier(m)}
                >
                  {m}x
                </Button>
              ))}
            </div>
            <p className="font-mono text-xs text-gray-500 mt-2">
              Output: {exportWidth} × {exportHeight} px
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-100 p-4 border-2 border-black">
            <div className="flex items-center gap-3">
              <FileImage className="w-8 h-8 text-gray-600" />
              <div>
                <p className="font-mono font-bold">{fileName}.png</p>
                <p className="font-mono text-xs text-gray-500">
                  {exportWidth} × {exportHeight} pixels
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleDownload}
            className="w-full neo-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PNG
          </Button>

          {onSaveToAssets && (
            <Button
              variant="outline"
              onClick={handleSaveToAssets}
              disabled={isSaving}
              className="w-full border-2 border-black"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save to Asset Library
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

