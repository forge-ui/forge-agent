import { renderInline } from "../chat-shared";

export function formatNumber(n: number) {
  if (Math.abs(n) >= 10_000) return n.toLocaleString("zh-CN");
  return String(n);
}

export function formatMoney(n: number) {
  if (Math.abs(n) >= 100_000_000) return `¥ ${(n / 100_000_000).toFixed(2)} 亿`;
  if (Math.abs(n) >= 10_000) return `¥ ${(n / 10_000).toFixed(1)} 万`;
  return `¥ ${n.toLocaleString("zh-CN")}`;
}

export function formatAxis(n: number) {
  if (Math.abs(n) >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}亿`;
  if (Math.abs(n) >= 10_000) return `${(n / 10_000).toFixed(0)}万`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

export function highlightSql(sql: string) {
  const escaped = sql.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const KW =
    "SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP\\s+BY|ORDER\\s+BY|LIMIT|AS|AND|OR|IN|NOT|NULL|WITH|HAVING|UNION|CASE|WHEN|THEN|ELSE|END|DESC|ASC|DISTINCT|INTERVAL";
  const FN = "COUNT|SUM|AVG|MIN|MAX|DATE|DATE_TRUNC|NOW|CURRENT_DATE|COALESCE";
  const re = new RegExp(
    `(--[^\\n]*)|('[^']*')|\\b(${FN})\\b(?=\\()|\\b(${KW})\\b|\\b(\\d+)\\b`,
    "gi",
  );
  return escaped.replace(re, (_m, com, str, fn, kw, num) => {
    if (com) return `<span class="text-fg-grey-500 italic">${com}</span>`;
    if (str) return `<span class="text-emerald-700">${str}</span>`;
    if (fn) return `<span class="text-cyan-700">${fn}</span>`;
    if (kw) return `<span class="text-violet-700 font-semibold">${kw}</span>`;
    if (num) return `<span class="text-amber-700">${num}</span>`;
    return _m;
  });
}

export function renderMarkdown(s: string) {
  const lines = s.split("\n");
  let html = "";
  let inList = false;
  for (const line of lines) {
    if (line.startsWith("- ")) {
      if (!inList) {
        html += '<ul class="ml-5 list-disc flex flex-col gap-1">';
        inList = true;
      }
      html += `<li>${renderInline(line.slice(2))}</li>`;
    } else if (line.trim() === "") {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += "<div class='h-2'></div>";
    } else {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<p>${renderInline(line)}</p>`;
    }
  }
  if (inList) html += "</ul>";
  return html;
}
