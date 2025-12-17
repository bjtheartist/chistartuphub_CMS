import { useState, useEffect } from "react";
import * as fabric from "fabric";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { DesignCanvasRef } from "./DesignCanvas";

interface PropertiesPanelProps {
  selectedObject: fabric.Object | null;
  canvasRef: React.RefObject<DesignCanvasRef | null>;
  onUpdate: () => void;
}

const FONT_FAMILIES = [
  "Inter",
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Impact",
];

export default function PropertiesPanel({ selectedObject, canvasRef, onUpdate }: PropertiesPanelProps) {
  const [properties, setProperties] = useState({
    fill: "#000000",
    fontSize: 32,
    fontFamily: "Inter",
    fontWeight: "normal",
    fontStyle: "normal",
    textAlign: "left",
    underline: false,
    opacity: 1,
    angle: 0,
  });

  useEffect(() => {
    if (!selectedObject) return;

    const isText = selectedObject.type === "i-text" || selectedObject.type === "text";
    const textObj = selectedObject as fabric.IText;

    setProperties({
      fill: (selectedObject.fill as string) || "#000000",
      fontSize: isText ? textObj.fontSize || 32 : 32,
      fontFamily: isText ? (textObj.fontFamily || "Inter").replace(/, sans-serif$/, "") : "Inter",
      fontWeight: isText ? (textObj.fontWeight as string) || "normal" : "normal",
      fontStyle: isText ? (textObj.fontStyle as string) || "normal" : "normal",
      textAlign: isText ? textObj.textAlign || "left" : "left",
      underline: isText ? textObj.underline || false : false,
      opacity: selectedObject.opacity || 1,
      angle: selectedObject.angle || 0,
    });
  }, [selectedObject]);

  const updateProperty = (prop: string, value: unknown) => {
    if (!selectedObject || !canvasRef.current?.canvas) return;

    selectedObject.set(prop as keyof fabric.Object, value);
    canvasRef.current.canvas.renderAll();
    onUpdate();

    setProperties((prev) => ({ ...prev, [prop]: value }));
  };

  const handleDelete = () => {
    canvasRef.current?.deleteSelected();
  };

  const handleBringForward = () => {
    canvasRef.current?.bringForward();
  };

  const handleSendBackward = () => {
    canvasRef.current?.sendBackward();
  };

  if (!selectedObject) {
    return (
      <div className="p-4 text-center text-gray-500 font-mono text-sm">
        Select an element to edit its properties
      </div>
    );
  }

  const isText = selectedObject.type === "i-text" || selectedObject.type === "text";

  return (
    <div className="space-y-4 p-4">
      {/* Color */}
      <div>
        <Label className="font-mono font-bold uppercase text-xs mb-2 block">
          {isText ? "Text Color" : "Fill Color"}
        </Label>
        <div className="flex gap-2">
          <input
            type="color"
            value={properties.fill}
            onChange={(e) => updateProperty("fill", e.target.value)}
            className="w-10 h-10 border-2 border-black cursor-pointer"
          />
          <Input
            value={properties.fill}
            onChange={(e) => updateProperty("fill", e.target.value)}
            className="border-2 border-black font-mono text-sm flex-1"
          />
        </div>
      </div>

      {/* Text-specific properties */}
      {isText && (
        <>
          {/* Font Family */}
          <div>
            <Label className="font-mono font-bold uppercase text-xs mb-2 block">Font</Label>
            <Select
              value={properties.fontFamily}
              onValueChange={(value) => updateProperty("fontFamily", `${value}, sans-serif`)}
            >
              <SelectTrigger className="border-2 border-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div>
            <Label className="font-mono font-bold uppercase text-xs mb-2 block">
              Size: {properties.fontSize}px
            </Label>
            <Slider
              value={[properties.fontSize]}
              onValueChange={([value]) => updateProperty("fontSize", value)}
              min={8}
              max={200}
              step={1}
              className="w-full"
            />
          </div>

          {/* Text Style */}
          <div>
            <Label className="font-mono font-bold uppercase text-xs mb-2 block">Style</Label>
            <div className="flex gap-1">
              <Button
                variant={properties.fontWeight === "bold" ? "default" : "outline"}
                size="sm"
                className="border-2 border-black"
                onClick={() =>
                  updateProperty("fontWeight", properties.fontWeight === "bold" ? "normal" : "bold")
                }
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                variant={properties.fontStyle === "italic" ? "default" : "outline"}
                size="sm"
                className="border-2 border-black"
                onClick={() =>
                  updateProperty("fontStyle", properties.fontStyle === "italic" ? "normal" : "italic")
                }
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                variant={properties.underline ? "default" : "outline"}
                size="sm"
                className="border-2 border-black"
                onClick={() => updateProperty("underline", !properties.underline)}
              >
                <Underline className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Text Alignment */}
          <div>
            <Label className="font-mono font-bold uppercase text-xs mb-2 block">Alignment</Label>
            <div className="flex gap-1">
              <Button
                variant={properties.textAlign === "left" ? "default" : "outline"}
                size="sm"
                className="border-2 border-black"
                onClick={() => updateProperty("textAlign", "left")}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                variant={properties.textAlign === "center" ? "default" : "outline"}
                size="sm"
                className="border-2 border-black"
                onClick={() => updateProperty("textAlign", "center")}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                variant={properties.textAlign === "right" ? "default" : "outline"}
                size="sm"
                className="border-2 border-black"
                onClick={() => updateProperty("textAlign", "right")}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Opacity */}
      <div>
        <Label className="font-mono font-bold uppercase text-xs mb-2 block">
          Opacity: {Math.round(properties.opacity * 100)}%
        </Label>
        <Slider
          value={[properties.opacity]}
          onValueChange={([value]) => updateProperty("opacity", value)}
          min={0}
          max={1}
          step={0.01}
          className="w-full"
        />
      </div>

      {/* Rotation */}
      <div>
        <Label className="font-mono font-bold uppercase text-xs mb-2 block">
          Rotation: {Math.round(properties.angle)}°
        </Label>
        <Slider
          value={[properties.angle]}
          onValueChange={([value]) => updateProperty("angle", value)}
          min={0}
          max={360}
          step={1}
          className="w-full"
        />
      </div>

      {/* Layer Controls */}
      <div>
        <Label className="font-mono font-bold uppercase text-xs mb-2 block">Layer</Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-2 border-black"
            onClick={handleBringForward}
          >
            <ArrowUp className="w-4 h-4 mr-1" /> Forward
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-2 border-black"
            onClick={handleSendBackward}
          >
            <ArrowDown className="w-4 h-4 mr-1" /> Back
          </Button>
        </div>
      </div>

      {/* Delete */}
      <Button
        variant="destructive"
        className="w-full border-2 border-black mt-4"
        onClick={handleDelete}
      >
        <Trash2 className="w-4 h-4 mr-2" /> Delete Element
      </Button>
    </div>
  );
}

