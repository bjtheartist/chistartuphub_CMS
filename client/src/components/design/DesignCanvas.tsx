import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import * as fabric from "fabric";

export interface DesignCanvasRef {
  canvas: fabric.Canvas | null;
  addText: (text: string, options?: Partial<fabric.ITextOptions>) => void;
  addRect: (options?: Partial<fabric.RectProps>) => void;
  addCircle: (options?: Partial<fabric.CircleProps>) => void;
  addImage: (url: string) => Promise<void>;
  deleteSelected: () => void;
  toJSON: () => string;
  loadJSON: (json: string) => Promise<void>;
  toDataURL: (options?: { format?: string; quality?: number; multiplier?: number }) => string;
  clear: () => void;
  undo: () => void;
  redo: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  setBackgroundColor: (color: string) => void;
}

interface DesignCanvasProps {
  width: number;
  height: number;
  initialJson?: string;
  onSelect?: (obj: fabric.Object | null) => void;
  onModified?: () => void;
  backgroundColor?: string;
}

const DesignCanvas = forwardRef<DesignCanvasRef, DesignCanvasProps>(
  ({ width, height, initialJson, onSelect, onModified, backgroundColor = "#ffffff" }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const historyRef = useRef<string[]>([]);
    const historyIndexRef = useRef<number>(-1);
    const isUndoRedoRef = useRef<boolean>(false);

    const saveHistory = useCallback(() => {
      if (isUndoRedoRef.current || !fabricRef.current) return;
      
      const json = JSON.stringify(fabricRef.current.toJSON());
      
      // Remove any future history if we're not at the end
      if (historyIndexRef.current < historyRef.current.length - 1) {
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      }
      
      historyRef.current.push(json);
      historyIndexRef.current = historyRef.current.length - 1;
      
      // Limit history to 50 states
      if (historyRef.current.length > 50) {
        historyRef.current.shift();
        historyIndexRef.current--;
      }
    }, []);

    useEffect(() => {
      if (!canvasRef.current) return;

      const canvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor,
        selection: true,
        preserveObjectStacking: true,
      });

      fabricRef.current = canvas;

      // Event listeners
      canvas.on("selection:created", (e) => {
        onSelect?.(e.selected?.[0] || null);
      });

      canvas.on("selection:updated", (e) => {
        onSelect?.(e.selected?.[0] || null);
      });

      canvas.on("selection:cleared", () => {
        onSelect?.(null);
      });

      canvas.on("object:modified", () => {
        saveHistory();
        onModified?.();
      });

      canvas.on("object:added", () => {
        saveHistory();
        onModified?.();
      });

      canvas.on("object:removed", () => {
        saveHistory();
        onModified?.();
      });

      // Load initial JSON if provided
      if (initialJson) {
        try {
          const parsed = JSON.parse(initialJson);
          canvas.loadFromJSON(parsed).then(() => {
            canvas.renderAll();
            saveHistory();
          });
        } catch (e) {
          console.error("Failed to load initial JSON:", e);
        }
      } else {
        saveHistory();
      }

      return () => {
        canvas.dispose();
        fabricRef.current = null;
      };
    }, []);

    // Update canvas size when dimensions change
    useEffect(() => {
      if (fabricRef.current) {
        fabricRef.current.setDimensions({ width, height });
        fabricRef.current.renderAll();
      }
    }, [width, height]);

    // Update background color
    useEffect(() => {
      if (fabricRef.current) {
        fabricRef.current.backgroundColor = backgroundColor;
        fabricRef.current.renderAll();
      }
    }, [backgroundColor]);

    useImperativeHandle(ref, () => ({
      canvas: fabricRef.current,

      addText: (text: string, options?: Partial<fabric.ITextOptions>) => {
        if (!fabricRef.current) return;
        
        const textObj = new fabric.IText(text, {
          left: width / 2,
          top: height / 2,
          fontSize: 32,
          fontFamily: "Inter, sans-serif",
          fill: "#000000",
          originX: "center",
          originY: "center",
          ...options,
        });
        
        fabricRef.current.add(textObj);
        fabricRef.current.setActiveObject(textObj);
        fabricRef.current.renderAll();
      },

      addRect: (options?: Partial<fabric.RectProps>) => {
        if (!fabricRef.current) return;
        
        const rect = new fabric.Rect({
          left: width / 2,
          top: height / 2,
          width: 150,
          height: 100,
          fill: "#3B82F6",
          originX: "center",
          originY: "center",
          ...options,
        });
        
        fabricRef.current.add(rect);
        fabricRef.current.setActiveObject(rect);
        fabricRef.current.renderAll();
      },

      addCircle: (options?: Partial<fabric.CircleProps>) => {
        if (!fabricRef.current) return;
        
        const circle = new fabric.Circle({
          left: width / 2,
          top: height / 2,
          radius: 60,
          fill: "#FCD34D",
          originX: "center",
          originY: "center",
          ...options,
        });
        
        fabricRef.current.add(circle);
        fabricRef.current.setActiveObject(circle);
        fabricRef.current.renderAll();
      },

      addImage: async (url: string) => {
        if (!fabricRef.current) return;
        
        try {
          const img = await fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" });
          
          // Scale image to fit canvas if too large
          const maxWidth = width * 0.8;
          const maxHeight = height * 0.8;
          
          if (img.width && img.height) {
            const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
            img.scale(scale);
          }
          
          img.set({
            left: width / 2,
            top: height / 2,
            originX: "center",
            originY: "center",
          });
          
          fabricRef.current.add(img);
          fabricRef.current.setActiveObject(img);
          fabricRef.current.renderAll();
        } catch (e) {
          console.error("Failed to add image:", e);
        }
      },

      deleteSelected: () => {
        if (!fabricRef.current) return;
        
        const activeObjects = fabricRef.current.getActiveObjects();
        if (activeObjects.length > 0) {
          activeObjects.forEach((obj) => {
            fabricRef.current?.remove(obj);
          });
          fabricRef.current.discardActiveObject();
          fabricRef.current.renderAll();
        }
      },

      toJSON: () => {
        if (!fabricRef.current) return "{}";
        return JSON.stringify(fabricRef.current.toJSON());
      },

      loadJSON: async (json: string) => {
        if (!fabricRef.current) return;
        
        try {
          const parsed = JSON.parse(json);
          await fabricRef.current.loadFromJSON(parsed);
          fabricRef.current.renderAll();
          saveHistory();
        } catch (e) {
          console.error("Failed to load JSON:", e);
        }
      },

      toDataURL: (options?: { format?: string; quality?: number; multiplier?: number }) => {
        if (!fabricRef.current) return "";
        
        return fabricRef.current.toDataURL({
          format: options?.format || "png",
          quality: options?.quality || 1,
          multiplier: options?.multiplier || 1,
        });
      },

      clear: () => {
        if (!fabricRef.current) return;
        
        fabricRef.current.clear();
        fabricRef.current.backgroundColor = backgroundColor;
        fabricRef.current.renderAll();
      },

      undo: () => {
        if (!fabricRef.current || historyIndexRef.current <= 0) return;
        
        isUndoRedoRef.current = true;
        historyIndexRef.current--;
        const json = historyRef.current[historyIndexRef.current];
        
        fabricRef.current.loadFromJSON(JSON.parse(json)).then(() => {
          fabricRef.current?.renderAll();
          isUndoRedoRef.current = false;
        });
      },

      redo: () => {
        if (!fabricRef.current || historyIndexRef.current >= historyRef.current.length - 1) return;
        
        isUndoRedoRef.current = true;
        historyIndexRef.current++;
        const json = historyRef.current[historyIndexRef.current];
        
        fabricRef.current.loadFromJSON(JSON.parse(json)).then(() => {
          fabricRef.current?.renderAll();
          isUndoRedoRef.current = false;
        });
      },

      bringForward: () => {
        if (!fabricRef.current) return;
        
        const activeObject = fabricRef.current.getActiveObject();
        if (activeObject) {
          fabricRef.current.bringObjectForward(activeObject);
          fabricRef.current.renderAll();
        }
      },

      sendBackward: () => {
        if (!fabricRef.current) return;
        
        const activeObject = fabricRef.current.getActiveObject();
        if (activeObject) {
          fabricRef.current.sendObjectBackwards(activeObject);
          fabricRef.current.renderAll();
        }
      },

      setBackgroundColor: (color: string) => {
        if (!fabricRef.current) return;
        
        fabricRef.current.backgroundColor = color;
        fabricRef.current.renderAll();
        saveHistory();
      },
    }));

    return (
      <div className="relative border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
        <canvas ref={canvasRef} />
      </div>
    );
  }
);

DesignCanvas.displayName = "DesignCanvas";

export default DesignCanvas;

