import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  Plus,
  Eye,
  Trash2,
  Save,
  Download,
  ChevronRight,
  X,
  Edit2,
  ImagePlus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DOMPurify from "dompurify";

const PAGE_W = 944;
const PAGE_H = 1398;

const headerTemplates = [
  {
    id: 1,
    bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    name: "दैनिक अखबार",
  },
];

const subHeaderTemplates = [
  { id: 1, bg: "#3b82f6", text: "Monday 28th January 2023", style: "modern" },
  {
    id: 2,
    bg: "#fbbf24",
    text: "Sunday 23rd July 2023 | संस्करणीय",
    style: "classic",
  },
  {
    id: 3,
    bg: "#ffffff",
    text: "Sunday 23rd July 2023",
    border: "#e5e7eb",
    style: "minimal",
  },
  { id: 4, bg: "#f3f4f6", text: "संस्करणीय | Channel Name", style: "bold" },
  { id: 5, bg: "#dc2626", text: "Thursday 28th January 2023", style: "red" },
  { id: 6, bg: "#16a34a", text: "संस्करणीय दैनिक", style: "green" },
];

const footerTemplates = [
  { id: 1, bg: "#3b82f6", dots: ["#ef4444", "#f59e0b", "#10b981", "#000"] },
  { id: 2, bg: "#fbbf24", dots: ["#ef4444", "#f59e0b", "#10b981", "#000"] },
  {
    id: 3,
    bg: "#ffffff",
    text: "Channel Name © 2023",
    dots: ["#3b82f6", "#f59e0b", "#ef4444"],
  },
  { id: 4, bg: "#f3f4f6", dots: ["#ef4444", "#f59e0b", "#10b981", "#6366f1"] },
  {
    id: 5,
    bg: "#1f2937",
    text: "www.mywebsite.com",
    dots: ["#3b82f6", "#10b981"],
  },
];

const layoutOptions = [
  { id: 1, cols: [12], name: "Full Width" },
  { id: 2, cols: [3, 9], name: "Sidebar + Main" },
  { id: 3, cols: [9, 3], name: "Main + Sidebar" },
  { id: 4, cols: [4, 8], name: "Small + Large" },
  { id: 5, cols: [8, 4], name: "Large + Small" },
  { id: 6, cols: [4, 4, 4], name: "Three Equal" },
  { id: 7, cols: [6, 6], name: "Two Equal" },
  { id: 8, cols: [2, 6, 4], name: "Mixed Layout" },
  { id: 9, cols: [3, 3, 3, 3], name: "Four Equal (Newspaper)" },
  { id: 10, cols: [3, 6, 3], name: "Mixed Layout" },
  { id: 11, cols: [2, 5, 5], name: "Mixed Layout" },
  { id: 12, cols: [2, 10], name: "Mixed Layout" },
  { id: 13, cols: [2, 2, 2, 2, 2, 2], name: "Six Equal (Newspaper)" },
  {
    id: 14,
    cols: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    name: "Twelve Equal (Newspaper)",
  },
];

// ─── Default header color config ──────────────────────────────────────────────
const defaultHeaderColors = {
  topBarBg: "#dbeafe",
  topBarText: "#1e293b",
  topBarBold: false,
  mainBg: "#ffffff",
  titleColor: "#000000",
  subtitleColor: "#64748b",
  logoBg: "#7c3aed",
  logoAccentBg: "#ea580c",
  logoText: "#ffffff",
  taglineBg: "#fef3c7",
  taglineText: "#92400e",
  taglineBorder: "#f59e0b",
  regBarBg: "#063e40",
  regBarText: "#ffffff",
  regBarBold: true,
  // Page 2+ header
  p2Bg: "#b91c1c",
  p2Text: "#ffffff",
};

const defaultSubHeaderColors = {
  bg: "#3b82f6",
  text: "#ffffff",
};

// ─── RichTextEditor: fixes cursor jump bug in contentEditable ────────────────
function RichTextEditor({ value, onChange, style, id, initialValue }) {
  const ref = useRef(null);
  const isComposing = useRef(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (ref.current && !initialized.current) {
      ref.current.innerHTML =
        initialValue !== undefined ? initialValue || "" : value || "";
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (ref.current && initialized.current && value !== undefined) {
      const currentText = ref.current.innerHTML
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();
      const newText = (value || "")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();
      if (currentText !== newText) {
        ref.current.innerHTML = value || "";
      }
    }
  }, [value]);

  return (
    <div
      ref={ref}
      id={id}
      contentEditable
      suppressContentEditableWarning
      onCompositionStart={() => {
        isComposing.current = true;
      }}
      onCompositionEnd={(e) => {
        isComposing.current = false;
        onChange(e.currentTarget.innerHTML);
      }}
      onInput={(e) => {
        if (!isComposing.current) onChange(e.currentTarget.innerHTML);
      }}
      style={style}
    />
  );
}

const getFontSize = (size) => {
  switch (size) {
    case "small":
      return "10px";
    case "medium":
      return "12px";
    case "large":
      return "14px";
    case "xlarge":
      return "16px";
    default:
      return "12px";
  }
};

const getSubHeadingSize = (size) => {
  switch (size) {
    case "small":
      return "13px";
    case "medium":
      return "15px";
    case "large":
      return "17px";
    case "xlarge":
      return "20px";
    case "xxlarge":
      return "24px";
    case "xxxlarge":
      return "28px";
    default:
      return "15px";
  }
};

const getHeadingSize = (size) => {
  switch (size) {
    case "small":
      return "16px";
    case "medium":
      return "20px";
    case "large":
      return "24px";
    case "xlarge":
      return "28px";
    case "xxlarge":
      return "36px";
    case "xxxlarge":
      return "48px";
    default:
      return "20px";
  }
};

const formatHindiDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const days = [
    "रविवार",
    "सोमवार",
    "मंगलवार",
    "बुधवार",
    "गुरुवार",
    "शुक्रवार",
    "शनिवार",
  ];
  const months = [
    "जनवरी",
    "फरवरी",
    "मार्च",
    "अप्रैल",
    "मई",
    "जून",
    "जुलाई",
    "अगस्त",
    "सितंबर",
    "अक्टूबर",
    "नवंबर",
    "दिसंबर",
  ];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

// ─── Shared: Newspaper Header (Page 1) ───────────────────────────────────────
function NewspaperHeader1({
  channelName,
  selectedDate,
  hc,
  headerBgImage,
  regVarsh,
  regAnk,
  regKulPej,
  regKimat,
}) {
  const c = hc || defaultHeaderColors;
  const leftText = `वर्ष - ${regVarsh || "01"}, अंक- ${regAnk || "34"}`;
  const rightText = `कुल पेज-${regKulPej || "08"}, कीमत-${regKimat || "5"} रू.`;

  // If user uploaded a header image → show it as full replacement
  if (headerBgImage) {
    return (
      <div
        style={{
          width: "100%",
          fontFamily: "'Bhaskar', 'Noto Serif Devanagari', serif",
        }}
      >
        <img
          src={headerBgImage}
          alt="header"
          style={{ display: "block", width: "100%", maxHeight: "186px" }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "5px 20px",
            background: c.regBarBg,
            color: c.regBarText,
            fontSize: "15px",
            fontWeight: c.regBarBold ? "bold" : "normal",
          }}
        >
          <span>{leftText}</span>
          <span style={{ fontWeight: c.regBarBold ? "bold" : "600" }}>
            {formatHindiDate(selectedDate)}
          </span>
          <span>{rightText}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: c.mainBg,
        fontFamily: "'Noto Serif Devanagari', serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 20px",
          backgroundColor: c.topBarBg,
          borderBottom: "1px solid #bfdbfe",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            color: c.topBarText,
            fontWeight: c.topBarBold ? "bold" : "500",
          }}
        >
          संपादक - दिनेश जोशी
        </div>
        <div
          style={{
            fontSize: "11px",
            color: c.topBarText,
            fontWeight: c.topBarBold ? "bold" : "500",
          }}
        >
          मो. 9425108412, 9425108292
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          gap: "20px",
          backgroundColor: c.mainBg,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "16px",
              color: c.subtitleColor,
              fontWeight: "400",
            }}
          >
            साप्ताहिक
          </div>
          <div
            style={{
              fontSize: "72px",
              fontWeight: "900",
              lineHeight: "1",
              color: c.titleColor,
              letterSpacing: "2px",
              marginTop: "5px",
            }}
          >
            {channelName || "नीमच दुनिया"}
          </div>
        </div>
        <div
          style={{
            backgroundColor: c.logoBg,
            color: c.logoText,
            padding: "12px 16px",
            borderRadius: "8px",
            minWidth: "140px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              backgroundColor: c.logoAccentBg,
              color: c.logoText,
              fontSize: "18px",
              fontWeight: "bold",
              padding: "4px",
              marginBottom: "6px",
            }}
          >
            नीमच खबर
          </div>
          <div style={{ fontSize: "12px", opacity: "0.9", lineHeight: "1.4" }}>
            khabarnp.in@gmail.com
            <br />
            neemuchkhabar.org
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "6px 10px",
          backgroundColor: c.taglineBg,
          fontSize: "12px",
          fontWeight: "600",
          color: c.taglineText,
          borderBottom: `3px solid ${c.taglineBorder}`,
        }}
      >
        <span>Registration number - MPHIN/25/A0405</span>
        <span>आपकी आवाज आप के शहर से</span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "5px 20px",
          background: c.regBarBg,
          color: c.regBarText,
          fontSize: "15px",
          fontWeight: c.regBarBold ? "bold" : "normal",
        }}
      >
        <span>{leftText}</span>
        <span style={{ fontWeight: c.regBarBold ? "bold" : "600" }}>
          {formatHindiDate(selectedDate)}
        </span>
        <span>{rightText}</span>
      </div>
    </div>
  );
}

// ─── Shared: Newspaper Header (Page 2+) ──────────────────────────────────────
function NewspaperHeader2({ channelName, selectedDate, pageNum, hc }) {
  const c = hc || defaultHeaderColors;
  return (
    <div
      style={{
        width: "100%",
        height: "50px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Bhaskar', 'Noto Serif Devanagari', serif",
        borderTop: `4px solid ${c.p2Bg}`,
        borderBottom: `4px solid ${c.p2Bg}`,
      }}
    >
      <div
        style={{ position: "absolute", inset: 0, backgroundColor: c.p2Bg }}
      />
      <div
        style={{
          position: "absolute",
          left: "-50px",
          top: 0,
          width: "240px",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.2)",
          transform: "skewX(-30deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "95px",
          top: 0,
          width: "140px",
          height: "100%",
          backgroundColor: "rgba(255,255,255,0.15)",
          transform: "skewX(-30deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "22px",
          top: "60%",
          transform: "translateY(-50%)",
          color: c.p2Text,
          fontSize: "34px",
        }}
      >
        {channelName}
      </div>
      <div
        style={{
          position: "absolute",
          right: "64px",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "22px",
          color: c.p2Text,
          whiteSpace: "nowrap",
        }}
      >
        {formatHindiDate(selectedDate)}
      </div>
      <div
        style={{
          position: "absolute",
          right: "16px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "28px",
          height: "28px",
          backgroundColor: "rgba(0,0,0,0.3)",
          color: c.p2Text,
          fontSize: "14px",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {pageNum}
      </div>
    </div>
  );
}

// ─── Shared: SubHeader ────────────────────────────────────────────────────────
function NewspaperSubHeader({
  templateId,
  customColors,
  customText,
  bgImage,
  bold,
  fontSize,
}) {
  if (!templateId) return null;
  const t = subHeaderTemplates.find((h) => h.id === templateId);
  if (!t) return null;
  const bg = customColors?.bg || t.bg;
  const textColor =
    customColors?.text || (t.bg === "#ffffff" ? "#000" : "#fff");
  const displayText =
    customText !== undefined && customText !== "" ? customText : t.text;

  if (bgImage) {
    return (
      <div style={{ padding: 0 }}>
        <img
          src={bgImage}
          alt="subheader"
          style={{
            display: "block",
            width: "100%",
            height: "33px",
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "7px 10px", backgroundColor: bg }}>
      <p
        style={{
          margin: 0,
          fontSize: `${fontSize || 13}px`,
          fontWeight: bold !== false ? "bold" : "normal",
          color: textColor,
          textAlign: "center",
        }}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayText) }}
      />
    </div>
  );
}

// ─── Shared: Newspaper Footer ─────────────────────────────────────────────────
function NewspaperFooter({ isLastPage, footerText }) {
  return (
    <>
      {isLastPage && (
        <div
          style={{
            width: "100%",
            padding: "5px 10px",
            display: "flex",
            justifyContent: "center",
            backgroundColor: "#dfdfdf",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: "bold" }}>
            {footerText ||
              "उदयरतन ऑफसेट द्वारा मुद्रित, दीपेश जोशी की ओर से दीपेश जोशी द्वारा प्रकाशित, उज्जैन में मुद्रित और कैलाश गली, सर्राफा बाजार जावद में प्रकाशित, संपादक दीपेश जोशी मो. 9425108412, 9425108292"}
          </div>
        </div>
      )}
      <div style={{ padding: "5px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            justifyContent: "space-between",
          }}
        >
          {[130, null, 230, null, 230, null, 130].map((w, i) =>
            w ? (
              <div
                key={i}
                style={{
                  width: `${w}px`,
                  height: "12px",
                  borderRadius: "23px",
                  backgroundColor: "#bbbbbb",
                  border: "0.5px solid #999",
                }}
              />
            ) : (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "4px",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                {["#00FFFF", "#FF00FF", "#FFFF00", "#000000"].map(
                  (color, j) => (
                    <div
                      key={j}
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: color,
                        border: "0.5px solid #999",
                      }}
                    />
                  ),
                )}
              </div>
            ),
          )}
        </div>
      </div>
    </>
  );
}

// ─── Shared: Render Cell Content (newspaper style) ───────────────────────────
function hasVisibleText(html) {
  if (!html) return false;
  // Strip all HTML tags and check if remaining text is non-empty
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return text.length > 0;
}

