import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SizePreset {
  id: string;
  platform: string;
  format: string;
  width: number;
  height: number;
}

interface SizePresetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: SizePreset[];
  onSelect: (width: number, height: number, presetId?: string) => void;
}

const platformIcons: Record<string, string> = {
  instagram: "📷",
  linkedin: "💼",
  x: "🐦",
  facebook: "📘",
};

export default function SizePresetPicker({
  open,
  onOpenChange,
  presets,
  onSelect,
}: SizePresetPickerProps) {
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);

  const platforms = [...new Set(presets.map((p) => p.platform))];

  const handlePresetSelect = (preset: SizePreset) => {
    onSelect(preset.width, preset.height, preset.id);
    onOpenChange(false);
  };

  const handleCustomSelect = () => {
    if (customWidth > 0 && customHeight > 0) {
      onSelect(customWidth, customHeight);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="font-mono font-bold uppercase">
            Choose Canvas Size
          </DialogTitle>
          <DialogDescription>
            Select a preset size for your target platform or enter custom dimensions.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={platforms[0]} className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${platforms.length + 1}, 1fr)` }}>
            {platforms.map((platform) => (
              <TabsTrigger key={platform} value={platform} className="font-mono text-xs uppercase">
                {platformIcons[platform] || "📱"} {platform}
              </TabsTrigger>
            ))}
            <TabsTrigger value="custom" className="font-mono text-xs uppercase">
              ⚙️ Custom
            </TabsTrigger>
          </TabsList>

          {platforms.map((platform) => (
            <TabsContent key={platform} value={platform} className="mt-4">
              <div className="grid grid-cols-2 gap-3">
                {presets
                  .filter((p) => p.platform === platform)
                  .map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className="p-4 border-2 border-black hover:bg-gray-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="border-2 border-black bg-gray-100 flex items-center justify-center"
                          style={{
                            width: 40,
                            height: 40 * (preset.height / preset.width),
                            maxHeight: 50,
                          }}
                        >
                          {preset.height > preset.width ? (
                            <Smartphone className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Monitor className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{preset.format}</p>
                          <p className="font-mono text-xs text-gray-500">
                            {preset.width} × {preset.height}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </TabsContent>
          ))}

          <TabsContent value="custom" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-mono font-bold uppercase text-xs mb-2 block">
                    Width (px)
                  </Label>
                  <Input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)}
                    className="border-2 border-black font-mono"
                    min={1}
                    max={4096}
                  />
                </div>
                <div>
                  <Label className="font-mono font-bold uppercase text-xs mb-2 block">
                    Height (px)
                  </Label>
                  <Input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)}
                    className="border-2 border-black font-mono"
                    min={1}
                    max={4096}
                  />
                </div>
              </div>

              {/* Quick aspect ratios */}
              <div>
                <Label className="font-mono font-bold uppercase text-xs mb-2 block">
                  Quick Ratios
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "1:1", w: 1080, h: 1080 },
                    { label: "4:5", w: 1080, h: 1350 },
                    { label: "16:9", w: 1920, h: 1080 },
                    { label: "9:16", w: 1080, h: 1920 },
                  ].map((ratio) => (
                    <Button
                      key={ratio.label}
                      variant="outline"
                      size="sm"
                      className="border-2 border-black font-mono"
                      onClick={() => {
                        setCustomWidth(ratio.w);
                        setCustomHeight(ratio.h);
                      }}
                    >
                      {ratio.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCustomSelect}
                className="w-full neo-btn"
                disabled={customWidth <= 0 || customHeight <= 0}
              >
                Create {customWidth} × {customHeight} Canvas
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

