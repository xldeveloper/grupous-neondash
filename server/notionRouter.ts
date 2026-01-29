import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { Client } from "@notionhq/client";
import { TRPCError } from "@trpc/server";

const getNotionClient = () => {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    console.warn("NOTION_API_KEY not found in environment variables");
    // We might throw here or handle it gracefully, but for now let's warn
  }
  return new Client({ auth: apiKey });
};

export const notionRouter = router({
  getPage: protectedProcedure
    .input(z.object({ pageId: z.string() }))
    .query(async ({ input }) => {
      const notion = getNotionClient();
      try {
        const page = await notion.pages.retrieve({ page_id: input.pageId });
        return page;
      } catch (error: any) {
        console.error("Notion getPage error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch Notion page",
        });
      }
    }),

  getBlocks: protectedProcedure
    .input(z.object({ blockId: z.string(), cursor: z.string().optional() }))
    .query(async ({ input }) => {
      const notion = getNotionClient();
      try {
        const response = await notion.blocks.children.list({
          block_id: input.blockId,
          start_cursor: input.cursor,
        });
        return response;
      } catch (error: any) {
        console.error("Notion getBlocks error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch Notion blocks",
        });
      }
    }),
});
