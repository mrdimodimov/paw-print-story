import { describe, it, expect } from "vitest";
import { validateEvent } from "./funnel-tracking";

describe("validateEvent (QA guard)", () => {
  it("rejects step_completed without step_name", () => {
    expect(validateEvent("step_completed", { step_number: 1 })).toBe(false);
  });

  it("rejects create_error without error_type", () => {
    expect(validateEvent("create_error", { step_name: "intro" })).toBe(false);
  });

  it("rejects tribute_published without dedupe_key", () => {
    expect(validateEvent("tribute_published", { has_photos: true })).toBe(false);
  });

  it("rejects when params are undefined", () => {
    expect(validateEvent("step_completed", undefined)).toBe(false);
  });

  it("accepts valid step_completed", () => {
    expect(
      validateEvent("step_completed", { step_name: "intro", step_number: 1 })
    ).toBe(true);
  });

  it("accepts valid tribute_published", () => {
    expect(
      validateEvent("tribute_published", { dedupe_key: "abc-123", has_photos: false })
    ).toBe(true);
  });

  it("accepts valid create_error", () => {
    expect(
      validateEvent("create_error", { step_name: "upload", error_type: "timeout" })
    ).toBe(true);
  });

  it("accepts unknown event types when params present", () => {
    expect(validateEvent("step_viewed", { step_name: "intro" })).toBe(true);
  });
});
