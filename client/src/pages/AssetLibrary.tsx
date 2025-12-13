import Layout from "@/components/Layout";
import { Search, Filter, Download, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function AssetLibrary() {
  const [filter, setFilter] = useState("all");

  const assets = [
    { id: 1, name: "LinkedIn Header", type: "Image", category: "Branding", url: "/assets/linkedin_header.png", dimensions: "1584x396" },
    { id: 2, name: "Twitter Header", type: "Image", category: "Branding", url: "/assets/twitter_header.png", dimensions: "1500x500" },
    { id: 3, name: "Instagram Profile", type: "Image", category: "Branding", url: "/assets/instagram_profile.png", dimensions: "1080x1080" },
    { id: 4, name: "Founder Story Template", type: "Template", category: "Social", url: "/assets/founder_story_template.png", dimensions: "1080x1080" },
    { id: 5, name: "Event Promo Template", type: "Template", category: "Social", url: "/assets/event_promo_template.png", dimensions: "1080x1080" },
    { id: 6, name: "Quote Card Template", type: "Template", category: "Social", url: "/assets/quote_card_template.png", dimensions: "1080x1080" },
    { id: 7, name: "Funding Friday Template", type: "Template", category: "Social", url: "/assets/funding_friday_template.png", dimensions: "1080x1080" },
    { id: 8, name: "Instagram Story Template", type: "Template", category: "Social", url: "/assets/instagram_story_template.png", dimensions: "1080x1920" },
  ];

  const filteredAssets = filter === "all" ? assets : assets.filter(a => a.category.toLowerCase() === filter);

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
            <button className="neo-btn bg-white text-black hover:bg-gray-100">
              Upload New
            </button>
            <button className="neo-btn">
              Generate AI Asset
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {["all", "branding", "social", "campaigns"].map((f) => (
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
              className="w-full border-2 border-black px-4 py-2 font-mono text-sm focus:outline-none focus:shadow-[2px_2px_0px_0px_#3B82F6]"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Asset Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="neo-card group flex flex-col h-full">
              {/* Image Preview */}
              <div className="aspect-square bg-gray-100 border-b-2 border-black relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-mono text-xs">
                  {/* Placeholder for actual image - in real app would be <img src={asset.url} /> */}
                  <div className="text-center p-4">
                    <div className="mb-2 font-bold">{asset.name}</div>
                    <div>{asset.dimensions}</div>
                    <div className="text-[10px] mt-2 text-gray-500 break-all">{asset.url}</div>
                  </div>
                </div>
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button className="p-2 bg-white border-2 border-black hover:bg-brand-yellow transition-colors" title="Download">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-white border-2 border-black hover:bg-brand-blue hover:text-white transition-colors" title="Copy Link">
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-[10px] font-bold bg-gray-200 px-1 py-0.5 uppercase">
                      {asset.category}
                    </span>
                    <span className="font-mono text-[10px] text-gray-500">
                      {asset.type}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-1">{asset.name}</h3>
                </div>
                
                <div className="mt-4 pt-3 border-t-2 border-gray-100 flex justify-between items-center">
                  <span className="font-mono text-xs text-gray-500">{asset.dimensions}</span>
                  <button className="text-xs font-bold uppercase hover:underline flex items-center gap-1">
                    Edit <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
