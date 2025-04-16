import React from "react";
import ReportSectionCard from "./report-section-card";
import ReferencesList from "./references-list";
import MarkdownRenderer from "./markdown-renderer";

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

  // Helper to convert array of object to markdown table
  // function arrayToMarkdownTable(arr: { [key: string]: string }[], headers?: string[]) {
  //   if (!arr.length) return '';
  //   const keys = headers || Object.keys(arr[0]);
  //   const headerRow = `| ${keys.join(' | ')} |`;
  //   const separator = `|${keys.map(() => '---').join('|')}|`;
  //   const rows = arr.map(obj => `| ${keys.map(k => obj[k] || '').join(' | ')} |`);
  //   return [headerRow, separator, ...rows].join('\n');
  // }

  // Helper untuk render konten tiap tab
  const renderContent = (tabValue: string) => {
    switch (tabValue) {
      case "full":
        return (
          <div className="mt-6 space-y-6 animate-fade-in">
            <ReportSectionCard title={t.executiveSummary}>
              <MarkdownRenderer>{normalizeContent(report.summary)}</MarkdownRenderer>
            </ReportSectionCard>
            <ReportSectionCard title={t.introduction}><MarkdownRenderer>{normalizeContent(report.introduction)}</MarkdownRenderer></ReportSectionCard>
            {report.methodology && <ReportSectionCard title={t.methodology}><MarkdownRenderer>{normalizeContent(report.methodology)}</MarkdownRenderer></ReportSectionCard>}
            {report.findings && <ReportSectionCard title={t.findings}><MarkdownRenderer>{normalizeContent(report.findings)}</MarkdownRenderer></ReportSectionCard>}
            <ReportSectionCard title={t.analysis}><MarkdownRenderer>{normalizeContent(report.analysis)}</MarkdownRenderer></ReportSectionCard>
            {report.discussion && <ReportSectionCard title={t.discussion}><MarkdownRenderer>{normalizeContent(report.discussion)}</MarkdownRenderer></ReportSectionCard>}
            <ReportSectionCard title={t.conclusion}><MarkdownRenderer>{normalizeContent(report.conclusion)}</MarkdownRenderer></ReportSectionCard>
            {report.recommendations && <ReportSectionCard title={t.recommendations}><MarkdownRenderer>{normalizeContent(report.recommendations)}</MarkdownRenderer></ReportSectionCard>}
            <ReferencesList references={Array.isArray(report.references) ? report.references : []} title={t.references} />
          </div>
        );
      case "summary":
        return (
          <ReportSectionCard title={t.executiveSummary}>
            <MarkdownRenderer>{normalizeContent(report.summary)}</MarkdownRenderer>
          </ReportSectionCard>
        );
      case "introduction":
        return <ReportSectionCard title={t.introduction}><MarkdownRenderer>{normalizeContent(report.introduction)}</MarkdownRenderer></ReportSectionCard>;
      case "methodology":
        return report.methodology ? <ReportSectionCard title={t.methodology}><MarkdownRenderer>{normalizeContent(report.methodology)}</MarkdownRenderer></ReportSectionCard> : null;
      case "findings":
        return report.findings ? <ReportSectionCard title={t.findings}><MarkdownRenderer>{normalizeContent(report.findings)}</MarkdownRenderer></ReportSectionCard> : null;
      case "analysis":
        return <ReportSectionCard title={t.analysis}><MarkdownRenderer>{normalizeContent(report.analysis)}</MarkdownRenderer></ReportSectionCard>;
      case "discussion":
        return report.discussion ? <ReportSectionCard title={t.discussion}><MarkdownRenderer>{normalizeContent(report.discussion)}</MarkdownRenderer></ReportSectionCard> : null;
      case "conclusion":
        return <ReportSectionCard title={t.conclusion}><MarkdownRenderer>{normalizeContent(report.conclusion)}</MarkdownRenderer></ReportSectionCard>;
      case "recommendations":
        return report.recommendations ? <ReportSectionCard title={t.recommendations}><MarkdownRenderer>{normalizeContent(report.recommendations)}</MarkdownRenderer></ReportSectionCard> : null;
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