function NewspaperCellContent({ cell }) {
  const colCount = cell.columnCount || 1;
  const FONT = cell.fontFamily || "'Bhaskar', 'Noto Serif Devanagari', serif";
  const HEADING_FONT = cell.headingFontFamily || FONT;
  const SUBHEADING_FONT = cell.subHeadingFontFamily || FONT;

  const headingStyle = {
    color: cell.headingColor || "#000000",
    fontSize: getHeadingSize(cell.headingSize || "large"),
    fontWeight: "bold",
    margin: "2px 0 1px 0",
    textAlign: cell.headingAlign || "center",
    lineHeight: "1.25",
    fontFamily: HEADING_FONT,
    backgroundColor: cell.headingBg || "transparent",
    padding:
      cell.headingBg && cell.headingBg !== "transparent"
        ? "6px 8px 0 8px"
        : "4px 8px 0 8px",
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    ...(cell.headingOutlineWidth && cell.headingOutlineWidth !== "0"
      ? { WebkitTextStroke: `${cell.headingOutlineWidth}px ${cell.headingOutlineColor || "#000000"}` }
      : {}),
  };

  const subHeadingStyle = {
    color: cell.subHeadingColor || "#000000",
    fontSize: getSubHeadingSize(cell.subHeadingSize || "medium"),
    fontWeight: "700",
    margin: "1px 0 0 0",
    textAlign: cell.headingAlign || "center",
    lineHeight: "1.25",
    fontFamily: SUBHEADING_FONT,
    backgroundColor: cell.subHeadingBg || "transparent",
    padding:
      cell.subHeadingBg && cell.subHeadingBg !== "transparent"
        ? "5px 8px 0 8px"
        : "2px 8px 2px 8px",
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    ...(cell.subHeadingOutlineWidth && cell.subHeadingOutlineWidth !== "0"
      ? { WebkitTextStroke: `${cell.subHeadingOutlineWidth}px ${cell.subHeadingOutlineColor || "#000000"}` }
      : {}),
  };

  const images = cell.images || [];
  const textBaseStyle = {
    fontSize: getFontSize(cell.fontSize || "medium"),
    lineHeight: "1.4",
    color: cell.textColor || "#000000",
    textAlign: cell.textAlign || "justify",
    fontFamily: FONT,
  };

  return (
    <div
      style={{
        padding: "0",
        boxSizing: "border-box",
        backgroundColor: cell.color || "white",
        overflow: "hidden",
        border: cell.isAdvertisement ? "2px solid #000000" : "none",
      }}
    >
      {hasVisibleText(cell.heading) && (
        <div
          style={headingStyle}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cell.heading) }}
        />
      )}
      {hasVisibleText(cell.subHeading) && (
        <div
          style={subHeadingStyle}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(cell.subHeading),
          }}
        />
      )}

      <div style={{ padding: "5px 7px" }}>
        {images.length === 0 ? (
          // ── No images: multi-column text ──
          <div
            style={{
              ...textBaseStyle,
              columnCount: colCount,
              columnGap: "8px",
            }}
          >
            {cell.text && (
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(cell.text),
                }}
              />
            )}
          </div>
        ) : images.length >= 2 ? (
          // ── 2 images: side-by-side, text below in columns ──
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
              {images.map((img, imgIdx) => {
                const span = img.colSpan || 0;
                const tc = colCount || 2;
                const w =
                  span > 0
                    ? `${Math.round((span / tc) * 100)}%`
                    : `${Math.round(100 / images.length)}%`;
                return (
                  <img
                    key={imgIdx}
                    src={img.src}
                    alt=""
                    style={{
                      width: w,
                      height: `${img.height || 150}px`,
                      borderRadius: "2px",
                      flexShrink: 0,
                      display: "block",
                    }}
                  />
                );
              })}
            </div>
            {cell.text && (
              <div
                style={{
                  ...textBaseStyle,
                  columnCount: colCount || 1,
                  columnGap: "8px",
                }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(cell.text),
                }}
              />
            )}
          </div>
        ) : images.length === 1 ? (
          // ── Single image: smart layout ──
          (() => {
            const img = images[0];
            const align = img.align || "left";
            const span = img.colSpan || 0;
            const tc = colCount || 1;
            const imgH = `${img.height || 150}px`;

            // ── Case 1: Full-width (colSpan = all cols OR colSpan=0 + center) ──
            // Image on top, text below in full columns
            if ((span >= tc && tc > 0) || (align === "center" && span === 0)) {
              return (
                <div style={{ width: "100%" }}>
                  <img
                    src={img.src}
                    alt=""
                    style={{
                      width: span >= tc ? "100%" : `${img.width || 150}px`,
                      height: imgH,
                      borderRadius: "2px",
                      display: span >= tc ? "block" : "inline-block",
                      margin: span >= tc ? "0 0 5px 0" : "0 auto 5px",
                      textAlign: "center",
                    }}
                  />
                  {cell.text && (
                    <div
                      style={{
                        ...textBaseStyle,
                        columnCount: tc,
                        columnGap: "8px",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(cell.text),
                      }}
                    />
                  )}
                </div>
              );
            }

            // ── Case 2: colSpan set (partial) → flex side-by-side ──
            // Image takes span/tc %, text fills rest with (tc - span) columns
            if (span > 0 && span < tc) {
              const imgPct = Math.round((span / tc) * 100);
              const textPct = 100 - imgPct;
              const textCols = Math.max(1, tc - span);
              return (
                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    width: "100%",
                    alignItems: "flex-start",
                  }}
                >
                  {align === "right" && cell.text && (
                    <div
                      style={{
                        ...textBaseStyle,
                        width: `${textPct}%`,
                        flexShrink: 0,
                        columnCount: textCols > 1 ? textCols : undefined,
                        columnGap: "6px",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(cell.text),
                      }}
                    />
                  )}
                  <img
                    src={img.src}
                    alt=""
                    style={{
                      width: `${imgPct}%`,
                      flexShrink: 0,
                      height: imgH,
                      borderRadius: "2px",
                      display: "block",
                    }}
                  />
                  {align !== "right" && cell.text && (
                    <div
                      style={{
                        ...textBaseStyle,
                        width: `${textPct}%`,
                        flexShrink: 0,
                        columnCount: textCols > 1 ? textCols : undefined,
                        columnGap: "6px",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(cell.text),
                      }}
                    />
                  )}
                </div>
              );
            }

            const floatDir = align === "right" ? "right" : "left";
            return (
              <div
                style={{ ...textBaseStyle, columnCount: tc, columnGap: "8px" }}
              >
                <img
                  src={img.src}
                  alt=""
                  style={{
                    float: floatDir,
                    width: `${img.width || 120}px`,
                    height: imgH,
                    borderRadius: "2px",
                    marginRight: floatDir === "left" ? "6px" : "0",
                    marginLeft: floatDir === "right" ? "6px" : "0",
                    marginBottom: "4px",
                    display: "block",
                  }}
                />
                {cell.text && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(cell.text),
                    }}
                  />
                )}
                <div style={{ clear: "both" }} />
              </div>
            );
          })()
        ) : null}
      </div>
    </div>
  );
}

