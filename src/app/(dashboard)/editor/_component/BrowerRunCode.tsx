"use client";
import React, { useRef, useState } from "react";
import { useEditorContext } from "../_provider/EditorProvider";
import * as motion from "motion/react-client";
import { Resizable } from "re-resizable";
import { ExternalLink, RotateCw, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useParams, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSession } from "next-auth/react";

const BrowerRunCode = ({ children }: { children: React.ReactNode }) => {
  const { openBrowser, setOpenBrowser } = useEditorContext();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<boolean>(false);
  const searchParams = useSearchParams();

  // Ensure 'fileName' is correctly obtained, fallback to "index.html"
  const fileName = searchParams.get("file") || "index.html"; // Default to "index.html" if not provided
  const [input, setInput] = useState<string>(`/${fileName}`); // Ensure the input always includes the slash

  const { projectId } = useParams(); // Get project ID from URL
  const [refresh, setRefresh] = useState<boolean>(true);
  const session = useSession();

  // Debug: log projectId and input to ensure correct values
  console.log("projectId:", projectId);
  console.log("fileName:", fileName);
  console.log("input:", input);

  const handleMouseDown = () => {
    setDrag(true);
  };

  const handleMouseUp = () => {
    setDrag(false);
  };

  const handleRefresh = () => {
    setRefresh((prev) => !prev); // Toggle refresh state
    setTimeout(() => {
      setRefresh((prev) => !prev); // Reset refresh state to trigger re-render
    }, 1000);
  };

  // Debugging the iframeSrc construction
  const iframeSrc =
    projectId && input
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/file/${projectId}${input}`
      : null;

  // Ensure iframeSrc is correctly logged before use
  console.log("iframeSrc:", iframeSrc);

  return (
    <div ref={containerRef}>
      {children}

      {openBrowser && (
        <motion.div
          drag={drag}
          dragConstraints={containerRef}
          dragElastic={0.2}
          className="absolute right-2 top-0 z-50"
        >
          <Resizable className="min-h-56 min-w-80 pb-2 shadow-lg overflow-clip rounded-sm z-50 bg-white">
            <div
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              className="bg-primary h-7 flex items-center cursor-grab px-1"
            >
              <X
                className="ml-auto cursor-pointer"
                onClick={() => setOpenBrowser(false)}
              />
            </div>
            <div className="relative">
              <Input
                className="h-8 rounded-t-none text-slate-600 pl-9 pr-9"
                placeholder="Enter file name"
                onChange={(e) => setInput(e.target.value)}
                value={input}
              />
              <RotateCw
                size={16}
                className={cn(
                  "absolute top-2 left-2 hover:text-primary cursor-pointer",
                  !refresh && "animate-spin"
                )}
                onClick={handleRefresh}
              />
              <Link
                href={`/browser/${session?.data?.user?.name}/${projectId}/${input}`}
                target="_blank"
              >
                <ExternalLink
                  size={16}
                  className={cn(
                    "absolute top-2 right-2 hover:text-primary cursor-pointer"
                  )}
                />
              </Link>
            </div>
            <div className="h-full w-full">
              {/* Only render iframe if iframeSrc is available */}
              {refresh && iframeSrc && (
                <iframe
                  className="w-full h-full min-h-full min-w-full"
                  src={iframeSrc}
                />
              )}
            </div>
          </Resizable>
        </motion.div>
      )}
    </div>
  );
};

export default BrowerRunCode;
