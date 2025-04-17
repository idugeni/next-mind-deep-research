import React from "react";
import ReportSectionCard from "./report-section-card";
import ReferencesList from "./references-list";

interface ReportTabContentProps {
  tabList: { value: string; label: string }[];
  report: Record<string, string | string[] | undefined | null>;
  t: Record<string, string>;
  activeTab: string;
}

export default function ReportTabContent({ tabList, report, t, activeTab }: ReportTabContentProps) {
  // Helper to convert plain text (with double space/tab) to markdown table
  function textToMarkdownTable(text: string) {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) return text; // Not enough lines for table
    // Assume columns separated by 2+ spaces or tab
    const splitLine = (line: string) => line.split(/\s{2,}|\t/).map(s => s.trim());
    const header = splitLine(lines[0]);
    // Pastikan semua baris punya jumlah kolom sama dengan header
    const rowsArr = lines.slice(1).map(splitLine);
    if (!rowsArr.every(cols => cols.length === header.length)) return text; // Bukan tabel valid
    const separator = `|${header.map(() => '---').join('|')}|`;
    const rows = rowsArr.map(cols => `| ${cols.join(' | ')} |`);
    return `| ${header.join(' | ')} |\n${separator}\n${rows.join('\n')}`;
  }

  // Helper to normalize string or string[] to string, trim, and remove extra blank lines
  function normalizeContent(content: string | string[] | undefined | null): string {
    let str = Array.isArray(content) ? content.join("\n\n") : (content ?? "");
    // Jangan konversi jika sudah markdown table (ada | di baris pertama)
    if (!/^\s*\|.*\|.*\|/m.test(str) && /^.+(\s{2,}|\t).+$/m.test(str)) {
      str = textToMarkdownTable(str);
    }
    // Trim leading/trailing whitespace dan hapus baris kosong berlebih
    return str.replace(/^[\s\n]+|[\s\n]+$/g, '').replace(/\n{3,}/g, '\n\n');
  }

  // Helper untuk render konten tiap tab
  const renderContent = (tabValue: string) => {
    switch (tabValue) {
      case "full":
        return (
          <div className="mt-6 space-y-6 animate-fade-in">
            <ReportSectionCard title={t.executiveSummary}>
              {normalizeContent(report.summary)}
            </ReportSectionCard>
            <ReportSectionCard title={t.introduction}>{normalizeContent(report.introduction)}</ReportSectionCard>
            {report.methodology && <ReportSectionCard title={t.methodology}>{normalizeContent(report.methodology)}</ReportSectionCard>}
            {report.findings && <ReportSectionCard title={t.findings}>{normalizeContent(report.findings)}</ReportSectionCard>}
            <ReportSectionCard title={t.analysis}>{normalizeContent(report.analysis)}</ReportSectionCard>
            {report.discussion && <ReportSectionCard title={t.discussion}>{normalizeContent(report.discussion)}</ReportSectionCard>}
            <ReportSectionCard title={t.conclusion}>{normalizeContent(report.conclusion)}</ReportSectionCard>
            {report.recommendations && <ReportSectionCard title={t.recommendations}>{normalizeContent(report.recommendations)}</ReportSectionCard>}
            <ReferencesList references={Array.isArray(report.references) ? report.references : []} title={t.references} />
          </div>
        );
      case "summary":
        return (
          <ReportSectionCard title={t.executiveSummary}>
            {normalizeContent(report.summary)}
          </ReportSectionCard>
        );
      case "introduction":
        return <ReportSectionCard title={t.introduction}>{normalizeContent(report.introduction)}</ReportSectionCard>;
      case "methodology":
        return report.methodology ? <ReportSectionCard title={t.methodology}>{normalizeContent(report.methodology)}</ReportSectionCard> : null;
      case "findings":
        return report.findings ? <ReportSectionCard title={t.findings}>{normalizeContent(report.findings)}</ReportSectionCard> : null;
      case "analysis":
        return <ReportSectionCard title={t.analysis}>{normalizeContent(report.analysis)}</ReportSectionCard>;
      case "discussion":
        return report.discussion ? <ReportSectionCard title={t.discussion}>{normalizeContent(report.discussion)}</ReportSectionCard> : null;
      case "conclusion":
        return <ReportSectionCard title={t.conclusion}>{normalizeContent(report.conclusion)}</ReportSectionCard>;
      case "recommendations":
        return report.recommendations ? <ReportSectionCard title={t.recommendations}>{normalizeContent(report.recommendations)}</ReportSectionCard> : null;
      case "references":
        return <ReferencesList references={Array.isArray(report.references) ? report.references : []} title={t.references} />;
      default:
        return null;
    }
  };

  return (
    <>
      {tabList.map(tab => (
        tab.value === activeTab && (
          <div key={tab.value} className="mt-6 animate-fade-in">
            {renderContent(tab.value)}
          </div>
        )
      ))}
    </>
  );
}
