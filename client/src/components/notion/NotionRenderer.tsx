import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { ChevronRight, FileText, Image as ImageIcon, LinkIcon } from "lucide-react";
import { useState } from "react";
// import { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"; 
// Using any for block types temporarily to avoid deep type issues if @notionhq/client types aren't perfectly aligned with frontend build
// But ideally we import them. Let's try to use minimal typing for speed and robustness.

interface NotionBlockProps {
  block: any; // BlockObjectResponse;
  level?: number;
}

const RichText = ({ text, className }: { text: any[]; className?: string }) => {
  if (!text || text.length === 0) return null;
  return (
    <span className={className}>
      {text.map((t: any, i: number) => {
        const { annotations } = t;
        const style: React.CSSProperties = {
          fontWeight: annotations.bold ? "bold" : "normal",
          fontStyle: annotations.italic ? "italic" : "normal",
          textDecoration: [
            annotations.underline ? "underline" : "",
            annotations.strikethrough ? "line-through" : "",
          ]
            .filter(Boolean)
            .join(" "),
          color: annotations.color !== "default" ? annotations.color : "inherit",
        };

        if (t.type === "text") {
          return (
            <span key={i} style={style}>
              {t.href ? (
                <a
                  href={t.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neon-blue hover:underline"
                >
                  {t.text.content}
                </a>
              ) : (
                t.text.content
              )}
            </span>
          );
        }
        return null;
      })}
    </span>
  );
};

export const NotionRenderer = ({ blockId, level = 0 }: { blockId: string; level?: number }) => {
  const { data: blocks, isLoading, error } = trpc.notion.getBlocks.useQuery(
    { blockId },
    { 
      staleTime: 1000 * 60 * 5, // Cache for 5 mins
      retry: 1
    }
  );

  if (isLoading && level === 0) return <div className="text-gray-500 animate-pulse">Carregando conteúdo...</div>;
  if (error) return <div className="text-red-500">Erro ao carregar conteúdo.</div>;
  if (!blocks || !blocks.results) return null;

  return (
    <div className={cn("space-y-4", level > 0 && "pl-4 border-l border-white/5")}>
      {blocks.results.map((block: any) => (
        <Block key={block.id} block={block} level={level} />
      ))}
    </div>
  );
};

const Block = ({ block, level = 0 }: NotionBlockProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Helper for rendering children if any
  const renderChildren = () => {
    if (block.has_children) {
      if (block.type === "toggle" && !isOpen) return null;
       // For list items, we might want to render children immediately or based on generic has_children logic
       // But efficient fetching suggests recursive component only if needed.
       // Let's render children recursively for supported types
      return <NotionRenderer blockId={block.id} level={level + 1} />;
    }
    return null;
  };

  switch (block.type) {
    case "paragraph":
      return (
        <div className="text-gray-300 leading-relaxed text-sm md:text-base mb-2">
          <RichText text={block.paragraph.rich_text} />
          {renderChildren()}
        </div>
      );
    case "heading_1":
      return (
        <h1 className="text-2xl md:text-3xl font-bold text-white mt-6 mb-4 pb-2 border-b border-white/10">
          <RichText text={block.heading_1.rich_text} />
        </h1>
      );
    case "heading_2":
      return (
        <h2 className="text-xl md:text-2xl font-bold text-neon-gold mt-6 mb-3">
          <RichText text={block.heading_2.rich_text} />
        </h2>
      );
    case "heading_3":
      return (
        <h3 className="text-lg md:text-xl font-semibold text-white mt-4 mb-2">
           <RichText text={block.heading_3.rich_text} />
        </h3>
      );
    case "bulleted_list_item":
      return (
        <div className="flex items-start gap-2 mb-1">
          <span className="text-neon-blue mt-1.5">•</span>
          <div className="flex-1">
             <RichText text={block.bulleted_list_item.rich_text} />
             {renderChildren()}
          </div>
        </div>
      );
    case "numbered_list_item":
      return (
        <div className="flex items-start gap-2 mb-1">
           <span className="text-gray-500 font-mono text-sm mt-0.5">1.</span>
           <div className="flex-1">
              <RichText text={block.numbered_list_item.rich_text} />
              {renderChildren()}
           </div>
        </div>
      );
    case "to_do":
      return (
        <div className="flex items-start gap-3 mb-2 p-2 rounded hover:bg-white/5 transition-colors">
          <div className={cn(
            "w-5 h-5 rounded border flex items-center justify-center mt-0.5",
            block.to_do.checked ? "bg-green-500 border-green-500" : "border-gray-500"
          )}>
            {block.to_do.checked && <span className="text-black text-xs font-bold">✓</span>}
          </div>
          <div className={cn("flex-1", block.to_do.checked && "text-gray-500 line-through")}>
            <RichText text={block.to_do.rich_text} />
            {renderChildren()}
          </div>
        </div>
      );
    case "toggle":
      return (
        <div className="mb-2">
          <button 
             onClick={() => setIsOpen(!isOpen)}
             className="flex items-center gap-2 text-white hover:text-neon-blue transition-colors font-medium text-left w-full p-1 rounded hover:bg-white/5"
          >
             <ChevronRight className={cn("w-4 h-4 transition-transform", isOpen && "rotate-90")} />
             <RichText text={block.toggle.rich_text} />
          </button>
          {isOpen && (
            <div className="pl-6 mt-2 border-l-2 border-white/5 ml-2">
              <NotionRenderer blockId={block.id} level={level + 1} />
            </div>
          )}
        </div>
      );
    case "image":
       const imageUrl = block.image.type === "external" ? block.image.external.url : block.image.file.url;
       return (
         <div className="my-4 rounded-lg overflow-hidden border border-white/10 bg-black/20">
            <img src={imageUrl} alt="Notion Content" className="w-full max-h-[500px] object-contain" loading="lazy" />
            {block.image.caption?.length > 0 && (
               <div className="p-2 text-xs text-center text-gray-500 italic">
                 <RichText text={block.image.caption} />
               </div>
            )}
         </div>
       );
    case "callout":
       const icon = block.callout.icon?.emoji || "💡";
       return (
         <div className="my-4 p-4 rounded-lg bg-white/5 border border-l-4 border-l-neon-gold border-white/5 flex gap-4">
            <div className="text-2xl select-none">{icon}</div>
            <div className="flex-1 text-gray-200">
               <RichText text={block.callout.rich_text} />
               {renderChildren()}
            </div>
         </div>
       );
     case "divider":
       return <hr className="my-6 border-white/10" />;
    case "quote":
       return (
         <div className="my-4 pl-4 border-l-4 border-purple-500 italic text-gray-300">
           <RichText text={block.quote.rich_text} />
         </div>
       );
    default:
      console.log("Unsupported block type:", block.type);
      return null;
  }
};
