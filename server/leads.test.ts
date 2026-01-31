import { describe, expect, it, vi } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(() => null),
}));

describe("Leads Router", () => {
  it("should have CRUD procedures defined", async () => {
    const { leadsRouter } = await import("./leadsRouter");
    expect(leadsRouter._def.procedures).toHaveProperty("list");
    expect(leadsRouter._def.procedures).toHaveProperty("getById");
    expect(leadsRouter._def.procedures).toHaveProperty("create");
    expect(leadsRouter._def.procedures).toHaveProperty("update");
    expect(leadsRouter._def.procedures).toHaveProperty("delete");
  });

  it("should have specialized procedures defined", async () => {
    const { leadsRouter } = await import("./leadsRouter");
    expect(leadsRouter._def.procedures).toHaveProperty("updateStatus");
    expect(leadsRouter._def.procedures).toHaveProperty("addInteraction");
    expect(leadsRouter._def.procedures).toHaveProperty("stats");
  });
});