// ─── Shared: Render full newspaper page content ───────────────────────────────
function NewspaperPageContent({ rows }) {
  return (
    <div
      style={{
        width: "100%",
        margin: 0,
        background: "white",
        padding: "2px 0 0 0",
        boxSizing: "border-box",
      }}
    >
      {rows.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "100px 40px",
            color: "#9ca3af",
          }}
        >
          <p style={{ fontSize: "14px", margin: 0 }}>No content added yet</p>
        </div>
      ) : (
        rows.map((row) => (
          <div
            key={row.id}
            style={{
              display: "grid",
              gap: "0px",
              gridTemplateColumns: row.layout.cols
                .map((c) => `${(c / 12) * 100}%`)
                .join(" "),
              //   borderBottom: "1px solid #ccc",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {row.cells.map((cell, cellIdx) => (
              <div
                key={cell.id}
                // style={{
                //   borderRight:
                //     cellIdx < row.cells.length - 1 ? "1px solid #ccc" : "none",
                // }}
              >
                <NewspaperCellContent cell={cell} />
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
// ─── Login Page Component ─────────────────────────────────────────────────────
function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Username aur Password dono bharo");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const form = new FormData();
    form.append("mobile", username);
form.append("password", password);


      const response = await axios.post(
        "https://neemuchkhabar.org/api/login",
        form,
        { timeout: 15000 }
      );
      console.log(response.data.status)
      if (response?.data?.status) {
        // Server se aaya token save karo — plain "true" nahi
        const token = response?.data?.data?.token;
        if (!token) {
          setError("Server ne token nahi diya. Admin se contact karein.");
          return;
        }
        localStorage.setItem("np_token", token);
        localStorage.setItem("np_user", username.trim());
        onLoginSuccess(username.trim(), token);
      } else {
        setError(response?.data?.message || "Username ya Password galat hai");
      }
    } catch (err) {
      setError("Server se connect nahi ho paya. Internet check karein.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Hind', 'Noto Serif Devanagari', sans-serif",
        padding: "20px",
      }}
    >


      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          position: "relative",
          zIndex: 1,
        }}
      >


        {/* Login Card */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "20px",
            padding: "36px 32px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}
        >
          <h2
            style={{
              color: "#f1f5f9",
              fontSize: "20px",
              fontWeight: "700",
              margin: "0 0 24px 0",
              textAlign: "center",
            }}
          >
            Welcome Back
          </h2>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Username */}
            <div>
              <label
                style={{
                  display: "block",
                  color: "#cbd5e1",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "7px",
                  letterSpacing: "0.5px",
                }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                placeholder="Username"
                autoComplete="username"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: `1.5px solid ${error && !username ? "#ef4444" : "rgba(255,255,255,0.15)"}`,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  color: "#f1f5f9",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = "#dc2626"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
              />
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: "block",
                  color: "#cbd5e1",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "7px",
                  letterSpacing: "0.5px",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Password"
                  autoComplete="current-password"
                  style={{
                    width: "100%",
                    padding: "12px 44px 12px 16px",
                    borderRadius: "10px",
                    border: `1.5px solid ${error && !password ? "#ef4444" : "rgba(255,255,255,0.15)"}`,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    color: "#f1f5f9",
                    fontSize: "15px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#dc2626"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    padding: "0",
                    color: "#94a3b8",
                  }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                style={{
                  backgroundColor: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.4)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "#fca5a5",
                  fontSize: "13px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                border: "none",
                background: loading
                  ? "linear-gradient(135deg, #6b7280, #4b5563)"
                  : "linear-gradient(135deg, #dc2626, #b91c1c)",
                color: "white",
                fontSize: "16px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.5px",
                boxShadow: loading ? "none" : "0 4px 16px rgba(220,38,38,0.4)",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "4px",
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind:wght@400;500;600;700&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(148,163,184,0.6); }
      `}</style>
    </div>
  );
}

// ─── App Wrapper (Secure Token-based Login gate) ─────────────────────────────
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState("");
  const [verifying, setVerifying] = useState(true); // startup pe token verify ho raha hai

  useEffect(() => {
    const token = localStorage.getItem("np_token");
    const user  = localStorage.getItem("np_user");

    if (!token || !user) {
      // Token hi nahi hai → seedha login page
      setVerifying(false);
      return;
    }

    // Token hai → server se verify karo (fake token kaam nahi karega)
    const form = new FormData();
    form.append("token", token);
    axios
      .post("https://neemuchkhabar.org/Api/checkToken", form, { timeout: 10000 })
      .then((res) => {
        if (res?.data?.status) {
          setIsLoggedIn(true);
          setLoggedInUser(user);
        } else {
          // Token invalid/expire → clear karo aur login page
          localStorage.removeItem("np_token");
          localStorage.removeItem("np_user");
        }
      })
      .catch(() => {
        // Network error pe bhi logout — security ke liye
        localStorage.removeItem("np_token");
        localStorage.removeItem("np_user");
      })
      .finally(() => setVerifying(false));
  }, []);

  const handleLogout = () => {
    // Server pe bhi token invalidate karo
    const token = localStorage.getItem("np_token");
    if (token) {
      const form = new FormData();
      form.append("token", token);
      axios
        .post("https://neemuchkhabar.org/Paper/logout", form, { timeout: 5000 })
        .catch(() => {}); // logout fail ho to bhi local clear karo
    }
    localStorage.removeItem("np_token");
    localStorage.removeItem("np_user");
    setIsLoggedIn(false);
    setLoggedInUser("");
  };

  // Startup pe verifying — blank/spinner dikhao
  if (verifying) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <div style={{ fontSize: "48px" }}>📰</div>
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid rgba(255,255,255,0.2)",
            borderTopColor: "#dc2626",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
          Verifying session...
        </p>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginPage
        onLoginSuccess={(user, token) => {
          setIsLoggedIn(true);
          setLoggedInUser(user);
        }}
      />
    );
  }

  return <NewspaperEditor loggedInUser={loggedInUser} onLogout={handleLogout} />;
}

// ─── Main Editor ──────────────────────────────────────────────────────────────
function NewspaperEditor({ loggedInUser, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContainers, setPreviewContainers] = useState([]);
  const [newsPopup, setNewsPopup] = useState(null);
  const [newsList, setNewsList] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("header");
  const [selectedHeaderTemplate, setSelectedHeaderTemplate] = useState(null);
  const [selectedSubHeaderTemplate, setSelectedSubHeaderTemplate] =
    useState(null);
  const [selectedFooterTemplate, setSelectedFooterTemplate] = useState(null);
  const [pages, setPages] = useState([{ id: 1, rows: [] }]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [showConvertingModal, setShowConvertingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false); // toggle ON/OFF
  const [autoSaveStatus, setAutoSaveStatus] = useState("idle"); // idle | saving | saved | error
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState(null);
  const [pageDeleteConfirm, setPageDeleteConfirm] = useState(null); // pageId to delete
  const [channelName, setChannelName] = useState("नीमच दुनिया");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [showDesignLayout, setShowDesignLayout] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  // ── Color customization ──
  const [headerColors, setHeaderColors] = useState(defaultHeaderColors);
  const [headerBgImage, setHeaderBgImage] = useState(null); // base64 image for header bg
  const [subHeaderColors, setSubHeaderColors] = useState(
    defaultSubHeaderColors,
  );

  // ── Footer text ──
  const [footerText, setFooterText] = useState(
    "उदयरतन ऑफसेट द्वारा मुद्रित, दीपेश जोशी की ओर से दीपेश जोशी द्वारा प्रकाशित, उज्जैन में मुद्रित और कैलाश गली, सर्राफा बाजार जावद में प्रकाशित, संपादक दीपेश जोशी मो. 9425108412, 9425108292",
  );
  // ── Dynamic header reg bar (4 inputs) ──
  const [regVarsh, setRegVarsh] = useState("01");
  const [regAnk, setRegAnk] = useState("34");
  const [regKulPej, setRegKulPej] = useState("08");
  const [regKimat, setRegKimat] = useState("5");
  // ── SubHeader custom text and image ──
  const [subHeaderText, setSubHeaderText] = useState("");
  const [subHeaderBold, setSubHeaderBold] = useState(true);
  const [subHeaderFontSize, setSubHeaderFontSize] = useState("13");
  const [subHeaderBgImage, setSubHeaderBgImage] = useState(null);

  const updateHC = (key, val) =>
    setHeaderColors((prev) => ({ ...prev, [key]: val }));
  const updateSHC = (key, val) =>
    setSubHeaderColors((prev) => ({ ...prev, [key]: val }));

  // ── Image helpers ──
  const handleMultipleImageUpload = (rowId, cellId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPages((prevPages) =>
        prevPages.map((page) => {
          if (page.id !== currentPage) return page;
          return {
            ...page,
            rows: page.rows.map((row) => {
              if (row.id !== rowId) return row;
              return {
                ...row,
                cells: row.cells.map((cell) => {
                  if (cell.id !== cellId) return cell;
                  const currentImages = cell.images || [];
                  if (currentImages.length >= 2) {
                    alert("Maximum 2 images allowed per cell");
                    return cell;
                  }
                  return {
                    ...cell,
                    images: [
                      ...currentImages,
                      {
                        src: event.target?.result,
                        width: 150,
                        height: 150,
                        align: "left",
                        column: 1,
                      },
                    ],
                  };
                }),
              };
            }),
          };
        }),
      );
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const updateImageProp = (rowId, cellId, imageIndex, prop, val) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== currentPage) return page;
        return {
          ...page,
          rows: page.rows.map((row) => {
            if (row.id !== rowId) return row;
            return {
              ...row,
              cells: row.cells.map((cell) => {
                if (cell.id !== cellId) return cell;
                const updatedImages = [...(cell.images || [])];
                if (updatedImages[imageIndex])
                  updatedImages[imageIndex] = {
                    ...updatedImages[imageIndex],
                    [prop]: val,
                  };
                return { ...cell, images: updatedImages };
              }),
            };
          }),
        };
      }),
    );
  };

  const removeImage = (rowId, cellId, imageIndex) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== currentPage) return page;
        return {
          ...page,
          rows: page.rows.map((row) => {
            if (row.id !== rowId) return row;
            return {
              ...row,
              cells: row.cells.map((cell) => {
                if (cell.id !== cellId) return cell;
                const updatedImages = [...(cell.images || [])];
                updatedImages.splice(imageIndex, 1);
                return { ...cell, images: updatedImages };
              }),
            };
          }),
        };
      }),
    );
  };

  // ── Cell update helpers ──
  const updateCellProperty = (rowId, cellId, property, value) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== currentPage) return page;
        return {
          ...page,
          rows: page.rows.map((row) => {
            if (row.id !== rowId) return row;
            return {
              ...row,
              cells: row.cells.map((cell) =>
                cell.id === cellId ? { ...cell, [property]: value } : cell,
              ),
            };
          }),
        };
      }),
    );
  };

  // ── Fetch news ──
  const fetchNews = async (rowId, cellId) => {
    setNewsPopup({ rowId, cellId });
    setNewsLoading(true);
  };

  const handleNewsSelect = async (newsItem) => {
    if (!newsPopup) return;
    const { rowId, cellId } = newsPopup;
    updateCellProperty(rowId, cellId, "heading", String(newsItem.title || ""));
    try {
      const imageUrl =
        "https://neemuchkhabar.org/uploads/news/" +
        String(newsItem.imagename || "");
      const form1 = new FormData();
      form1.append("image_url", imageUrl);
      const form2 = new FormData();
      form2.append("NewsID", newsItem.id);
      form2.append("zonewise", newsItem.zonewise);
      const [base64Result, newsDetailResult] = await Promise.all([
        newsItem.imagename
          ? fetch("https://neemuchkhabar.org/api/convert_base", {
              method: "POST",
              body: form1,
            })
              .then((r) => r.json())
              .catch(() => null)
          : Promise.resolve(null),
        fetch("https://neemuchkhabar.org/Paper/newsListByID", {
          method: "POST",
          body: form2,
        })
          .then((r) => r.json())
          .catch(() => null),
      ]);
      const finalSrc = base64Result?.data?.base64_image || "";
      const rawDescription = newsDetailResult?.result?.[0]?.description || "";
      const newsText = rawDescription
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();
      const rawOther = newsDetailResult?.result?.[0]?.otherdescription || "";
      const otherDesc = rawOther
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();
      setPages((prev) =>
        prev.map((page) => ({
          ...page,
          rows: page.rows.map((row) =>
            row.id === rowId
              ? {
                  ...row,
                  cells: row.cells.map((cell) =>
                    cell.id === cellId
                      ? {
                          ...cell,
                          text: String(newsText),
                          subHeading: otherDesc
                            ? String(otherDesc)
                            : cell.subHeading,
                          images: newsItem.imagename
                            ? [
                                ...(cell.images || []).slice(0, 1),
                                {
                                  src: finalSrc,
                                  width: 150,
                                  height: 150,
                                  align: "left",
                                  column: 1,
                                },
                              ].slice(0, 2)
                            : cell.images,
                        }
                      : cell,
                  ),
                }
              : row,
          ),
        })),
      );
    } catch (error) {
      console.error("News select error:", error);
    }
    setNewsPopup(null);
  };

  const fetchNewData = async () => {
    const form = new FormData();
    form.append("zonewise", "3");
    try {
      const response = await axios.post(
        "https://neemuchkhabar.org/Paper/newsList",
        form,
      );
      if (response?.data?.status) setNewsList(response?.data?.result);
      else setNewsList([]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Old cache clear karo
    localStorage.removeItem("newspaperEditorData");
    fetchNewData();
  }, []);

  // ✅ App open hote hi aaj ki date ka data automatically load karo
  useEffect(() => {
    if (!selectedDate) return;
    const form = new FormData();
    form.append("date", selectedDate);
    setLoading(true);
    axios
      .post("https://neemuchkhabar.org/Paper/get_by_date", form, { timeout: 15000 })
      .then((response) => {
        if (response?.data?.status) {
          const rawData = response?.data?.data?.data;
          if (!rawData) return;
          try {
            const parsed = JSON.parse(rawData);
            setPages(parsed.pages || [{ id: 1, rows: [] }]);
            setChannelName(parsed.channelName || "नीमच दुनिया");
            setSelectedHeaderTemplate(parsed.selectedHeaderTemplate || null);
            setSelectedSubHeaderTemplate(parsed.selectedSubHeaderTemplate || null);
            setSelectedFooterTemplate(parsed.selectedFooterTemplate || null);
            setCurrentPage(parsed.currentPage || 1);
            if (parsed.headerColors) setHeaderColors(parsed.headerColors);
            if (parsed.headerBgImage) setHeaderBgImage(parsed.headerBgImage);
            if (parsed.subHeaderColors) setSubHeaderColors(parsed.subHeaderColors);
            if (parsed.footerText !== undefined) setFooterText(parsed.footerText);
            if (parsed.regVarsh !== undefined) setRegVarsh(parsed.regVarsh);
            if (parsed.regAnk !== undefined) setRegAnk(parsed.regAnk);
            if (parsed.regKulPej !== undefined) setRegKulPej(parsed.regKulPej);
            if (parsed.regKimat !== undefined) setRegKimat(parsed.regKimat);
            if (parsed.subHeaderText !== undefined) setSubHeaderText(parsed.subHeaderText);
            if (parsed.subHeaderBold !== undefined) setSubHeaderBold(parsed.subHeaderBold);
            if (parsed.subHeaderFontSize !== undefined) setSubHeaderFontSize(parsed.subHeaderFontSize);
            if (parsed.subHeaderBgImage) setSubHeaderBgImage(parsed.subHeaderBgImage);
            toast.success("✅ आज का data load हो गया!");
          } catch (e) {
            console.error("Startup parse error:", e);
          }
        }
        // Agar data nahi mila to blank page — koi error nahi dikhana
      })
      .catch((err) => console.error("Startup load error:", err))
      .finally(() => setLoading(false));
  }, []); // sirf ek baar — app open pe

  const autoSave = async () => {
    // Sirf tab save karo jab date selected ho aur kuch pages ho
    if (!selectedDate || !pages || pages.length === 0) return;
    // Agar pages mein koi content hi nahi to save mat karo
    const hasContent = pages.some((p) => p.rows && p.rows.length > 0);
    if (!hasContent) return;

    const dataToSave = {
      pages,
      channelName,
      selectedHeaderTemplate,
      selectedSubHeaderTemplate,
      selectedFooterTemplate,
      currentPage,
      headerColors,
      headerBgImage,
      subHeaderColors,
      footerText,
      regVarsh,
      regAnk,
      regKulPej,
      regKimat,
      subHeaderText,
      subHeaderBold,
      subHeaderFontSize,
      subHeaderBgImage,
      lastSaved: new Date().toISOString(),
    };

    const form = new FormData();
    form.append("date", selectedDate);
    form.append("data", JSON.stringify(dataToSave));

    try {
      setAutoSaveStatus("saving");
      const response = await axios.post(
        "https://neemuchkhabar.org/Paper/savePaper",
        form,
        { timeout: 10000 }
      );
      if (response.data.status) {
        setAutoSaveStatus("saved");
        setLastAutoSaveTime(new Date());
      } else {
        setAutoSaveStatus("error");
      }
    } catch (err) {
      setAutoSaveStatus("error");
      console.error("Auto-save failed:", err);
    }
  };

  const handleManualSave = async () => {
    const dataToSave = {
      pages,
      channelName,
      selectedHeaderTemplate,
      selectedSubHeaderTemplate,
      selectedFooterTemplate,
      currentPage,
      headerColors,
      headerBgImage,
      subHeaderColors,
      footerText,
      regVarsh,
      regAnk,
      regKulPej,
      regKimat,
      subHeaderText,
      subHeaderBold,
      subHeaderFontSize,
      subHeaderBgImage,
      lastSaved: new Date().toISOString(),
    };
    const jsonData = JSON.stringify(dataToSave);
    // ✅ FIX: localStorage mein save band kiya - sirf server pe save hoga
    // Isse laptop/mobile dono fresh server data load karenge
    // localStorage.setItem("newspaperEditorData", jsonData); // REMOVED
    const form = new FormData();
    form.append("date", selectedDate);
    form.append("data", jsonData);
    try {
      const response = await axios.post(
        "https://neemuchkhabar.org/Paper/savePaper",
        form,
      );
      if (response.data.status) toast.success(response.data.message);
      else toast.error(response.data.message);
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ NEW: Clear all cache & localStorage - New Device ke liye
  const handleClearCache = async () => {
    // 1. localStorage clear karo
    localStorage.clear();

    // 2. SessionStorage clear karo
    sessionStorage.clear();

    // 3. Browser Cache (Service Worker) clear karo agar available ho
    if ("caches" in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      } catch (e) {
        console.log("Cache clear error (non-critical):", e);
      }
    }

    // 4. App state reset karo - fresh start
    setPages([{ id: 1, rows: [] }]);
    setChannelName("नीमच दुनिया");
    setSelectedHeaderTemplate(null);
    setSelectedSubHeaderTemplate(null);
    setSelectedFooterTemplate(null);
    setCurrentPage(1);
    setHeaderColors(defaultHeaderColors);
    setHeaderBgImage(null);
    setSubHeaderColors(defaultSubHeaderColors);
    setFooterText(
      "उदयरतन ऑफसेट द्वारा मुद्रित, दीपेश जोशी की ओर से दीपेश जोशी द्वारा प्रकाशित, उज्जैन में मुद्रित और कैलाश गली, सर्राफा बाजार जावद में प्रकाशित, संपादक दीपेश जोशी मो. 9425108412, 9425108292"
    );
    setRegVarsh("01");
    setRegAnk("01");
    setRegKulPej("01");
    setRegKimat("01");
    setSubHeaderText("");
    setSubHeaderBgImage(null);

    setShowClearCacheModal(false);
    toast.success("✅ Cache & Data clear ho gaya! Ab date select karke data lo.");
  };

  const getDataByDate = async () => {
    setHeaderBgImage(null);

    if (!selectedDate) {
      toast.error("Please select date");
      return;
    }

    const form = new FormData();
    form.append("date", selectedDate);

    try {
      setLoading(true);

      const response = await axios.post(
        "https://neemuchkhabar.org/Paper/get_by_date",
        form,
        { timeout: 15000 } // 15 sec timeout - hang nahi karega
      );

      if (response?.data?.status) {
        const rawData = response?.data?.data?.data;
        if (!rawData) {
          toast.error("Server se data nahi aaya. Dobara try karein.");
          return;
        }
        let parsed;
        try {
          parsed = JSON.parse(rawData);
        } catch (parseErr) {
          toast.error("Data format galat hai. Server se contact karein.");
          console.error("JSON parse error:", parseErr);
          return;
        }

        setPages(parsed.pages || [{ id: 1, rows: [] }]);
        setChannelName(parsed.channelName || "Channel Name");
        setSelectedHeaderTemplate(parsed.selectedHeaderTemplate || null);
        setSelectedSubHeaderTemplate(parsed.selectedSubHeaderTemplate || null);
        setSelectedFooterTemplate(parsed.selectedFooterTemplate || null);
        setCurrentPage(parsed.currentPage || 1);

        if (parsed.headerColors) setHeaderColors(parsed.headerColors);
        if (parsed.headerBgImage) setHeaderBgImage(parsed.headerBgImage);
        if (parsed.subHeaderColors) setSubHeaderColors(parsed.subHeaderColors);
        if (parsed.footerText !== undefined) setFooterText(parsed.footerText);
        if (parsed.regVarsh !== undefined) setRegVarsh(parsed.regVarsh);
        if (parsed.regAnk !== undefined) setRegAnk(parsed.regAnk);
        if (parsed.regKulPej !== undefined) setRegKulPej(parsed.regKulPej);
        if (parsed.regKimat !== undefined) setRegKimat(parsed.regKimat);

        if (parsed.subHeaderText !== undefined)
          setSubHeaderText(parsed.subHeaderText);

        if (parsed.subHeaderBold !== undefined)
          setSubHeaderBold(parsed.subHeaderBold);

        if (parsed.subHeaderFontSize !== undefined)
          setSubHeaderFontSize(parsed.subHeaderFontSize);

        if (parsed.subHeaderBgImage)
          setSubHeaderBgImage(parsed.subHeaderBgImage);
      } else {
        toast.error(response.data.message);

        setCurrentPage(1);
        setPages([{ id: 1, rows: [] }]);
        setSelectedHeaderTemplate(null);
        setSelectedSubHeaderTemplate(null);
        setSelectedFooterTemplate(null);

        setHeaderColors(defaultHeaderColors);
        setHeaderBgImage(null);
        setSubHeaderColors(defaultSubHeaderColors);

        setFooterText(
          "उदयरतन ऑफसेट द्वारा मुद्रित, दीपेश जोशी की ओर से दीपेश जोशी द्वारा प्रकाशित, उज्जैन में मुद्रित और कैलाश गली, सर्राफा बाजार जावद में प्रकाशित, संपादक दीपेश जोशी मो. 9425108412, 9425108292",
        );

        setRegVarsh("01");
        setRegAnk("01");
        setRegKulPej("01");
        setRegKimat("01");
        setSubHeaderText("");
        setSubHeaderBgImage(null);
      }
    } catch (error) {
      console.error("getDataByDate error:", error);
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        toast.error("⏱️ Request timeout! Internet slow hai ya server down hai.");
      } else if (!navigator.onLine) {
        toast.error("📵 Internet connection nahi hai. Check karein.");
      } else {
        toast.error("❌ Data load nahi hua: " + (error?.response?.data?.message || error.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-save - sirf tab chalega jab autoSaveEnabled ON ho
  useEffect(() => {
    if (!autoSaveEnabled) {
      setAutoSaveStatus("idle");
      return;
    }
    const intervalId = setInterval(() => {
      autoSave();
    }, 60000); // 60 seconds (1 minute)
    return () => clearInterval(intervalId);
  }, [
    autoSaveEnabled,
    pages,
    channelName,
    selectedDate,
    selectedHeaderTemplate,
    selectedSubHeaderTemplate,
    selectedFooterTemplate,
    headerColors,
    subHeaderColors,
    footerText,
    regVarsh,
    regAnk,
    regKulPej,
    regKimat,
    subHeaderText,
    subHeaderBold,
    subHeaderFontSize,
    subHeaderBgImage,
  ]);

  // ── Row management ──
  const addRow = () => {
    if (selectedLayout) {
      setPages((prev) =>
        prev.map((page) => {
          if (page.id !== currentPage) return page;
          return {
            ...page,
            rows: [
              ...page.rows,
              {
                id: Date.now(),
                layout: selectedLayout,
                cells: selectedLayout.cols.map((col, idx) => ({
                  id: `${Date.now()}-${idx}`,
                  heading: "",
                  subHeading: "",
                  text: "",
                  image: null,
                  imageWidth: 200,
                  imageHeight: 200,
                  color: "white",
                  textColor: "#000000",
                  fontSize: "medium",
                  textAlign: "justify",
                  headingAlign: "center",
                  headingSize: "large",
                  headingBg: "transparent",
                  headingColor: "#000000",
                  subHeadingBg: "transparent",
                  subHeadingColor: "#444444",
                  columnCount: 1,
                  imageAlign: "left",
                  fontFamily: "'Bhaskar', 'Noto Serif Devanagari', serif",
                  headingFontFamily:
                    "'Bhaskar', 'Noto Serif Devanagari', serif",
                  subHeadingFontFamily:
                    "'Bhaskar', 'Noto Serif Devanagari', serif",
                  images: [],
                  isAdvertisement: false,
                })),
              },
            ],
          };
        }),
      );
      setShowLayoutModal(false);
    }
  };

  const deleteRow = (rowId) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === currentPage
          ? { ...page, rows: page.rows.filter((r) => r.id !== rowId) }
          : page,
      ),
    );
  };

  const addNewPage = () => {
    const newPageId = Math.max(...pages.map((p) => p.id)) + 1;
    setPages([...pages, { id: newPageId, rows: [] }]);
    setCurrentPage(newPageId);
  };

  const deletePage = (pageId) => {
    if (pages.length > 1) {
      const updatedPages = pages.filter((p) => p.id !== pageId);
      setPages(updatedPages);
      if (currentPage === pageId) setCurrentPage(updatedPages[0].id);
    }
  };

  const generatePreview = () => {
    setShowPreview(true);
    setPreviewContainers(
      pages.map((page) => ({ pageId: page.id, rows: page.rows })),
    );
  };

  const generatePDF = async () => {
    setShowConvertingModal(true);

    try {
      await document.fonts.ready;

      const PX_TO_MM = 1 / 3.78;
      const PDF_W_MM = PAGE_W * PX_TO_MM;
      const PDF_H_MM = PAGE_H * PX_TO_MM;

      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: [PDF_W_MM, PDF_H_MM],
        compress: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 800));

      for (let i = 0; i < pages.length; i++) {
        const pageId = pages[i].id;
        const pageEl = document.getElementById(`pdf-render-page-${pageId}`);

        if (!pageEl) {
          console.warn(`pdf-render-page-${pageId} not found`);
          continue;
        }

        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          foreignObjectRendering: false,
          width: PAGE_W,
          height: PAGE_H,
          logging: false,
          imageTimeout: 15000,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (i > 0) pdf.addPage();
        pdf.addImage(
          imgData,
          "JPEG",
          0,
          0,
          PDF_W_MM,
          PDF_H_MM,
          undefined,
          "FAST",
        );
      }

      const formatDate = (date) => {
        const d = date ? new Date(date) : new Date();
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
      };

      pdf.save(
        `${channelName.replace(/\s+/g, "_")}_${formatDate(selectedDate)}.pdf`,
      );
      setShowConvertingModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("PDF error:", error);
      setShowConvertingModal(false);
      alert("PDF बनाने में समस्या आई: " + error.message);
    }
  };
  const currentPageData = pages.find((p) => p.id === currentPage);

  // ─── Color Picker Row ────────────────
  const ColorRow = ({ label, value, onChange }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "8px",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "4px",
          backgroundColor: value,
          border: "1px solid #d1d5db",
          flexShrink: 0,
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            position: "absolute",
            inset: 0,
            width: "150%",
            height: "150%",
            opacity: 0,
            cursor: "pointer",
          }}
        />
      </div>
      <label style={{ fontSize: "12px", color: "#374151", flex: 1 }}>
        {label}
      </label>
      <span
        style={{ fontSize: "11px", color: "#6b7280", fontFamily: "monospace" }}
      >
        {value}
      </span>
    </div>
  );

  // ──────────── Render ────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f3f4f6",
      }}
    >
      <div
        style={{
          backgroundColor: "#0f766e",
          color: "white",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <Menu
            style={{ width: "22px", height: "22px", cursor: "pointer" }}
            onClick={() => setShowSidebar(!showSidebar)}
          />
          {[
            {
              label: "ADD ROW",
              bg: "#663bac",
              action: () => setShowLayoutModal(true),
              icon: <Plus style={{ width: "16px", height: "16px" }} />,
            },
            {
              label: showDesignLayout ? "HIDE" : "DESIGN",
              bg: showDesignLayout ? "#dc2626" : "#6b7280",
              action: () => setShowDesignLayout(!showDesignLayout),
              icon: <Eye style={{ width: "16px", height: "16px" }} />,
            },
            {
              label: "NEW DEVICE",
              bg: "#f97316",
              action: () => setShowClearCacheModal(true),
              icon: <span style={{ fontSize: "14px" }}>📱</span>,
            },
            {
              label: "SAVE",
              bg: "#3b82f6",
              action: () => setShowSavePopup(true),
              icon: <Save style={{ width: "16px", height: "16px" }} />,
            },
            {
              label: "DELETE",
              bg: "#dc2626",
              action: () => setShowDeleteConfirm(true),
              icon: <Trash2 style={{ width: "16px", height: "16px" }} />,
            },
            {
              label: "PREVIEW",
              bg: "#8b5cf6",
              action: () => generatePreview(),
              icon: <Eye style={{ width: "16px", height: "16px" }} />,
            },
            {
              label: "DOWNLOAD PDF",
              bg: "#10b981",
              action: generatePDF,
              icon: <Download style={{ width: "16px", height: "16px" }} />,
            },
          ].map(({ label, bg, action, icon }) => (
            <button
              key={label}
              onClick={action}
              style={{
                backgroundColor: bg,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "white",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {icon} {label}
            </button>
          ))}

          {/* Auto-Save Toggle (Radio style) + Status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 12px",
              borderRadius: "8px",
              backgroundColor: autoSaveEnabled ? "#f0fdf4" : "#f9fafb",
              border: `1.5px solid ${autoSaveEnabled ? "#86efac" : "#d1d5db"}`,
              cursor: "pointer",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
            onClick={() => {
              const next = !autoSaveEnabled;
              setAutoSaveEnabled(next);
              if (!next) setAutoSaveStatus("idle");
              else toast.info("🔄 Auto-save ON — हर 1 मिनट में save होगा");
            }}
          >
            {/* Radio circle */}
            <div
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                border: `2px solid ${autoSaveEnabled ? "#16a34a" : "#9ca3af"}`,
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {autoSaveEnabled && (
                <div
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    backgroundColor: "#16a34a",
                  }}
                />
              )}
            </div>

            {/* Label + status */}
            <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: autoSaveEnabled ? "#15803d" : "#6b7280",
                }}
              >
                Auto-Save {autoSaveEnabled ? "ON" : "OFF"}
              </span>
              <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "500" }}>
                {!autoSaveEnabled && "Click to enable"}
                {autoSaveEnabled && autoSaveStatus === "idle"   && "1 min में save होगा"}
                {autoSaveEnabled && autoSaveStatus === "saving" && "⏳ Saving..."}
                {autoSaveEnabled && autoSaveStatus === "saved"  && lastAutoSaveTime
                  ? `✅ ${lastAutoSaveTime.toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" })} बजे saved`
                  : autoSaveEnabled && autoSaveStatus === "saved" ? "✅ Saved" : ""}
                {autoSaveEnabled && autoSaveStatus === "error"  && "❌ Save failed!"}
              </span>
            </div>
          </div>

          {/* User info + Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "rgba(255,255,255,0.15)",
                padding: "5px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                color: "white",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: "14px" }}>👤</span>
              {loggedInUser}
            </div>
            <button
              onClick={onLogout}
              style={{
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
      <div
        style={{
          backgroundColor: "#e5e7eb",
          padding: "10px 16px",
          borderBottom: "2px solid #9ca3af",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: "white",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              fontSize: "24px",
              flexShrink: 0,
            }}
          >
            📰
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#b91c1c",
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
                width: "100%",
                marginBottom: "4px",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  fontSize: "12px",
                  padding: "3px 6px",
                  border: "1px solid #9ca3af",
                  borderRadius: "4px",
                }}
              />
              {selectedDate && (
                <p style={{ fontSize: "12px", margin: "0", color: "#111827" }}>
                  {formatHindiDate(selectedDate)}
                </p>
              )}
              <button
                onClick={getDataByDate}
                style={{
                  backgroundColor: "#3fa850",
                  color: "white",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                GET DATA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          backgroundColor: "#fef3c7",
          padding: "12px",
          minWidth: 0,
        }}
      >
        <div style={{ maxWidth: `${PAGE_W + 80}px`, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "12px",
              overflowX: "auto",
              paddingBottom: "8px",
            }}
          >
            {pages.map((page) => (
              <div key={page.id} style={{ position: "relative" }}>
                <button
                  onClick={() => setCurrentPage(page.id)}
                  style={{
                    padding: "7px 18px",
                    borderRadius: "6px",
                    border:
                      currentPage === page.id
                        ? "2px solid #0f766e"
                        : "2px solid #9ca3af",
                    backgroundColor:
                      currentPage === page.id ? "#d1fae5" : "white",
                    cursor: "pointer",
                    fontWeight: currentPage === page.id ? "bold" : "normal",
                    fontSize: "13px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {page.id} Page
                </button>
                {pages.length > 1 && (
                  <button
                    onClick={() => setPageDeleteConfirm(page.id)}
                    style={{
                      position: "absolute",
                      top: "-0",
                      right: "-2px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addNewPage}
              style={{
                padding: "7px 18px",
                borderRadius: "6px",
                border: "2px dashed #0f766e",
                backgroundColor: "white",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "13px",
                color: "#0f766e",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Plus style={{ width: "14px", height: "14px" }} /> NEW
            </button>
          </div>

          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <span
              style={{
                backgroundColor: "#4b5563",
                color: "white",
                padding: "5px 16px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {currentPage} Page — 25cm × 37cm
            </span>
          </div>

          <div
            style={{
              backgroundColor: "#888",
              padding: "20px",
              marginBottom: "12px",
              overflow: "auto",
            }}
          >
            <div
              id={`preview-page-${currentPage}`}
              style={{
                backgroundColor: "white",
                width: `${PAGE_W}px`,
                height: editingCell ? "auto" : `${PAGE_H}px`,
                margin: "0 auto",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                position: "relative",
                boxSizing: "border-box",
                overflow: editingCell ? "visible" : "hidden",
              }}
            >
              {/* Header */}
              {selectedHeaderTemplate &&
                (currentPage === 1 ? (
                  <NewspaperHeader1
                    channelName={channelName}
                    selectedDate={selectedDate}
                    hc={headerColors}
                    headerBgImage={headerBgImage}
                    regVarsh={regVarsh}
                    regAnk={regAnk}
                    regKulPej={regKulPej}
                    regKimat={regKimat}
                  />
                ) : (
                  <NewspaperHeader2
                    channelName={channelName}
                    selectedDate={selectedDate}
                    pageNum={currentPage}
                    hc={headerColors}
                  />
                ))}

              <NewspaperSubHeader
                templateId={selectedSubHeaderTemplate}
                customColors={subHeaderColors}
                customText={subHeaderText}
                bgImage={subHeaderBgImage}
                bold={subHeaderBold}
                fontSize={subHeaderFontSize}
              />

              {currentPageData?.rows.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "350px",
                    border: "3px dashed #d1d5db",
                    borderRadius: "12px",
                    margin: "20px",
                    backgroundColor: "#f9fafb",
                  }}
                >
                  <div style={{ textAlign: "center", color: "#9ca3af" }}>
                    <Plus
                      style={{
                        width: "48px",
                        height: "48px",
                        margin: "0 auto 12px",
                        opacity: 0.5,
                      }}
                    />
                    <p style={{ fontSize: "15px", fontWeight: 600, margin: 0 }}>
                      Click "+ ADD ROW" to add content
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  {currentPageData?.rows.map((row, rowIdx) => (
                    <div
                      key={row.id}
                      style={{
                        position: "relative",
                        paddingTop: showDesignLayout ? "0" : "0",
                      }}
                    >
                      {showDesignLayout && (
                        <div
                          data-nopdf="true"
                          style={{
                            padding: "5px 10px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "8px",
                            fontSize: "12px",
                            zIndex: 20,
                          }}
                        >
                          <button
                            onClick={() => deleteRow(row.id)}
                            style={{
                              backgroundColor: "#dc2626",
                              padding: "3px 8px",
                              borderRadius: "4px",
                              border: "none",
                              cursor: "pointer",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {" "}
                            <Trash2
                              style={{ width: "15px", height: "15px" }}
                            />{" "}
                            <span style={{ fontWeight: 600 }}>
                              &nbsp; Row {rowIdx + 1}
                            </span>
                          </button>
                        </div>
                      )}
                      <div
                        style={{
                          display: "grid",
                          gap: "0px",
                          gridTemplateColumns: row.layout.cols
                            .map((c) => `${(c / 12) * 100}%`)
                            .join(" "),
                        }}
                      >
                        {row.cells.map((cell, cellIdx) => (
                          <div
                            key={cell.id}
                            style={{
                              position: "relative",
                              border: cell.isAdvertisement
                                ? "2px solid #000000"
                                : "none",
                              boxSizing: "border-box",
                            }}
                          >
                            {editingCell === cell.id ? (
                              <button
                                data-nopdf="true"
                                onClick={() => setEditingCell(null)}
                                style={{
                                  position: "absolute",
                                  top: "4px",
                                  right: "4px",
                                  backgroundColor: "#10b981",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  padding: "4px 10px",
                                  fontSize: "11px",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                  zIndex: 10,
                                }}
                              >
                                Done
                              </button>
                            ) : (
                              <button
                                data-nopdf="true"
                                onClick={() => setEditingCell(cell.id)}
                                style={{
                                  position: "absolute",
                                  top: "4px",
                                  right: "4px",
                                  backgroundColor: "#0f766e",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  padding: "4px 8px",
                                  fontSize: "11px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  fontWeight: "bold",
                                  zIndex: 10,
                                }}
                              >
                                <Edit2
                                  style={{ width: "11px", height: "11px" }}
                                />{" "}
                                Edit
                              </button>
                            )}

                            {editingCell === cell.id && (
                              <div
                                style={{
                                  padding: "8px",
                                  backgroundColor: "#f8f9fa",
                                  borderBottom: "1px solid #e5e7eb",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "6px",
                                    marginBottom: "6px",
                                    marginTop: "24px",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "4px",
                                      alignItems: "center",
                                    }}
                                  >
                                    <label
                                      style={{
                                        fontSize: "10px",
                                        fontWeight: 600,
                                      }}
                                    >
                                      BG:
                                    </label>
                                    <input
                                      type="color"
                                      value={cell.color || "#ffffff"}
                                      onChange={(e) =>
                                        updateCellProperty(
                                          row.id,
                                          cell.id,
                                          "color",
                                          e.target.value,
                                        )
                                      }
                                      style={{
                                        width: "36px",
                                        height: "28px",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "3px",
                                        cursor: "pointer",
                                      }}
                                    />
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "4px",
                                      alignItems: "center",
                                    }}
                                  >
                                    <label
                                      style={{
                                        fontSize: "10px",
                                        fontWeight: 600,
                                      }}
                                    >
                                      Text:
                                    </label>
                                    <input
                                      type="color"
                                      value={cell.textColor || "#000000"}
                                      onChange={(e) =>
                                        updateCellProperty(
                                          row.id,
                                          cell.id,
                                          "textColor",
                                          e.target.value,
                                        )
                                      }
                                      style={{
                                        width: "36px",
                                        height: "28px",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "3px",
                                        cursor: "pointer",
                                      }}
                                    />
                                  </div>
                                  <select
                                    value={cell.fontSize || "medium"}
                                    onChange={(e) =>
                                      updateCellProperty(
                                        row.id,
                                        cell.id,
                                        "fontSize",
                                        e.target.value,
                                      )
                                    }
                                    style={{
                                      padding: "4px",
                                      fontSize: "10px",
                                      border: "1px solid #e5e7eb",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    <option value="small">T-S</option>
                                    <option value="medium">T-M</option>
                                    <option value="large">T-L</option>
                                    <option value="xlarge">T-XL</option>
                                  </select>
                                  <select
                                    value={cell.columnCount || 1}
                                    onChange={(e) =>
                                      updateCellProperty(
                                        row.id,
                                        cell.id,
                                        "columnCount",
                                        parseInt(e.target.value),
                                      )
                                    }
                                    style={{
                                      padding: "4px",
                                      fontSize: "10px",
                                      border: "1px solid #e5e7eb",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    <option value="1">1 Col</option>
                                    <option value="2">2 Cols</option>
                                    <option value="3">3 Cols</option>
                                    <option value="4">4 Cols</option>
                                    <option value="5">5 Cols</option>
                                    <option value="6">6 Cols</option>
                                  </select>
                                  <select
                                    value={
                                      cell.fontFamily ||
                                      "'Bhaskar', 'Noto Serif Devanagari', serif"
                                    }
                                    onChange={(e) =>
                                      updateCellProperty(
                                        row.id,
                                        cell.id,
                                        "fontFamily",
                                        e.target.value,
                                      )
                                    }
                                    style={{
                                      padding: "4px",
                                      fontSize: "10px",
                                      border: "1px solid #e5e7eb",
                                      borderRadius: "4px",
                                    }}
                                    title="Body/Description Font"
                                  >
                                    <option value="'Noto Serif Devanagari', serif">
                                      Noto Serif Devanagari
                                    </option>
                                    <option value="'Hind', sans-serif">
                                      Hind Regular
                                    </option>
                                    <option value="'Hind Bold', sans-serif">
                                      Hind Bold
                                    </option>
                                    <option value="'Bhaskar', 'Noto Serif Devanagari', serif">
                                      Bhaskar
                                    </option>
                                    <option value="'Noto Sans Devanagari', sans-serif">
                                      Noto Sans (Bold Support)
                                    </option>
                                    <option value="'Baloo 2', cursive">
                                      Baloo 2 (Bold Display)
                                    </option>
                                    <option value="'VesperLibreHeavy', serif">
                                      Vesper Libre Heavy
                                    </option>
                                  </select>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "6px",
                                    marginBottom: "6px",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: 600,
                                      alignSelf: "center",
                                    }}
                                  >
                                    H-Align:
                                  </span>
                                  {["left", "center", "right"].map((a) => (
                                    <button
                                      key={a}
                                      onClick={() =>
                                        updateCellProperty(
                                          row.id,
                                          cell.id,
                                          "headingAlign",
                                          a,
                                        )
                                      }
                                      style={{
                                        padding: "3px 7px",
                                        fontSize: "9px",
                                        border:
                                          cell.headingAlign === a
                                            ? "2px solid #0f766e"
                                            : "1px solid #e5e7eb",
                                        borderRadius: "3px",
                                        backgroundColor:
                                          cell.headingAlign === a
                                            ? "#d1fae5"
                                            : "white",
                                        cursor: "pointer",
                                      }}
                                    >
                                      {a[0].toUpperCase() + a.slice(1)}
                                    </button>
                                  ))}
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: 600,
                                      alignSelf: "center",
                                      marginLeft: "8px",
                                    }}
                                  >
                                    T-Align:
                                  </span>
                                  {[
                                    {
                                      a: "left",
                                      icon: (
                                        <AlignLeft
                                          style={{
                                            width: "12px",
                                            height: "12px",
                                          }}
                                        />
                                      ),
                                    },
                                    {
                                      a: "center",
                                      icon: (
                                        <AlignCenter
                                          style={{
                                            width: "12px",
                                            height: "12px",
                                          }}
                                        />
                                      ),
                                    },
                                    {
                                      a: "right",
                                      icon: (
                                        <AlignRight
                                          style={{
                                            width: "12px",
                                            height: "12px",
                                          }}
                                        />
                                      ),
                                    },
                                    {
                                      a: "justify",
                                      icon: (
                                        <AlignJustify
                                          style={{
                                            width: "12px",
                                            height: "12px",
                                          }}
                                        />
                                      ),
                                    },
                                  ].map(({ a, icon }) => (
                                    <button
                                      key={a}
                                      onClick={() =>
                                        updateCellProperty(
                                          row.id,
                                          cell.id,
                                          "textAlign",
                                          a,
                                        )
                                      }
                                      style={{
                                        padding: "4px 5px",
                                        border:
                                          cell.textAlign === a
                                            ? "2px solid #0f766e"
                                            : "1px solid #e5e7eb",
                                        borderRadius: "3px",
                                        backgroundColor:
                                          cell.textAlign === a
                                            ? "#d1fae5"
                                            : "white",
                                        cursor: "pointer",
                                      }}
                                    >
                                      {icon}
                                    </button>
                                  ))}
                                  <button
                                    onClick={() =>
                                      updateCellProperty(
                                        row.id,
                                        cell.id,
                                        "isAdvertisement",
                                        !cell.isAdvertisement,
                                      )
                                    }
                                    style={{
                                      padding: "4px 8px",
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                      border: cell.isAdvertisement
                                        ? "2px solid #dc2626"
                                        : "1px solid #e5e7eb",
                                      borderRadius: "4px",
                                      backgroundColor: cell.isAdvertisement
                                        ? "#fee2e2"
                                        : "white",
                                      color: cell.isAdvertisement
                                        ? "#dc2626"
                                        : "#6b7280",
                                      cursor: "pointer",
                                    }}
                                    title="विज्ञापन है तो ON करें"
                                  >
                                    📢{" "}
                                    {cell.isAdvertisement
                                      ? "विज्ञापन ✓"
                                      : "विज्ञापन"}
                                  </button>

                                  <label
                                    style={{
                                      backgroundColor:
                                        (cell.images?.length || 0) >= 2
                                          ? "#9ca3af"
                                          : "#6366f1",
                                      color: "white",
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      cursor:
                                        (cell.images?.length || 0) >= 2
                                          ? "not-allowed"
                                          : "pointer",
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "3px",
                                    }}
                                  >
                                    <ImagePlus
                                      style={{ width: "12px", height: "12px" }}
                                    />{" "}
                                    IMG ({cell.images?.length || 0}/2)
                                    <input
                                      type="file"
                                      accept="image/*"
                                      disabled={(cell.images?.length || 0) >= 2}
                                      onChange={(e) =>
                                        handleMultipleImageUpload(
                                          row.id,
                                          cell.id,
                                          e,
                                        )
                                      }
                                      style={{ display: "none" }}
                                    />
                                  </label>
                                  <button
                                    onClick={() => fetchNews(row.id, cell.id)}
                                    style={{
                                      backgroundColor: "#9e6709",
                                      color: "white",
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      border: "none",
                                      cursor: "pointer",
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    📰 News Add
                                  </button>
                                </div>

                                {/* Image settings */}
                                {cell.images && cell.images.length > 0 && (
                                  <div
                                    style={{
                                      marginBottom: "6px",
                                      padding: "6px",
                                      backgroundColor: "#f3f4f6",
                                      borderRadius: "4px",
                                      border: "1px solid #e5e7eb",
                                    }}
                                  >
                                    {cell.images.map((img, imgIdx) => (
                                      <div
                                        key={imgIdx}
                                        style={{
                                          display: "flex",
                                          gap: "4px",
                                          alignItems: "center",
                                          marginBottom: "4px",
                                          flexWrap: "wrap",
                                          padding: "4px",
                                          backgroundColor: "white",
                                          borderRadius: "3px",
                                          border: "1px solid #e5e7eb",
                                        }}
                                      >
                                        <img
                                          src={img.src}
                                          alt=""
                                          style={{
                                            width: "32px",
                                            height: "32px",
                                            objectFit: "cover",
                                            borderRadius: "3px",
                                            flexShrink: 0,
                                          }}
                                        />

                                        {/* Align */}
                                        <select
                                          value={img.align || "left"}
                                          onChange={(e) =>
                                            updateImageProp(
                                              row.id,
                                              cell.id,
                                              imgIdx,
                                              "align",
                                              e.target.value,
                                            )
                                          }
                                          style={{
                                            padding: "2px",
                                            fontSize: "9px",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "3px",
                                            minWidth: "55px",
                                          }}
                                        >
                                          <option value="left">← Left</option>
                                          <option value="right">Right →</option>
                                          <option value="center">Center</option>
                                        </select>

                                        {/* Col Span — how many columns image should span */}
                                        <select
                                          value={img.colSpan || 0}
                                          onChange={(e) =>
                                            updateImageProp(
                                              row.id,
                                              cell.id,
                                              imgIdx,
                                              "colSpan",
                                              parseInt(e.target.value),
                                            )
                                          }
                                          style={{
                                            padding: "2px",
                                            fontSize: "9px",
                                            border: "1px solid #3b82f6",
                                            borderRadius: "3px",
                                            minWidth: "60px",
                                            backgroundColor: "#eff6ff",
                                          }}
                                          title="Image कितने columns में फैले"
                                        >
                                          <option value="0">PX Width</option>
                                          {Array.from(
                                            { length: cell.columnCount || 1 },
                                            (_, i) => i + 1,
                                          ).map((n) => (
                                            <option key={n} value={n}>
                                              {n} Col{n > 1 ? "s" : ""}
                                            </option>
                                          ))}
                                        </select>

                                        {/* Width (px) — only if colSpan = 0 */}
                                        {(!img.colSpan ||
                                          img.colSpan === 0) && (
                                          <>
                                            <label
                                              style={{
                                                fontSize: "9px",
                                                color: "#6b7280",
                                              }}
                                            >
                                              W:
                                            </label>
                                            <input
                                              type="number"
                                              value={img.width || ""}
                                              onChange={(e) =>
                                                updateImageProp(
                                                  row.id,
                                                  cell.id,
                                                  imgIdx,
                                                  "width",
                                                  parseInt(e.target.value) ||
                                                    "",
                                                )
                                              }
                                              style={{
                                                width: "44px",
                                                padding: "2px",
                                                fontSize: "9px",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "3px",
                                              }}
                                            />
                                          </>
                                        )}
                                        {/* Height */}
                                        <label
                                          style={{
                                            fontSize: "9px",
                                            color: "#6b7280",
                                          }}
                                        >
                                          H:
                                        </label>
                                        <input
                                          type="number"
                                          value={img.height || ""}
                                          onChange={(e) =>
                                            updateImageProp(
                                              row.id,
                                              cell.id,
                                              imgIdx,
                                              "height",
                                              parseInt(e.target.value) || "",
                                            )
                                          }
                                          style={{
                                            width: "44px",
                                            padding: "2px",
                                            fontSize: "9px",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "3px",
                                          }}
                                        />

                                        <button
                                          onClick={() =>
                                            removeImage(row.id, cell.id, imgIdx)
                                          }
                                          style={{
                                            backgroundColor: "#ef4444",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "3px",
                                            padding: "3px 6px",
                                            cursor: "pointer",
                                            fontSize: "10px",
                                            flexShrink: 0,
                                          }}
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {editingCell === cell.id ? (
                              <div style={{ padding: "8px" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "6px",
                                    marginBottom: "6px",
                                    padding: "5px",
                                    backgroundColor: "#fff3cd",
                                    borderRadius: "4px",
                                    border: "1px solid #ffc107",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: 700,
                                      alignSelf: "center",
                                      color: "#856404",
                                    }}
                                  >
                                    Heading:
                                  </span>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "3px",
                                      alignItems: "center",
                                    }}
                                  >
                                    <label
                                      style={{
                                        fontSize: "9px",
                                        color: "#856404",
                                      }}
                                    >
                                      BG:
                                    </label>
                                    <input
                                      type="color"
                                      value={
                                        cell.headingBg &&
                                        cell.headingBg !== "transparent"
                                          ? cell.headingBg
                                          : "#ffffff"
                                      }
                                      onChange={(e) =>
                                        updateCellProperty(
                                          row.id,
                                          cell.id,
                                          "headingBg",
                                          e.target.value,
                                        )
                                      }
                                      style={{
                                        width: "28px",
                                        height: "22px",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "3px",
                                        cursor: "pointer",
                                      }}
                                    />
                                    <button
                                      onClick={() =>
                                        updateCellProperty(
                                          row.id,
                                          cell.id,
                                          "headingBg",
                                          "transparent",
                                        )
                                      }
                                      style={{
                                        fontSize: "9px",
                                        padding: "2px 5px",
                                        border: "1px solid #ccc",
                                        borderRadius: "3px",
                                        cursor: "pointer",
                                        backgroundColor:
                                          cell.headingBg === "transparent" ||
                                          !cell.headingBg
                                            ? "#e5e7eb"
                                            : "white",
                                      }}
                                    >
                                      None
                                    </button>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "3px",
                                      alignItems: "center",
                                    }}
                                  >
                                    <label
                                      style={{
                                        fontSize: "9px",
                                        color: "#856404",
                                      }}
                                    >
                                      Color:
                                    </label>
                                    <input
                                      type="color"
                                      value={cell.headingColor || "#000000"}
                                      onChange={(e) =>
                                        updateCellProperty(
                                          row.id,
                                          cell.id,
                                          "headingColor",
                                          e.target.value,
                                        )
                                      }
                                      style={{
                                        width: "28px",
                                        height: "22px",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "3px",
                                        cursor: "pointer",
                                      }}
                                    />
                                  </div>
                                  <select
                                    value={cell.headingSize || "large"}
                                    onChange={(e) =>
                                      updateCellProperty(
                                        row.id,
                                        cell.id,
                                        "headingSize",
                                        e.target.value,
                                      )
                                    }
                                    style={{
                                      padding: "2px",
                                      fontSize: "9px",
                                      border: "1px solid #e5e7eb",
                                      borderRadius: "3px",
                                    }}
                                  >
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                    <option value="xlarge">XLarge</option>
                                    <option value="xxlarge">XXLarge</option>
                                    <option value="xxxlarge">XXXLarge</option>
                                  </select>
                                  <select
                                    value={
                                      cell.headingFontFamily ||
                                      cell.fontFamily ||
                                      "'Bhaskar', 'Noto Serif Devanagari', serif"
                                    }
                                    onChange={(e) =>
                                      updateCellProperty(
                                        row.id,
                                        cell.id,
                                        "headingFontFamily",
                                        e.target.value,
                                      )
                                    }
                                    style={{
                                      padding: "2px",
                                      fontSize: "9px",
                                      border: "1px solid #ffc107",
                                      borderRadius: "3px",
                                      backgroundColor: "#fffde7",
                                    }}
                                    title="Heading Font Family"
                                  >
                                    <option value="'Noto Serif Devanagari', serif">
                                      Noto Serif Devanagari
                                    </option>
                                    <option value="'Hind', sans-serif">
                                      Hind Regular
                                    </option>
                                    <option value="'Hind Bold', sans-serif">
                                      Hind Bold
                                    </option>
                                    <option value="'Bhaskar', 'Noto Serif Devanagari', serif">
                                      Bhaskar
                                    </option>
                                    <option value="'Noto Sans Devanagari', sans-serif">
                                      Noto Sans (Bold Support)
                                    </option>
                                    <option value="'Baloo 2', cursive">
                                      Baloo 2 (Bold Display)
                                    </option>
                                    <option value="'VesperLibreHeavy', serif">
                                      Vesper Libre Heavy
                                    </option>
                                  </select>
                                  {/* ── Heading Outline ── */}
                                  <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
                                    <label style={{ fontSize: "9px", color: "#856404", fontWeight: 700 }}>
                                      Outline:
                                    </label>
                                    <input
                                      type="color"
                                      title="Outline Color"
                                      value={cell.headingOutlineColor || "#000000"}
                                      onChange={(e) =>
                                        updateCellProperty(row.id, cell.id, "headingOutlineColor", e.target.value)
                                      }
                                      style={{ width: "28px", height: "22px", border: "1px solid #e5e7eb", borderRadius: "3px", cursor: "pointer" }}
                                    />
                                    <select
                                      value={cell.headingOutlineWidth || "0"}
                                      onChange={(e) =>
                                        updateCellProperty(row.id, cell.id, "headingOutlineWidth", e.target.value)
                                      }
                                      style={{ padding: "2px", fontSize: "9px", border: "1px solid #ffc107", borderRadius: "3px", backgroundColor: "#fffde7" }}
                                      title="Outline Width"
                                    >
                                      <option value="0">None</option>
                                      <option value="0.5">Thin</option>
                                      <option value="1">1px</option>
                                      <option value="1.5">1.5px</option>
                                      <option value="2">2px</option>
                                      <option value="3">3px</option>
                                      <option value="4">4px</option>
                                    </select>
                                  </div>
                                </div>
                                <div style={{ marginBottom: "6px" }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "6px",
                                      alignItems: "center",
                                      flexWrap: "wrap",
                                      padding: "4px 6px",
                                      backgroundColor: "#fff3cd",
                                      border: "2px solid #ffc107",
                                      borderBottom: "none",
                                      borderRadius: "4px 4px 0 0",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "10px",
                                        fontWeight: 700,
                                        color: "#856404",
                                      }}
                                    >
                                      H:
                                    </span>
                                    {[
                                      ["B", "bold"],
                                      ["I", "italic"],
                                      ["U", "underline"],
                                    ].map(([lbl, cmd]) => (
                                      <button
                                        key={cmd}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          const el = document.getElementById(
                                            `heading-editor-${cell.id}`,
                                          );
                                          if (el) {
                                            el.focus();
                                            document.execCommand(cmd);
                                          }
                                        }}
                                        style={{
                                          padding: "2px 7px",
                                          fontWeight:
                                            lbl === "B" ? "bold" : "normal",
                                          fontStyle:
                                            lbl === "I" ? "italic" : "normal",
                                          textDecoration:
                                            lbl === "U" ? "underline" : "none",
                                          border: "1px solid #d1d5db",
                                          borderRadius: "3px",
                                          cursor: "pointer",
                                          backgroundColor: "white",
                                          fontSize: "11px",
                                        }}
                                      >
                                        {lbl}
                                      </button>
                                    ))}
                                    <input
                                      type="color"
                                      title="Selected Text Color"
                                      defaultValue="#000000"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                      }}
                                      onChange={(e) => {
                                        const el = document.getElementById(
                                          `heading-editor-${cell.id}`,
                                        );
                                        if (el) {
                                          el.focus();
                                          document.execCommand(
                                            "foreColor",
                                            false,
                                            e.target.value,
                                          );
                                        }
                                      }}
                                      style={{
                                        width: "28px",
                                        height: "22px",
                                        padding: "1px",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "3px",
                                        cursor: "pointer",
                                      }}
                                    />
                                    <span
                                      style={{
                                        fontSize: "9px",
                                        color: "#856404",
                                      }}
                                    >
                                      text select करें फिर format
                                    </span>
                                  </div>
                                  <RichTextEditor
                                    id={`heading-editor-${cell.id}`}
                                    value={cell.heading || ""}
                                    onChange={(html) =>
                                      updateCellProperty(
                                        row.id,
                                        cell.id,
                                        "heading",
                                        html,
                                      )
                                    }
                                    style={{
                                      width: "100%",
                                      minHeight: "42px",
                                      padding: "8px",
                                      border: "2px solid #ffc107",
                                      borderRadius: "0 0 4px 4px",
                                      fontSize: getHeadingSize(
                                        cell.headingSize || "large",
                                      ),
                                      fontWeight: "bold",
                                      boxSizing: "border-box",
                                      backgroundColor:
                                        cell.headingBg &&
                                        cell.headingBg !== "transparent"
                                          ? cell.headingBg
                                          : "white",
                                      color: cell.headingColor || "#000000",
                                      textAlign: cell.headingAlign || "center",
                                      outline: "none",
                                      lineHeight: "1.3",
                                      fontFamily:
                                        cell.headingFontFamily ||
                                        cell.fontFamily ||
                                        "'Bhaskar', 'Noto Serif Devanagari', serif",
                                    }}
                                  />
                                </div>

                                <hr />

                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "6px",
                                    marginBottom: "6px",
                                    padding: "5px",
                                    backgroundColor: "#e8f4fd",
                                    borderRadius: "4px",
                                    border: "1px solid #bee3f8",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: 700,
                                      alignSelf: "center",
                                      color: "#2b6cb0",
                                    }}
                                  >
                                    Sub-Heading:
                                  </span>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "3px",
                                      alignItems: "center",
                                    }}
                                  >
                                    <label
                                      style={{
                                        fontSize: "9px",
                                        color: "#2b6cb0",
                                      }}
                                    >
                                      BG:
                                    </label>
                                    <input
                                      type="color"
                                      value={
                                        cell.subHeadingBg &&
                                        cell.subHeadingBg !== "transparent"
                                          ? cell.subHeadingBg
                                          : "#ffffff"
                                      }
                                      onChange={(e) =>
                                        updateCellProperty(
                                          row.id,
                                          cell.id,
                                          "subHeadingBg",
                                          e.target.value,
                                        )
                                      }
                                      style={{
                                        width: "28px",
                                        height: "22px",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "3px",
                                        cursor: "pointer",
                                      }}
                                    />
                                    <button
                                      onClick={() =>
                                        updateCellProperty(
                                          row.id,
                                          cell.id,
                                          "subHeadingBg",
                                          "transparent",
                                        )
                                      }
                                      style={{
                                        fontSize: "9px",
                                        padding: "2px 5px",
                                        border: "1px solid #ccc",
                                        borderRadius: "3px",
                                        cursor: "pointer",
                                        backgroundColor:
                                          cell.subHeadingBg === "transparent" ||
                                          !cell.subHeadingBg
                                            ? "#e5e7eb"
                                            : "white",
                                      }}
                                    >
                                      None
                                    </button>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "3px",
                                      alignItems: "center",
                                    }}
                                  >
                                    <label
                                      style={{
                                        fontSize: "9px",
                                        color: "#2b6cb0",
                                      }}
                                    >
                                      Color:
                                    </label>
                                    <input
                                      type="color"
                                      value={cell.subHeadingColor || "#444444"}
                                      onChange={(e) =>
                                        updateCellProperty(
                                          row.id,
                                          cell.id,
                                          "subHeadingColor",
                                          e.target.value,
                                        )
                                      }
                                      style={{
                                        width: "28px",
                                        height: "22px",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "3px",
                                        cursor: "pointer",
                                      }}
                                    />
                                  </div>
                                  <select
                                    value={cell.subHeadingSize || "medium"}
                                    onChange={(e) =>
                                      updateCellProperty(
                                        row.id,
                                        cell.id,
                                        "subHeadingSize",
                                        e.target.value,
                                      )
                                    }
                                    style={{
                                      padding: "2px",
                                      fontSize: "9px",
                                      border: "1px solid #e5e7eb",
                                      borderRadius: "3px",
                                    }}
                                  >
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                    <option value="xlarge">XLarge</option>
                                    <option value="xxlarge">XXLarge</option>
                                    <option value="xxxlarge">XXXLarge</option>
                                  </select>

                                  <select
                                    value={
                                      cell.subHeadingFontFamily ||
                                      cell.fontFamily ||
                                      "'Bhaskar', 'Noto Serif Devanagari', serif"
                                    }
                                    onChange={(e) =>
                                      updateCellProperty(
                                        row.id,
                                        cell.id,
                                        "subHeadingFontFamily",
                                        e.target.value,
                                      )
                                    }
                                    style={{
                                      padding: "2px",
                                      fontSize: "9px",
                                      border: "1px solid #bee3f8",
                                      borderRadius: "3px",
                                      backgroundColor: "#e8f4fd",
                                    }}
                                    title="Sub-Heading Font Family"
                                  >
                                    <option value="'Noto Serif Devanagari', serif">
                                      Noto Serif Devanagari
                                    </option>
                                    <option value="'Hind', sans-serif">
                                      Hind Regular
                                    </option>
                                    <option value="'Hind Bold', sans-serif">
                                      Hind Bold
                                    </option>
                                    <option value="'Bhaskar', 'Noto Serif Devanagari', serif">
                                      Bhaskar
                                    </option>
                                    <option value="'Noto Sans Devanagari', sans-serif">
                                      Noto Sans (Bold Support)
                                    </option>
                                    <option value="'Baloo 2', cursive">
                                      Baloo 2 (Bold Display)
                                    </option>
                                    <option value="'VesperLibreHeavy', serif">
                                      Vesper Libre Heavy
                                    </option>
                                  </select>
                                  {/* ── Sub-Heading Outline ── */}
                                  <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
                                    <label style={{ fontSize: "9px", color: "#2b6cb0", fontWeight: 700 }}>
                                      Outline:
                                    </label>
                                    <input
                                      type="color"
                                      title="Sub-Heading Outline Color"
                                      value={cell.subHeadingOutlineColor || "#000000"}
                                      onChange={(e) =>
                                        updateCellProperty(row.id, cell.id, "subHeadingOutlineColor", e.target.value)
                                      }
                                      style={{ width: "28px", height: "22px", border: "1px solid #e5e7eb", borderRadius: "3px", cursor: "pointer" }}
                                    />
                                    <select
                                      value={cell.subHeadingOutlineWidth || "0"}
                                      onChange={(e) =>
                                        updateCellProperty(row.id, cell.id, "subHeadingOutlineWidth", e.target.value)
                                      }
                                      style={{ padding: "2px", fontSize: "9px", border: "1px solid #bee3f8", borderRadius: "3px", backgroundColor: "#e8f4fd" }}
                                      title="Sub-Heading Outline Width"
                                    >
                                      <option value="0">None</option>
                                      <option value="0.5">Thin</option>
                                      <option value="1">1px</option>
                                      <option value="1.5">1.5px</option>
                                      <option value="2">2px</option>
                                      <option value="3">3px</option>
                                      <option value="4">4px</option>
                                    </select>
                                  </div>
                                </div>

                                <div style={{ marginBottom: "6px" }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "6px",
                                      alignItems: "center",
                                      flexWrap: "wrap",
                                      padding: "4px 6px",
                                      backgroundColor: "#e8f4fd",
                                      border: "2px solid #bee3f8",
                                      borderBottom: "none",
                                      borderRadius: "4px 4px 0 0",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "10px",
                                        fontWeight: 700,
                                        color: "#2b6cb0",
                                      }}
                                    >
                                      Sub-H:
                                    </span>
                                    {[
                                      ["B", "bold"],
                                      ["I", "italic"],
                                      ["U", "underline"],
                                    ].map(([lbl, cmd]) => (
                                      <button
                                        key={cmd}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          const el = document.getElementById(
                                            `subheading-editor-${cell.id}`,
                                          );
                                          if (el) {
                                            el.focus();
                                            document.execCommand(cmd);
                                          }
                                        }}
                                        style={{
                                          padding: "2px 7px",
                                          fontWeight:
                                            lbl === "B" ? "bold" : "normal",
                                          fontStyle:
                                            lbl === "I" ? "italic" : "normal",
                                          textDecoration:
                                            lbl === "U" ? "underline" : "none",
                                          border: "1px solid #d1d5db",
                                          borderRadius: "3px",
                                          cursor: "pointer",
                                          backgroundColor: "white",
                                          fontSize: "11px",
                                        }}
                                      >
                                        {lbl}
                                      </button>
                                    ))}
                                    <input
                                      type="color"
                                      title="Selected Text Color"
                                      defaultValue="#000000"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                      }}
                                      onChange={(e) => {
                                        const el = document.getElementById(
                                          `subheading-editor-${cell.id}`,
                                        );
                                        if (el) {
                                          el.focus();
                                          document.execCommand(
                                            "foreColor",
                                            false,
                                            e.target.value,
                                          );
                                        }
                                      }}
                                      style={{
                                        width: "28px",
                                        height: "22px",
                                        padding: "1px",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "3px",
                                        cursor: "pointer",
                                      }}
                                    />
                                    <span
                                      style={{
                                        fontSize: "9px",
                                        color: "#2b6cb0",
                                      }}
                                    >
                                      text select करें फिर format
                                    </span>
                                  </div>
                                  <RichTextEditor
                                    id={`subheading-editor-${cell.id}`}
                                    value={cell.subHeading || ""}
                                    onChange={(html) =>
                                      updateCellProperty(
                                        row.id,
                                        cell.id,
                                        "subHeading",
                                        html,
                                      )
                                    }
                                    style={{
                                      width: "100%",
                                      minHeight: "34px",
                                      padding: "6px 8px",
                                      border: "2px solid #bee3f8",
                                      borderRadius: "0 0 4px 4px",
                                      fontSize: getSubHeadingSize(
                                        cell.subHeadingSize || "medium",
                                      ),
                                      fontWeight: "600",
                                      boxSizing: "border-box",
                                      backgroundColor:
                                        cell.subHeadingBg &&
                                        cell.subHeadingBg !== "transparent"
                                          ? cell.subHeadingBg
                                          : "#fffbeb",
                                      color: cell.subHeadingColor || "#444444",
                                      textAlign: cell.headingAlign || "center",
                                      outline: "none",
                                      lineHeight: "1.3",
                                      fontFamily:
                                        cell.subHeadingFontFamily ||
                                        cell.fontFamily ||
                                        "'Bhaskar', 'Noto Serif Devanagari', serif",
                                    }}
                                  />
                                </div>
                                <hr />

                                <div
                                  style={{
                                    display: "flex",
                                    gap: "3px",
                                    flexWrap: "wrap",
                                    padding: "5px 6px",
                                    backgroundColor: "#f3f4f6",
                                    borderRadius: "4px 4px 0 0",
                                    border: "1px solid #e5e7eb",
                                    borderBottom: "none",
                                  }}
                                >
                                  {[
                                    ["B", "bold"],
                                    ["I", "italic"],
                                    ["U", "underline"],
                                  ].map(([lbl, cmd]) => (
                                    <button
                                      key={cmd}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        document.execCommand(cmd);
                                      }}
                                      style={{
                                        padding: "3px 7px",
                                        fontWeight:
                                          lbl === "B" ? "bold" : "normal",
                                        fontStyle:
                                          lbl === "I" ? "italic" : "normal",
                                        textDecoration:
                                          lbl === "U" ? "underline" : "none",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "3px",
                                        cursor: "pointer",
                                        backgroundColor: "white",
                                        fontSize: "11px",
                                      }}
                                    >
                                      {lbl}
                                    </button>
                                  ))}
                                  <select
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      if (e.target.value)
                                        document.execCommand(
                                          "fontSize",
                                          false,
                                          e.target.value,
                                        );
                                      e.target.value = "";
                                    }}
                                    style={{
                                      padding: "2px",
                                      fontSize: "10px",
                                      border: "1px solid #d1d5db",
                                      borderRadius: "3px",
                                    }}
                                  >
                                    <option value="">Size</option>
                                    {[
                                      ["1", "XS"],
                                      ["2", "S"],
                                      ["3", "M"],
                                      ["4", "L"],
                                      ["5", "XL"],
                                      ["6", "XXL"],
                                    ].map(([v, l]) => (
                                      <option key={v} value={v}>
                                        {l}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="color"
                                    title="Text Color"
                                    onInput={(e) =>
                                      document.execCommand(
                                        "foreColor",
                                        false,
                                        e.target.value,
                                      )
                                    }
                                    style={{
                                      width: "24px",
                                      height: "24px",
                                      padding: "1px",
                                      border: "1px solid #d1d5db",
                                      borderRadius: "3px",
                                      cursor: "pointer",
                                    }}
                                  />

                                  <button
                                    title="Horizontal Line (─── विभाजक रेखा)"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      const editor = document.getElementById(
                                        `editor-${cell.id}`,
                                      );
                                      if (!editor) return;
                                      editor.focus();
                                      document.execCommand(
                                        "insertHTML",
                                        false,
                                        `<hr style="border:none;border-top:1px solid #555;margin:4px 0;"/>`,
                                      );
                                    }}
                                    style={{
                                      padding: "3px 7px",
                                      border: "1px solid #d1d5db",
                                      borderRadius: "3px",
                                      cursor: "pointer",
                                      backgroundColor: "#fef3c7",
                                      fontSize: "11px",
                                      fontWeight: "bold",
                                      color: "#92400e",
                                    }}
                                  >
                                    ─ HR
                                  </button>
                                  {/* New Line button — inserts <br> at cursor */}
                                  <button
                                    title="नई लाइन (↵ Enter जैसा)"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      const editor = document.getElementById(
                                        `editor-${cell.id}`,
                                      );
                                      if (!editor) return;
                                      editor.focus();
                                      document.execCommand(
                                        "insertHTML",
                                        false,
                                        "<br>",
                                      );
                                    }}
                                    style={{
                                      padding: "3px 7px",
                                      border: "1px solid #d1d5db",
                                      borderRadius: "3px",
                                      cursor: "pointer",
                                      backgroundColor: "#e0f2fe",
                                      fontSize: "11px",
                                      fontWeight: "bold",
                                      color: "#0369a1",
                                    }}
                                  >
                                    ↵ Line
                                  </button>
                                </div>
                                <RichTextEditor
                                  id={`editor-${cell.id}`}
                                  value={cell.text || ""}
                                  onChange={(html) =>
                                    updateCellProperty(
                                      row.id,
                                      cell.id,
                                      "text",
                                      html,
                                    )
                                  }
                                  style={{
                                    width: "100%",
                                    minHeight: "120px",
                                    padding: "8px",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "0 0 4px 4px",
                                    fontSize: getFontSize(
                                      cell.fontSize || "medium",
                                    ),
                                    fontFamily:
                                      cell.fontFamily ||
                                      "'Bhaskar', 'Noto Serif Devanagari', serif",
                                    lineHeight: "1.6",
                                    outline: "none",
                                    backgroundColor: "white",
                                    boxSizing: "border-box",
                                  }}
                                />
                              </div>
                            ) : /* View mode - exact newspaper look */
                            hasVisibleText(cell.heading) ||
                              hasVisibleText(cell.text) ||
                              cell.text ||
                              (cell.images && cell.images.length > 0) ? (
                              <NewspaperCellContent cell={cell} />
                            ) : (
                              <div
                                style={{
                                  color: "#9ca3af",
                                  textAlign: "center",
                                  paddingTop: "30px",
                                  fontSize: "12px",
                                }}
                              >
                                Click Edit to add content
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              {selectedFooterTemplate && (
                <NewspaperFooter
                  isLastPage={pages[pages.length - 1].id === currentPage}
                  footerText={footerText}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sidebar ── */}
      {showSidebar && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            maxWidth: "360px",
            height: "100vh",
            backgroundColor: "white",
            boxShadow: "4px 0 12px rgba(0,0,0,0.15)",
            zIndex: 100,
            overflowY: "auto",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "2px solid #e5e7eb",
              position: "sticky",
              top: 0,
              backgroundColor: "white",
              zIndex: 10,
            }}
          >
            {["Header", "SubHeader", "Footer"].map((tab) => {
              const key = tab.toLowerCase().replace("subheader", "subheader");
              return (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(key)}
                  style={{
                    flex: 1,
                    padding: "11px",
                    fontSize: "10px",
                    fontWeight: 700,
                    backgroundColor: currentTab === key ? "#374151" : "#f3f4f6",
                    color: currentTab === key ? "white" : "black",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {tab}
                </button>
              );
            })}
            <button
              onClick={() => setShowSidebar(false)}
              style={{
                padding: "11px 14px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280",
                fontSize: "18px",
              }}
            >
              ×
            </button>
          </div>

          <div style={{ padding: "16px" }}>
            {/* ── Header Tab ── */}
            {currentTab === "header" && (
              <div>
                {/* Template select */}
                <div style={{ marginBottom: "16px" }}>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      marginBottom: "10px",
                      color: "#374151",
                    }}
                  >
                    Select Template
                  </p>
                  {headerTemplates.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedHeaderTemplate(t.id);
                        setShowSidebar(false);
                      }}
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        background: t.bg,
                        color: "white",
                        outline:
                          selectedHeaderTemplate === t.id
                            ? "3px solid #3b82f6"
                            : "none",
                        outlineOffset: "2px",
                        boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            backgroundColor: "white",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                          }}
                        >
                          📰
                        </div>
                        <div
                          style={{
                            flex: 1,
                            fontWeight: "bold",
                            fontSize: "14px",
                          }}
                        >
                          {t.name}
                        </div>
                        {selectedHeaderTemplate === t.id && (
                          <span
                            style={{
                              backgroundColor: "white",
                              color: "#dc2626",
                              padding: "4px 10px",
                              borderRadius: "5px",
                              fontSize: "10px",
                              fontWeight: "bold",
                            }}
                          >
                            ✓ Active
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Header BG Image */}
                <div
                  style={{
                    marginBottom: "16px",
                    padding: "10px",
                    backgroundColor: "#f0fdf4",
                    borderRadius: "8px",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "8px",
                      color: "#166534",
                    }}
                  >
                    🖼️ Header Background Image
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <label
                      style={{
                        backgroundColor: "#16a34a",
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      📁 Image चुनें
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) =>
                            setHeaderBgImage(ev.target.result);
                          reader.readAsDataURL(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {headerBgImage && (
                      <>
                        <img
                          src={headerBgImage}
                          alt="preview"
                          style={{
                            width: "60px",
                            height: "36px",
                            objectFit: "cover",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                          }}
                        />
                        <button
                          onClick={() => setHeaderBgImage(null)}
                          style={{
                            backgroundColor: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "4px 10px",
                            cursor: "pointer",
                            fontSize: "11px",
                          }}
                        >
                          ✕ Remove
                        </button>
                      </>
                    )}
                    {!headerBgImage && (
                      <span style={{ fontSize: "10px", color: "#6b7280" }}>
                        कोई image नहीं — default colors use होंगे
                      </span>
                    )}
                  </div>
                </div>

                {/* Color customization */}
                <div
                  style={{ borderTop: "2px solid #e5e7eb", paddingTop: "14px" }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      marginBottom: "10px",
                      color: "#374151",
                    }}
                  >
                    🎨 Header Colors (Page 1)
                  </p>
                  <ColorRow
                    label="Top Bar Background"
                    value={headerColors.topBarBg}
                    onChange={(v) => updateHC("topBarBg", v)}
                  />
                  <ColorRow
                    label="Top Bar Text"
                    value={headerColors.topBarText}
                    onChange={(v) => updateHC("topBarText", v)}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{ fontSize: "11px", color: "#6b7280", flex: 1 }}
                    >
                      Top Bar Bold
                    </span>
                    <button
                      onClick={() =>
                        updateHC("topBarBold", !headerColors.topBarBold)
                      }
                      style={{
                        padding: "3px 10px",
                        border: `1px solid ${headerColors.topBarBold ? "#0f766e" : "#d1d5db"}`,
                        borderRadius: "4px",
                        backgroundColor: headerColors.topBarBold
                          ? "#d1fae5"
                          : "white",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      B {headerColors.topBarBold ? "ON" : "OFF"}
                    </button>
                  </div>
                  <ColorRow
                    label="Main Background"
                    value={headerColors.mainBg}
                    onChange={(v) => updateHC("mainBg", v)}
                  />
                  <ColorRow
                    label="Title Color"
                    value={headerColors.titleColor}
                    onChange={(v) => updateHC("titleColor", v)}
                  />
                  <ColorRow
                    label="Subtitle Color"
                    value={headerColors.subtitleColor}
                    onChange={(v) => updateHC("subtitleColor", v)}
                  />
                  <ColorRow
                    label="Logo Box Background"
                    value={headerColors.logoBg}
                    onChange={(v) => updateHC("logoBg", v)}
                  />
                  <ColorRow
                    label="Logo Accent Background"
                    value={headerColors.logoAccentBg}
                    onChange={(v) => updateHC("logoAccentBg", v)}
                  />
                  <ColorRow
                    label="Logo Text Color"
                    value={headerColors.logoText}
                    onChange={(v) => updateHC("logoText", v)}
                  />
                  <ColorRow
                    label="Tagline Background"
                    value={headerColors.taglineBg}
                    onChange={(v) => updateHC("taglineBg", v)}
                  />
                  <ColorRow
                    label="Tagline Text"
                    value={headerColors.taglineText}
                    onChange={(v) => updateHC("taglineText", v)}
                  />
                  <ColorRow
                    label="Tagline Border"
                    value={headerColors.taglineBorder}
                    onChange={(v) => updateHC("taglineBorder", v)}
                  />
                  <ColorRow
                    label="Reg Bar Background"
                    value={headerColors.regBarBg}
                    onChange={(v) => updateHC("regBarBg", v)}
                  />
                  <ColorRow
                    label="Reg Bar Text"
                    value={headerColors.regBarText}
                    onChange={(v) => updateHC("regBarText", v)}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{ fontSize: "11px", color: "#6b7280", flex: 1 }}
                    >
                      Reg Bar Bold
                    </span>
                    <button
                      onClick={() =>
                        updateHC("regBarBold", !headerColors.regBarBold)
                      }
                      style={{
                        padding: "3px 10px",
                        border: `1px solid ${headerColors.regBarBold ? "#0f766e" : "#d1d5db"}`,
                        borderRadius: "4px",
                        backgroundColor: headerColors.regBarBold
                          ? "#d1fae5"
                          : "white",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      B {headerColors.regBarBold ? "ON" : "OFF"}
                    </button>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      margin: "14px 0 10px",
                      color: "#374151",
                    }}
                  >
                    🎨 Header Colors (Page 2+)
                  </p>
                  <ColorRow
                    label="Background Color"
                    value={headerColors.p2Bg}
                    onChange={(v) => updateHC("p2Bg", v)}
                  />
                  <ColorRow
                    label="Text Color"
                    value={headerColors.p2Text}
                    onChange={(v) => updateHC("p2Text", v)}
                  />
                  <button
                    onClick={() => setHeaderColors(defaultHeaderColors)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      backgroundColor: "#f3f4f6",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#374151",
                      marginTop: "8px",
                    }}
                  >
                    Reset to Default Colors
                  </button>
                </div>
              </div>
            )}

            {/* ── SubHeader Tab ── */}
            {currentTab === "subheader" && (
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    marginBottom: "10px",
                    color: "#374151",
                  }}
                >
                  Select Template
                </p>
                {subHeaderTemplates.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedSubHeaderTemplate(t.id);
                    }}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      backgroundColor: t.bg,
                      outline:
                        selectedSubHeaderTemplate === t.id
                          ? "3px solid #3b82f6"
                          : "none",
                      outlineOffset: "2px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: t.bg === "#ffffff" ? "#000" : "#fff",
                        textAlign: "center",
                      }}
                    >
                      {t.text}
                    </div>
                  </div>
                ))}

                {selectedSubHeaderTemplate && (
                  <div
                    style={{
                      borderTop: "2px solid #e5e7eb",
                      paddingTop: "14px",
                      marginTop: "14px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        marginBottom: "10px",
                        color: "#374151",
                      }}
                    >
                      🎨 Override SubHeader Colors
                    </p>
                    <ColorRow
                      label="Background"
                      value={subHeaderColors.bg}
                      onChange={(v) => updateSHC("bg", v)}
                    />
                    <ColorRow
                      label="Text Color"
                      value={subHeaderColors.text}
                      onChange={(v) => updateSHC("text", v)}
                    />
                    <button
                      onClick={() => setSubHeaderColors(defaultSubHeaderColors)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        backgroundColor: "#f3f4f6",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#374151",
                        marginTop: "4px",
                      }}
                    >
                      Reset
                    </button>
                  </div>
                )}

                {/* Dynamic SubHeader Text */}
                {selectedSubHeaderTemplate && (
                  <div
                    style={{
                      borderTop: "2px solid #e5e7eb",
                      paddingTop: "14px",
                      marginTop: "14px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        marginBottom: "8px",
                        color: "#374151",
                      }}
                    >
                      ✏️ SubHeader Text (Dynamic)
                    </p>
                    {/* Formatting toolbar */}
                    <div
                      style={{
                        display: "flex",
                        gap: "5px",
                        alignItems: "center",
                        marginBottom: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      {[
                        ["B", "bold"],
                        ["I", "italic"],
                        ["U", "underline"],
                      ].map(([lbl, cmd]) => (
                        <button
                          key={cmd}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            document.execCommand(cmd);
                          }}
                          style={{
                            padding: "3px 8px",
                            fontWeight: lbl === "B" ? "bold" : "normal",
                            fontStyle: lbl === "I" ? "italic" : "normal",
                            textDecoration: lbl === "U" ? "underline" : "none",
                            border: "1px solid #d1d5db",
                            borderRadius: "3px",
                            cursor: "pointer",
                            backgroundColor: "white",
                            fontSize: "12px",
                          }}
                        >
                          {lbl}
                        </button>
                      ))}
                      <input
                        type="color"
                        title="Text Color"
                        onInput={(e) =>
                          document.execCommand(
                            "foreColor",
                            false,
                            e.target.value,
                          )
                        }
                        style={{
                          width: "26px",
                          height: "26px",
                          padding: "1px",
                          border: "1px solid #d1d5db",
                          borderRadius: "3px",
                          cursor: "pointer",
                        }}
                      />
                      <select
                        value={subHeaderFontSize}
                        onChange={(e) => setSubHeaderFontSize(e.target.value)}
                        style={{
                          padding: "3px",
                          fontSize: "11px",
                          border: "1px solid #d1d5db",
                          borderRadius: "3px",
                        }}
                      >
                        {[
                          "11",
                          "12",
                          "13",
                          "14",
                          "15",
                          "16",
                          "18",
                          "20",
                          "22",
                          "24",
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s}px
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setSubHeaderBold((b) => !b)}
                        style={{
                          padding: "3px 8px",
                          border: `1px solid ${subHeaderBold ? "#0f766e" : "#d1d5db"}`,
                          borderRadius: "3px",
                          cursor: "pointer",
                          backgroundColor: subHeaderBold ? "#d1fae5" : "white",
                          fontSize: "11px",
                          fontWeight: "bold",
                        }}
                      >
                        Bold {subHeaderBold ? "ON" : "OFF"}
                      </button>
                    </div>
                    <div
                      id="subheader-rich-editor"
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) =>
                        setSubHeaderText(e.currentTarget.innerHTML)
                      }
                      dangerouslySetInnerHTML={{ __html: subHeaderText }}
                      placeholder="Custom text (blank = template default)"
                      style={{
                        width: "100%",
                        minHeight: "36px",
                        padding: "7px 8px",
                        fontSize: "12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        boxSizing: "border-box",
                        fontFamily: "'Bhaskar', 'Noto Serif Devanagari', serif",
                        outline: "none",
                        backgroundColor: "white",
                      }}
                    />
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        margin: "4px 0 0",
                      }}
                    >
                      खाली छोड़ने पर template का default text दिखेगा
                    </p>
                  </div>
                )}

                {/* SubHeader Image Upload */}
                {selectedSubHeaderTemplate && (
                  <div
                    style={{
                      borderTop: "2px solid #e5e7eb",
                      paddingTop: "14px",
                      marginTop: "14px",
                      padding: "10px",
                      backgroundColor: "#f0fdf4",
                      borderRadius: "8px",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        marginBottom: "8px",
                        color: "#166534",
                      }}
                    >
                      🖼️ SubHeader Image (वैकल्पिक)
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <label
                        style={{
                          backgroundColor: "#16a34a",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: "bold",
                        }}
                      >
                        📁 Image चुनें
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) =>
                              setSubHeaderBgImage(ev.target.result);
                            reader.readAsDataURL(file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      {subHeaderBgImage && (
                        <>
                          <img
                            src={subHeaderBgImage}
                            alt="preview"
                            style={{
                              width: "60px",
                              height: "20px",
                              objectFit: "cover",
                              borderRadius: "3px",
                              border: "1px solid #ccc",
                            }}
                          />
                          <button
                            onClick={() => setSubHeaderBgImage(null)}
                            style={{
                              backgroundColor: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              padding: "4px 10px",
                              cursor: "pointer",
                              fontSize: "11px",
                            }}
                          >
                            ✕ Remove
                          </button>
                        </>
                      )}
                      {!subHeaderBgImage && (
                        <span style={{ fontSize: "10px", color: "#6b7280" }}>
                          Image नहीं — text दिखेगा
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {/* Remove SubHeader option */}
                {selectedSubHeaderTemplate && (
                  <div style={{ marginTop: "14px" }}>
                    <button
                      onClick={() => {
                        setSelectedSubHeaderTemplate(null);
                        setSubHeaderText("");
                        setSubHeaderBgImage(null);
                      }}
                      style={{
                        width: "100%",
                        padding: "8px",
                        backgroundColor: "#fee2e2",
                        border: "1px solid #fca5a5",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#dc2626",
                      }}
                    >
                      🗑️ SubHeader हटाएं
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Footer Tab ── */}
            {currentTab === "footer" && (
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    marginBottom: "10px",
                    color: "#374151",
                  }}
                >
                  Select Template
                </p>
                {footerTemplates.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedFooterTemplate(t.id);
                      setShowSidebar(false);
                    }}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: t.bg,
                      outline:
                        selectedFooterTemplate === t.id
                          ? "3px solid #3b82f6"
                          : "none",
                      outlineOffset: "2px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      marginBottom: "8px",
                    }}
                  >
                    {t.text && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "bold",
                          color:
                            t.bg === "#ffffff" || t.bg === "#f3f4f6"
                              ? "#000"
                              : "#fff",
                        }}
                      >
                        {t.text}
                      </span>
                    )}
                    <div style={{ display: "flex", gap: "5px" }}>
                      {t.dots.map((d, i) => (
                        <div
                          key={i}
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: d,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {/* Dynamic reg bar inputs - 4 fields */}
                <div
                  style={{
                    borderTop: "2px solid #e5e7eb",
                    paddingTop: "14px",
                    marginTop: "14px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      marginBottom: "10px",
                      color: "#374151",
                    }}
                  >
                    📰 Header Reg Bar (Digits Only)
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: "10px",
                          color: "#6b7280",
                          display: "block",
                          marginBottom: "3px",
                        }}
                      >
                        वर्ष (Year No.)
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          overflow: "hidden",
                        }}
                      >
                        <span
                          style={{
                            padding: "5px 6px",
                            backgroundColor: "#f3f4f6",
                            fontSize: "10px",
                            color: "#374151",
                            whiteSpace: "nowrap",
                            borderRight: "1px solid #d1d5db",
                          }}
                        >
                          वर्ष -
                        </span>
                        <input
                          type="text"
                          value={regVarsh}
                          onChange={(e) => setRegVarsh(e.target.value)}
                          style={{
                            flex: 1,
                            padding: "5px 6px",
                            fontSize: "12px",
                            border: "none",
                            outline: "none",
                            width: "40px",
                          }}
                          placeholder="01"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "10px",
                          color: "#6b7280",
                          display: "block",
                          marginBottom: "3px",
                        }}
                      >
                        अंक (Issue No.)
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          overflow: "hidden",
                        }}
                      >
                        <span
                          style={{
                            padding: "5px 6px",
                            backgroundColor: "#f3f4f6",
                            fontSize: "10px",
                            color: "#374151",
                            whiteSpace: "nowrap",
                            borderRight: "1px solid #d1d5db",
                          }}
                        >
                          अंक-
                        </span>
                        <input
                          type="text"
                          value={regAnk}
                          onChange={(e) => setRegAnk(e.target.value)}
                          style={{
                            flex: 1,
                            padding: "5px 6px",
                            fontSize: "12px",
                            border: "none",
                            outline: "none",
                            width: "40px",
                          }}
                          placeholder="34"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "10px",
                          color: "#6b7280",
                          display: "block",
                          marginBottom: "3px",
                        }}
                      >
                        कुल पेज (Total Pages)
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          overflow: "hidden",
                        }}
                      >
                        <span
                          style={{
                            padding: "5px 6px",
                            backgroundColor: "#f3f4f6",
                            fontSize: "10px",
                            color: "#374151",
                            whiteSpace: "nowrap",
                            borderRight: "1px solid #d1d5db",
                          }}
                        >
                          पेज-
                        </span>
                        <input
                          type="text"
                          value={regKulPej}
                          onChange={(e) => setRegKulPej(e.target.value)}
                          style={{
                            flex: 1,
                            padding: "5px 6px",
                            fontSize: "12px",
                            border: "none",
                            outline: "none",
                            width: "40px",
                          }}
                          placeholder="08"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "10px",
                          color: "#6b7280",
                          display: "block",
                          marginBottom: "3px",
                        }}
                      >
                        कीमत (Price)
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          overflow: "hidden",
                        }}
                      >
                        <span
                          style={{
                            padding: "5px 6px",
                            backgroundColor: "#f3f4f6",
                            fontSize: "10px",
                            color: "#374151",
                            whiteSpace: "nowrap",
                            borderRight: "1px solid #d1d5db",
                          }}
                        >
                          ₹
                        </span>
                        <input
                          type="text"
                          value={regKimat}
                          onChange={(e) => setRegKimat(e.target.value)}
                          style={{
                            flex: 1,
                            padding: "5px 6px",
                            fontSize: "12px",
                            border: "none",
                            outline: "none",
                            width: "40px",
                          }}
                          placeholder="5"
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "6px 10px",
                      backgroundColor: "#f0fdf4",
                      borderRadius: "6px",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <p
                      style={{ fontSize: "10px", color: "#166534", margin: 0 }}
                    >
                      Preview:{" "}
                      <strong>
                        वर्ष - {regVarsh}, अंक- {regAnk}
                      </strong>{" "}
                      &nbsp;|&nbsp;{" "}
                      <strong>
                        कुल पेज-{regKulPej}, कीमत-{regKimat} रू.
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Dynamic footer text editor */}
                <div
                  style={{
                    borderTop: "2px solid #e5e7eb",
                    paddingTop: "14px",
                    marginTop: "14px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      marginBottom: "8px",
                      color: "#374151",
                    }}
                  >
                    📝 Footer Text (Last Page)
                  </p>
                  <textarea
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    rows={4}
                    placeholder="Footer text for last page..."
                    style={{
                      width: "100%",
                      padding: "8px",
                      fontSize: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      boxSizing: "border-box",
                      resize: "vertical",
                      fontFamily: "'Bhaskar', 'Noto Serif Devanagari', serif",
                      lineHeight: "1.6",
                    }}
                  />
                  <button
                    onClick={() =>
                      setFooterText(
                        "उदयरतन ऑफसेट द्वारा मुद्रित, दीपेश जोशी की ओर से दीपेश जोशी द्वारा प्रकाशित, उज्जैन में मुद्रित और कैलाश गली, सर्राफा बाजार जावद में प्रकाशित, संपादक दीपेश जोशी मो. 9425108412, 9425108292",
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      backgroundColor: "#f3f4f6",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#374151",
                      marginTop: "6px",
                    }}
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Layout Modal ── */}
      {showLayoutModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "520px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "16px",
                textAlign: "center",
                color: "#1f2937",
              }}
            >
              SELECT LAYOUT
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              {layoutOptions.map((layout) => (
                <div
                  key={layout.id}
                  onClick={() => setSelectedLayout(layout)}
                  style={{
                    cursor: "pointer",
                    border:
                      selectedLayout?.id === layout.id
                        ? "2px solid #3b82f6"
                        : "2px solid transparent",
                    borderRadius: "8px",
                    padding: "8px",
                    backgroundColor:
                      selectedLayout?.id === layout.id ? "#eff6ff" : "#f9fafb",
                    outline:
                      selectedLayout?.id === layout.id
                        ? "none"
                        : "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gap: "4px",
                      gridTemplateColumns: layout.cols
                        .map((c) => `${(c / 12) * 100}%`)
                        .join(" "),
                      height: "48px",
                      marginBottom: "4px",
                    }}
                  >
                    {layout.cols.map((col, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor:
                            selectedLayout?.id === layout.id
                              ? "#bfdbfe"
                              : "#e5e7eb",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          fontWeight: "700",
                          color:
                            selectedLayout?.id === layout.id
                              ? "#1d4ed8"
                              : "#9ca3af",
                        }}
                      >
                        {col}
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color:
                        selectedLayout?.id === layout.id
                          ? "#1d4ed8"
                          : "#6b7280",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    {layout.name}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowLayoutModal(false)}
                style={{
                  flex: 1,
                  padding: "11px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#374151",
                }}
              >
                Cancel
              </button>
              <button
                onClick={addRow}
                style={{
                  flex: 1,
                  padding: "11px",
                  backgroundColor: "#16a34a",
                  color: "white",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Add Row{" "}
                <ChevronRight style={{ width: "18px", height: "18px" }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview Modal ── */}
      {showPreview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
            padding: "16px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              backgroundColor: "#444",
              borderRadius: "12px",
              padding: "16px",
              maxWidth: `${PAGE_W + 60}px`,
              width: "100%",
              maxHeight: "95vh",
              overflow: "auto",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowPreview(false)}
              style={{
                position: "sticky",
                top: "8px",
                float: "right",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: "bold",
                zIndex: 10,
              }}
            >
              ×
            </button>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "16px",
                textAlign: "center",
                color: "white",
                clear: "both",
              }}
            >
              Preview — All Pages (Exact PDF View)
            </h2>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {previewContainers.map((preview, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#f3f4f6",
                    padding: "16px",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      marginBottom: "12px",
                      padding: "6px 16px",
                      backgroundColor: "#1f2937",
                      color: "white",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    Page {preview.pageId}
                  </div>

                  {/* Exact 25×37 cm page */}
                  <div
                    id={`pdf-page-${preview.pageId}`}
                    style={{
                      width: `${PAGE_W}px`,
                      height: `${PAGE_H}px`,
                      backgroundColor: "white",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                      fontFamily: "'Bhaskar', 'Noto Serif Devanagari', serif",
                      boxSizing: "border-box",
                      overflow: "hidden",
                    }}
                  >
                    {/* Header */}
                    {selectedHeaderTemplate &&
                      (idx === 0 ? (
                        <NewspaperHeader1
                          channelName={channelName}
                          selectedDate={selectedDate}
                          hc={headerColors}
                          headerBgImage={headerBgImage}
                          regVarsh={regVarsh}
                          regAnk={regAnk}
                          regKulPej={regKulPej}
                          regKimat={regKimat}
                        />
                      ) : (
                        <NewspaperHeader2
                          channelName={channelName}
                          selectedDate={selectedDate}
                          pageNum={preview.pageId}
                          hc={headerColors}
                        />
                      ))}
                    {/* SubHeader */}
                    <NewspaperSubHeader
                      templateId={selectedSubHeaderTemplate}
                      customColors={subHeaderColors}
                      customText={subHeaderText}
                      bgImage={subHeaderBgImage}
                      bold={subHeaderBold}
                      fontSize={subHeaderFontSize}
                    />
                    {/* Content */}
                    <NewspaperPageContent rows={preview.rows} />
                    {/* Footer */}
                    {selectedFooterTemplate && (
                      <NewspaperFooter
                        isLastPage={idx === previewContainers.length - 1}
                        footerText={footerText}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                padding: "16px",
                backgroundColor: "#555",
                borderRadius: "8px",
                marginTop: "16px",
              }}
            >
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  padding: "10px 28px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <X style={{ width: "16px", height: "16px" }} /> Close
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  generatePDF();
                }}
                style={{
                  padding: "10px 28px",
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Download style={{ width: "16px", height: "16px" }} /> Download
                PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Converting Modal ── */}
      {showConvertingModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "40px",
              maxWidth: "300px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                border: "5px solid #ef4444",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: "16px",
              }}
            />
            <p
              style={{
                fontSize: "18px",
                fontWeight: 700,
                margin: 0,
                color: "#1f2937",
              }}
            >
              Converting to PDF...
            </p>
          </div>
        </div>
      )}

      {/* ── Success Modal ── */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "40px",
              maxWidth: "380px",
              width: "100%",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "#10b981",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg
                style={{ width: "36px", height: "36px", color: "white" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3
              style={{
                fontSize: "22px",
                fontWeight: "bold",
                marginBottom: "20px",
                color: "#1f2937",
              }}
            >
              PDF Downloaded!
            </h3>
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                width: "100%",
                backgroundColor: "white",
                color: "#dc2626",
                border: "2px solid #dc2626",
                padding: "12px",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* ── News Popup ── */}
      {newsPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setNewsPopup(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "500px",
              maxHeight: "80vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "2px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#1f2937",
                color: "white",
                borderRadius: "12px 12px 0 0",
              }}
            >
              <span style={{ fontWeight: "bold", fontSize: "15px" }}>
                📰 News Select Karein
              </span>
              <button
                onClick={() => setNewsPopup(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {!newsLoading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#6b7280",
                  }}
                >
                  Loading...
                </div>
              ) : newsList.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#6b7280",
                  }}
                >
                  Koi news nahi mili
                </div>
              ) : (
                newsList.map((item) => (
                  <div
                    key={String(item.id)}
                    onClick={() => handleNewsSelect(item)}
                    style={{
                      display: "flex",
                      gap: "10px",
                      padding: "10px 14px",
                      borderBottom: "1px solid #f3f4f6",
                      cursor: "pointer",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f0fdf4")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "white")
                    }
                  >
                    <img
                      src={
                        "https://neemuchkhabar.org/uploads/news/" +
                        String(item.imagename || "")
                      }
                      alt=""
                      style={{
                        width: "56px",
                        height: "56px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        flexShrink: 0,
                        backgroundColor: "#e5e7eb",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "12px",
                          lineHeight: "1.5",
                          color: "#111827",
                        }}
                      >
                        {String(item.title || "")}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#6b7280",
                          marginTop: "3px",
                        }}
                      >
                        Reporter: {String(item.reporterName || "")} | ID:{" "}
                        {String(item.id || "")}
                      </div>
                    </div>
                    <span style={{ color: "#10b981", fontSize: "16px" }}>
                      →
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Page Delete Confirmation Modal ── */}
      {pageDeleteConfirm !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "36px 40px",
              maxWidth: "360px",
              width: "100%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#fee2e2",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Trash2
                style={{ width: "28px", height: "28px", color: "#dc2626" }}
              />
            </div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "8px",
                color: "#1f2937",
              }}
            >
              Delete Page {pageDeleteConfirm}?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "24px",
              }}
            >
              Are you sure you want to delete{" "}
              <strong>Page {pageDeleteConfirm}</strong>? All content on this
              page will be lost.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setPageDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: "11px",
                  backgroundColor: "#e5e7eb",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  color: "#374151",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deletePage(pageDeleteConfirm);
                  setPageDeleteConfirm(null);
                }}
                style={{
                  flex: 1,
                  padding: "11px",
                  backgroundColor: "#dc2626",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "36px 40px",
              maxWidth: "360px",
              width: "100%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#fee2e2",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Trash2
                style={{ width: "28px", height: "28px", color: "#dc2626" }}
              />
            </div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "8px",
                color: "#1f2937",
              }}
            >
              Are you sure?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "24px",
              }}
            >
              This will delete all pages and content. This action cannot be
              undone.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  padding: "11px",
                  backgroundColor: "#e5e7eb",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  color: "#374151",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setCurrentPage(1);
                  setPages([{ id: 1, rows: [] }]);
                  setShowDeleteConfirm(false);
                }}
                style={{
                  flex: 1,
                  padding: "11px",
                  backgroundColor: "#dc2626",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Save Confirmation Modal ── */}
      {showSavePopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "36px 40px",
              maxWidth: "360px",
              width: "100%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#fee2e2",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Save
                style={{ width: "28px", height: "28px", color: "#079e0f" }}
              />
            </div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "8px",
                color: "#1f2937",
              }}
            >
              Are you sure you want to save the data for{" "}
              <b>{formatHindiDate(selectedDate)}</b>?
            </h3>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "8px",
                color: "#1f2937",
              }}
            ></h3>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowSavePopup(false)}
                style={{
                  flex: 1,
                  padding: "11px",
                  backgroundColor: "#e5e7eb",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  color: "#374151",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleManualSave();
                  setShowSavePopup(false);
                }}
                style={{
                  flex: 1,
                  padding: "11px",
                  backgroundColor: "#dc2626",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Clear Cache / New Device Modal ── */}
      {showClearCacheModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "32px 28px",
              maxWidth: "380px",
              width: "100%",
              boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
              textAlign: "center",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: "70px",
                height: "70px",
                backgroundColor: "#fff7ed",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                fontSize: "36px",
                border: "3px solid #f97316",
              }}
            >
              📱
            </div>

            <h3
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "10px",
                color: "#1f2937",
              }}
            >
              New Device / नया Device?
            </h3>

            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "6px",
                lineHeight: "1.6",
              }}
            >
              यह button दबाने से:
            </p>

            <div
              style={{
                backgroundColor: "#fff7ed",
                border: "1px solid #fed7aa",
                borderRadius: "10px",
                padding: "14px 16px",
                marginBottom: "20px",
                textAlign: "left",
              }}
            >
              {[
                "✅ सारा Cache clear होगा",
                "✅ LocalStorage clear होगा",
                "✅ App fresh/blank हो जाएगी",
                "📅 फिर Date select करके Data लो",
                "✏️ Changes करो और Save करो",
              ].map((item, i) => (
                <p
                  key={i}
                  style={{
                    margin: "4px 0",
                    fontSize: "13px",
                    color: "#92400e",
                    fontWeight: i < 3 ? "600" : "500",
                  }}
                >
                  {item}
                </p>
              ))}
            </div>

            <p
              style={{
                fontSize: "12px",
                color: "#ef4444",
                marginBottom: "20px",
                fontWeight: "600",
              }}
            >
              ⚠️ Current unsaved changes delete हो जाएंगे!
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowClearCacheModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#e5e7eb",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  color: "#374151",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearCache}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#f97316",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                🗑️ Clear & Fresh Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hidden PDF Render Container (all pages always rendered off-screen) ── */}
      <div
        id="pdf-hidden-container"
        style={{
          position: "fixed",
          left: "-99999px",
          top: 0,
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        {pages.map((page, idx) => (
          <div
            key={page.id}
            id={`pdf-render-page-${page.id}`}
            style={{
              width: `${PAGE_W}px`,
              height: `${PAGE_H}px`,
              backgroundColor: "white",
              fontFamily: "'Bhaskar', 'Noto Serif Devanagari', serif",
              boxSizing: "border-box",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            {selectedHeaderTemplate &&
              (idx === 0 ? (
                <NewspaperHeader1
                  channelName={channelName}
                  selectedDate={selectedDate}
                  hc={headerColors}
                  headerBgImage={headerBgImage}
                  regVarsh={regVarsh}
                  regAnk={regAnk}
                  regKulPej={regKulPej}
                  regKimat={regKimat}
                />
              ) : (
                <NewspaperHeader2
                  channelName={channelName}
                  selectedDate={selectedDate}
                  pageNum={page.id}
                  hc={headerColors}
                />
              ))}
            <NewspaperSubHeader
              templateId={selectedSubHeaderTemplate}
              customColors={subHeaderColors}
              customText={subHeaderText}
              bgImage={subHeaderBgImage}
              bold={subHeaderBold}
              fontSize={subHeaderFontSize}
            />
            <NewspaperPageContent rows={page.rows} />
            {selectedFooterTemplate && (
              <NewspaperFooter
                isLastPage={idx === pages.length - 1}
                footerText={footerText}
              />
            )}
          </div>
        ))}
      </div>
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "40px",
              maxWidth: "300px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                border: "5px solid #ef4444",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: "16px",
              }}
            />
            <p
              style={{
                fontSize: "18px",
                fontWeight: 700,
                margin: 0,
                color: "#1f2937",
              }}
            >
              Loading...
            </p>
          </div>
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;600;700;900&family=Hind:wght@400;500;600;700&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        p { margin: 0 0 2px 0; }
      `}</style>
    </div>
  );
}