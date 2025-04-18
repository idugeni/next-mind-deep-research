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
  // Helper to convert plain text (with double space/tab) or markdown to HTML
  function textToHtml(text: string) {
    // Try to detect if content is markdown table or markdown, convert to HTML
    // For simplicity, use a basic converter for bold, italic, headers, lists, and tables
    let html = text;
    // Convert **bold**
    html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    // Convert *italic*
    html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
    // Convert headers
    html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
    // Convert unordered lists
    html = html.replace(/^(\s*)[-*] (.*)$/gm, '$1<li>$2</li>');
    // Group consecutive <li> into <ul>
    html = html.replace(/(<li>.*?<\/li>\s*)+/gs, match => `<ul>${match.replace(/\s*$/,'')}</ul>`);
    // Convert ordered lists
    html = html.replace(/^(\s*)[0-9]+\. (.*)$/gm, '$1<li>$2</li>');
    // Group consecutive <li> into <ol> for ordered
    html = html.replace(/(<li>.*?<\/li>\s*)+/gs, match => `<ol>${match.replace(/\s*$/,'')}</ol>`);
    // Convert tables (simple)
    if (/^\|(.+)\|$/m.test(html)) {
      const lines = html.split('\n');
      let inTable = false;
      let tableHtml = '';
      for (const line of lines) {
        if (/^\|(.+)\|$/.test(line)) {
          if (!inTable) { tableHtml += '<table><tbody>'; inTable = true; }
          const cells = line.split('|').slice(1, -1).map(cell => `<td>${cell.trim()}</td>`).join('');
          tableHtml += `<tr>${cells}</tr>`;
        } else {
          if (inTable) { tableHtml += '</tbody></table>'; inTable = false; }
          tableHtml += line ? `<div>${line}</div>` : '';
        }
      }
      if (inTable) tableHtml += '</tbody></table>';
      html = tableHtml;
    }
    // Replace double newlines with paragraph
    html = html.replace(/\n{2,}/g, '</p><p>');
    html = `<p>${html}</p>`;
    // Remove empty <p></p>
    html = html.replace(/<p>\s*<\/p>/g, '');
    // Remove <br> inside <ul>, <ol>, <li>, <table>, <tr>, <td>
    html = html.replace(/<(ul|ol|li|table|tr|td)>((.|\n)*?)<\/\1>/g, (m) => m.replace(/<br\s*\/?\s*>/g, ''));
    return html;
  }

  // Helper to normalize string or string[] to string, trim, and remove extra blank lines, then convert to HTML
  function normalizeContent(content: string | string[] | undefined | null): string {
    let str = Array.isArray(content) ? content.join("\n\n") : (content ?? "");
    str = str.replace(/^[\s\n]+|[\s\n]+$/g, '').replace(/\n{3,}/g, '\n\n');
    return textToHtml(str);
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
            {report.literature_review && <ReportSectionCard title={t.literatureReview || "Literature Review"}>{normalizeContent(report.literature_review)}</ReportSectionCard>}
            {report.critical_appraisal && <ReportSectionCard title={t.criticalAppraisal || "Critical Appraisal"}>{normalizeContent(report.critical_appraisal)}</ReportSectionCard>}
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
      case "literature_review":
        return report.literature_review ? (
          <ReportSectionCard title={t.literatureReview || "Literature Review"}>{normalizeContent(report.literature_review)}</ReportSectionCard>
        ) : null;
      case "critical_appraisal":
        return report.critical_appraisal ? (
          <ReportSectionCard title={t.criticalAppraisal || "Critical Appraisal"}>{normalizeContent(report.critical_appraisal)}</ReportSectionCard>
        ) : null;
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
