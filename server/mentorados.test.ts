import { beforeEach, describe, expect, it, vi } from "vitest";

// Vitest hoists vi.mock() calls to the top of the file.
// Factory functions must be self-contained (no external variables).

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(() => null),
}));

// Mock the emailService module with fully self-contained factory
vi.mock("./emailService", () => ({
  sendEmail: vi.fn(async () => true),
  sendWelcomeEmail: vi.fn(async () => true),
}));

describe("Mentorados Router", () => {
  beforeEach(() => {
    // Clear mocks if needed in the future
  });

  describe("CRUD Operations", () => {
    it("should have createNew procedure defined", async () => {
      // Import the router to verify it compiles and exports correctly
      const { mentoradosRouter } = await import("./mentoradosRouter");
      expect(mentoradosRouter).toBeDefined();
      expect(mentoradosRouter._def.procedures).toHaveProperty("createNew");
    });

    it("should have update procedure defined", async () => {
      const { mentoradosRouter } = await import("./mentoradosRouter");
      expect(mentoradosRouter._def.procedures).toHaveProperty("update");
    });

    it("should have delete procedure defined", async () => {
      const { mentoradosRouter } = await import("./mentoradosRouter");
      expect(mentoradosRouter._def.procedures).toHaveProperty("delete");
    });

    it("should have comparativeStats procedure defined", async () => {
      const { mentoradosRouter } = await import("./mentoradosRouter");
      expect(mentoradosRouter._def.procedures).toHaveProperty("comparativeStats");
    });

    it("should have linkEmail procedure defined", async () => {
      const { mentoradosRouter } = await import("./mentoradosRouter");
      expect(mentoradosRouter._def.procedures).toHaveProperty("linkEmail");
    });

    it("should have list procedure defined", async () => {
      const { mentoradosRouter } = await import("./mentoradosRouter");
      expect(mentoradosRouter._def.procedures).toHaveProperty("list");
    });

    it("should have me procedure defined", async () => {
      const { mentoradosRouter } = await import("./mentoradosRouter");
      expect(mentoradosRouter._def.procedures).toHaveProperty("me");
    });

    it("should have metricas procedure defined", async () => {
      const { mentoradosRouter } = await import("./mentoradosRouter");
      expect(mentoradosRouter._def.procedures).toHaveProperty("metricas");
    });

    it("should have submitMetricas procedure defined", async () => {
      const { mentoradosRouter } = await import("./mentoradosRouter");
      expect(mentoradosRouter._def.procedures).toHaveProperty("submitMetricas");
    });

    it("should have feedback procedure defined", async () => {
      const { mentoradosRouter } = await import("./mentoradosRouter");
      expect(mentoradosRouter._def.procedures).toHaveProperty("feedback");
    });

    it("should have submitFeedback procedure defined", async () => {
      const { mentoradosRouter } = await import("./mentoradosRouter");
      expect(mentoradosRouter._def.procedures).toHaveProperty("submitFeedback");
    });
  });

  describe("Email Service", () => {
    it("should have sendWelcomeEmail function defined", async () => {
      // Import the mocked module to verify the mock works
      const emailService = await import("./emailService");
      expect(emailService.sendWelcomeEmail).toBeDefined();
      expect(typeof emailService.sendWelcomeEmail).toBe("function");
    });
  });
});
