import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { json } from "@codemirror/lang-json";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { sql } from "@codemirror/lang-sql";

interface MarkdownRendererProps {
  content: string;
}

const languageMap: Record<string, any> = {
  javascript,
  js: javascript,
  typescript: javascript,
  ts: javascript,
  python,
  py: python,
  json,
  css,
  html,
  sql,
};

const CustomCodeBlock: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => {
  const language = className?.replace("language-", "") || "";
  const codeString = String(children).replace(/\n$/, "");
  const languageExtension = languageMap[language];

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-primary-100">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-primary-100">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {language || "code"}
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(codeString);
          }}
          className="text-xs text-gray-400 hover:text-primary-500 transition-colors"
        >
          Copy
        </button>
      </div>
      <div className="max-h-96 overflow-auto">
        {languageExtension ? (
          <CodeMirror
            value={codeString}
            readOnly
            extensions={[languageExtension()]}
            className="h-auto min-h-[100px] text-sm"
            theme="light"
          />
        ) : (
          <pre className="p-4 text-sm font-mono text-gray-700 bg-white">
            <code>{codeString}</code>
          </pre>
        )}
      </div>
    </div>
  );
};

const CustomHeading: React.FC<{ level: number; children: React.ReactNode }> = ({
  level,
  children,
}) => {
  const headingClasses = {
    1: "text-2xl font-bold text-gray-800 mt-6 mb-3 pb-2 border-b border-primary-100",
    2: "text-xl font-semibold text-gray-800 mt-5 mb-2",
    3: "text-lg font-semibold text-gray-800 mt-4 mb-2",
    4: "text-base font-semibold text-gray-700 mt-3 mb-1",
    5: "text-sm font-semibold text-gray-700 mt-2 mb-1",
    6: "text-sm font-semibold text-gray-600 mt-2 mb-1",
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return <Tag className={headingClasses[level as keyof typeof headingClasses]}>{children}</Tag>;
};

const CustomLink: React.FC<{ href?: string; children: React.ReactNode }> = ({
  href,
  children,
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary-500 hover:text-primary-600 underline underline-offset-2 transition-colors"
    >
      {children}
    </a>
  );
};

const CustomList: React.FC<{ ordered?: boolean; children: React.ReactNode }> = ({
  ordered,
  children,
}) => {
  const baseClass = "list-outside my-3 space-y-2";
  const typeClass = ordered ? "list-decimal" : "list-disc";

  return (
    <div className={`${baseClass} ${typeClass} pl-6`}>
      {ordered ? <ol>{children}</ol> : <ul>{children}</ul>}
    </div>
  );
};

const CustomListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <li className="text-sm leading-relaxed">{children}</li>;
};

const CustomBlockquote: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <blockquote className="border-l-4 border-primary-300 pl-4 py-2 my-4 bg-primary-50/50 rounded-r-xl">
      <p className="text-sm text-gray-600 italic">{children}</p>
    </blockquote>
  );
};

const CustomParagraph: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <p className="text-sm leading-relaxed my-2">{children}</p>;
};

const CustomStrong: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <strong className="font-semibold text-gray-800">{children}</strong>;
};

const CustomEmphasis: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <em className="italic text-gray-700">{children}</em>;
};

const CustomTable: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-primary-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-primary-50">
            {children}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

const CustomTableCell: React.FC<{
  align?: string;
  isHeader?: boolean;
  children: React.ReactNode;
}> = ({ align, isHeader, children }) => {
  const baseClass = "px-4 py-3 border-b border-primary-100";
  const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  const headerClass = isHeader ? "font-semibold text-gray-700 bg-primary-50" : "text-gray-600";

  const Tag = isHeader ? "th" : "td";

  return <Tag className={`${baseClass} ${alignClass} ${headerClass}`}>{children}</Tag>;
};

const CustomHorizontalRule: React.FC = () => {
  return <hr className="my-6 border-primary-100" />;
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            if (!inline) {
              return <CustomCodeBlock className={className} {...props}>{children}</CustomCodeBlock>;
            }
            return (
              <code className="px-1.5 py-0.5 rounded-lg bg-primary-100 text-primary-700 text-sm font-mono">
                {children}
              </code>
            );
          },
          h1({ children }) {
            return <CustomHeading level={1}>{children}</CustomHeading>;
          },
          h2({ children }) {
            return <CustomHeading level={2}>{children}</CustomHeading>;
          },
          h3({ children }) {
            return <CustomHeading level={3}>{children}</CustomHeading>;
          },
          h4({ children }) {
            return <CustomHeading level={4}>{children}</CustomHeading>;
          },
          h5({ children }) {
            return <CustomHeading level={5}>{children}</CustomHeading>;
          },
          h6({ children }) {
            return <CustomHeading level={6}>{children}</CustomHeading>;
          },
          a({ href, children }) {
            return <CustomLink href={href}>{children}</CustomLink>;
          },
          ol({ children }) {
            return <CustomList ordered>{children}</CustomList>;
          },
          ul({ children }) {
            return <CustomList>{children}</CustomList>;
          },
          li({ children }) {
            return <CustomListItem>{children}</CustomListItem>;
          },
          blockquote({ children }) {
            return <CustomBlockquote>{children}</CustomBlockquote>;
          },
          p({ children }) {
            return <CustomParagraph>{children}</CustomParagraph>;
          },
          strong({ children }) {
            return <CustomStrong>{children}</CustomStrong>;
          },
          em({ children }) {
            return <CustomEmphasis>{children}</CustomEmphasis>;
          },
          table({ children }) {
            return <CustomTable>{children}</CustomTable>;
          },
          th({ align, children }) {
            return <CustomTableCell align={align} isHeader>{children}</CustomTableCell>;
          },
          td({ align, children }) {
            return <CustomTableCell align={align}>{children}</CustomTableCell>;
          },
          hr() {
            return <CustomHorizontalRule />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
