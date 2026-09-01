export type ReportStore = string;

type LaunchRow = { store: ReportStore; osNumber: string; observation: string | null; createdAt: Date | string };
type BreakRow = { unit: ReportStore; osNumber: string; report: string; createdAt: Date | string };

const date = (value: Date | string) => new Date(value).toLocaleDateString("pt-BR");
const time = (value: Date | string) => new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const cell = (value: string) => value.replaceAll("|", "\\|").replaceAll("\n", " ");

export function buildLaunchesMarkdown(input: { startDate: string; endDate: string; store: string; rows: LaunchRow[]; totals: Record<string, number>; stores: readonly string[]; total: number }) {
  return [`# Relatório de Montagens`, ``, `**Período:** ${input.startDate} até ${input.endDate}`, `**Loja:** ${input.store}`, `**Total:** ${input.total} OS`, ``, `## Totais por loja`, ``, `| Loja | Total |`, `|---|---:|`, ...input.stores.map(name => `| ${cell(name)} | ${input.totals[name] ?? 0} |`), ``, `## Lançamentos`, ``, `| Data | Hora | Loja | Número da OS | Observação |`, `|---|---|---|---|---|`, ...input.rows.map(row => `| ${date(row.createdAt)} | ${time(row.createdAt)} | ${cell(row.store)} | ${cell(row.osNumber)} | ${cell(row.observation || "—")} |`), ``, `**TOTAL GERAL DE MONTAGENS:** ${input.total} OS`].join("\n");
}

export function buildBreaksMarkdown(input: { startDate: string; endDate: string; unit: string; rows: BreakRow[]; totals: Record<string, number>; stores: readonly string[]; total: number }) {
  return [`# Relatório de Quebras`, ``, `**Período:** ${input.startDate} até ${input.endDate}`, `**Unidade:** ${input.unit}`, `**Total:** ${input.total} registros`, ``, `## Totais por unidade`, ``, `| Unidade | Total |`, `|---|---:|`, ...input.stores.map(name => `| ${cell(name)} | ${input.totals[name] ?? 0} |`), ``, `## Quebras registradas`, ``, `| Data | Hora | Unidade | Número da OS | Relatar o ocorrido |`, `|---|---|---|---|---|`, ...input.rows.map(row => `| ${date(row.createdAt)} | ${time(row.createdAt)} | ${cell(row.unit)} | ${cell(row.osNumber)} | ${cell(row.report)} |`)].join("\n");
}
