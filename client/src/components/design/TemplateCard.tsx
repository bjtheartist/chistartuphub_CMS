import { MoreHorizontal, Edit, Trash2, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TemplateCardProps {
  template: {
    id: number;
    name: string;
    thumbnailUrl?: string | null;
    width: number;
    height: number;
    category?: string | null;
    userId?: number | null;
  };
  onSelect: (id: number) => void;
  onDuplicate?: (id: number) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

export default function TemplateCard({
  template,
  onSelect,
  onDuplicate,
  onDelete,
  showActions = true,
}: TemplateCardProps) {
  const isSystemTemplate = template.userId === null;

  return (
    <div className="neo-card group relative overflow-hidden">
      {/* Thumbnail */}
      <div
        className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 border-b-2 border-black relative overflow-hidden cursor-pointer"
        onClick={() => onSelect(template.id)}
      >
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="border-2 border-dashed border-gray-400 bg-white"
              style={{
                width: Math.min(80, 80 * (template.width / template.height)),
                height: Math.min(80, 80 * (template.height / template.width)),
              }}
            >
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-mono">
                {template.width}×{template.height}
              </div>
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button className="neo-btn text-sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit Template
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate">{template.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-[10px] text-gray-500">
                {template.width} × {template.height}
              </span>
              {template.category && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 uppercase">
                    {template.category}
                  </span>
                </>
              )}
            </div>
          </div>

          {showActions && !isSystemTemplate && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSelect(template.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {onDuplicate && (
                  <DropdownMenuItem onClick={() => onDuplicate(template.id)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete(template.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {isSystemTemplate && (
            <span className="font-mono text-[10px] bg-brand-blue text-white px-1.5 py-0.5 uppercase">
              System
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

