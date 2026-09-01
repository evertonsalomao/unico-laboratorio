import { describe, expect, it } from "vitest";
import { buildBreaksMarkdown, buildLaunchesMarkdown } from "../client/src/lib/reportMarkdown";

describe("report markdown exports", () => {
  it("includes mounts filters, totals and escaped table content", () => {
    const markdown = buildLaunchesMarkdown({ startDate: "2026-08-01", endDate: "2026-08-18", store: "Cianê", total: 1, stores: ["Cianê"], totals: { "Cianê": 1 }, rows: [{ store: "Cianê", osNumber: "10718", observation: "Conferir lente | urgente", createdAt: "2026-08-18T12:30:00" }] });
    expect(markdown).toContain("# Relatório de Montagens");
    expect(markdown).toContain("**Loja:** Cianê");
    expect(markdown).toContain("| Cianê | 1 |");
    expect(markdown).toContain("Conferir lente \\| urgente");
    expect(markdown).toContain("**TOTAL GERAL DE MONTAGENS:** 1 OS");
  });

  it("includes break filters, totals and normalized occurrence text", () => {
    const markdown = buildBreaksMarkdown({ startDate: "2026-08-01", endDate: "2026-08-18", unit: "Todas as unidades", total: 1, stores: ["Coop"], totals: { Coop: 1 }, rows: [{ unit: "Coop", osNumber: "22", report: "Armação danificada\nna entrega", createdAt: "2026-08-18T14:45:00" }] });
    expect(markdown).toContain("# Relatório de Quebras");
    expect(markdown).toContain("**Unidade:** Todas as unidades");
    expect(markdown).toContain("| Coop | 1 |");
    expect(markdown).toContain("Armação danificada na entrega");
  });
});
