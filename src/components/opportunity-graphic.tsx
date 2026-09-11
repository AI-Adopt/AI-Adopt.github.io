"use client";

const PLUM = "#6f5c91";
const LAVENDER = "#c8b8ff";
const LILAC = "#e7deff";
const PEACH = "#f1a08a";
const CREAM = "#f3e5bd";
const PAPER = "#faf7f1";

export function OpportunityGraphic({
  opportunityId,
  compact = false,
  className = "",
}: {
  opportunityId: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={`${compact ? "h-16 w-20" : "h-40 w-full"} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 160 160" className="h-full w-full overflow-visible">
        {iconFor(opportunityId)}
      </svg>
    </div>
  );
}

function iconFor(id: string) {
  switch (id) {
    case "customer-support": return <Support />;
    case "knowledge-assistant": return <Knowledge />;
    case "document-processing": return <Document />;
    case "meeting-summarization": return <Meeting />;
    case "sales-assistant": return <Sales />;
    case "invoice-automation": return <Invoice />;
    case "it-helpdesk": return <Helpdesk />;
    case "marketing-content": return <Content />;
    case "contract-review": return <Contract />;
    case "reporting-automation": return <Reporting />;
    default: return <Automation />;
  }
}

function Support() {
  return (
    <g>
      <path d="M31 80V68a49 49 0 0 1 98 0v12h-13V68a36 36 0 0 0-72 0v12z" fill={PLUM} />
      <rect x="24" y="72" width="29" height="48" rx="14.5" fill={LAVENDER} />
      <rect x="107" y="72" width="29" height="48" rx="14.5" fill={LAVENDER} />
      <path d="M122 112c0 15-11 25-27 25H82v-9h13c10 0 18-6 18-16z" fill={PLUM} />
      <rect x="68" y="124" width="24" height="16" rx="8" fill={PEACH} />
      <circle cx="80" cy="54" r="17" fill={PAPER} />
      <rect x="76" y="43" width="8" height="22" rx="4" fill={PLUM} />
      <rect x="69" y="50" width="22" height="8" rx="4" fill={PLUM} />
    </g>
  );
}

function Knowledge() {
  return (
    <g>
      <path d="M78 27c-17-10-35 3-32 21-16 4-18 27-5 36-8 17 5 34 23 30 3 13 14 20 26 17V47c0-12-4-18-12-20z" fill={LAVENDER} />
      <path d="M82 27c17-10 35 3 32 21 16 4 18 27 5 36 8 17-5 34-23 30-3 13-14 20-26 17V47c0-12 4-18 12-20z" fill={LILAC} />
      <circle cx="80" cy="72" r="15" fill={PAPER} />
      <circle cx="80" cy="72" r="7" fill={PEACH} />
      <rect x="76" y="29" width="8" height="31" rx="4" fill={PAPER} />
      <rect x="48" y="69" width="20" height="7" rx="3.5" fill={PAPER} />
      <rect x="92" y="69" width="20" height="7" rx="3.5" fill={PAPER} />
      <rect x="76" y="84" width="8" height="34" rx="4" fill={PAPER} />
      <rect x="64" y="137" width="32" height="7" rx="3.5" fill={PLUM} />
    </g>
  );
}

function Document() {
  return (
    <g>
      <path d="M40 22h56l26 26v86a10 10 0 0 1-10 10H40a10 10 0 0 1-10-10V32a10 10 0 0 1 10-10z" fill={PAPER} />
      <path d="M96 22v26h26z" fill={CREAM} />
      <rect x="48" y="66" width="48" height="8" rx="4" fill={LAVENDER} />
      <rect x="48" y="83" width="36" height="8" rx="4" fill={LILAC} />
      <rect x="48" y="100" width="42" height="8" rx="4" fill={LILAC} />
      <rect x="89" y="88" width="48" height="48" rx="15" fill={LAVENDER} />
      <circle cx="113" cy="112" r="13" fill={PAPER} />
      <rect x="109" y="101" width="8" height="22" rx="4" fill={PLUM} />
      <rect x="102" y="108" width="22" height="8" rx="4" fill={PLUM} />
    </g>
  );
}

function Meeting() {
  return (
    <g>
      <path d="M19 34h82a12 12 0 0 1 12 12v43a12 12 0 0 1-12 12H61l-25 18v-18H19A12 12 0 0 1 7 89V46a12 12 0 0 1 12-12z" fill={LAVENDER} />
      <rect x="31" y="57" width="49" height="8" rx="4" fill={PAPER} />
      <rect x="31" y="73" width="35" height="8" rx="4" fill={PAPER} />
      <rect x="80" y="75" width="72" height="67" rx="15" fill={PAPER} />
      <rect x="96" y="94" width="38" height="7" rx="3.5" fill={PLUM} />
      <rect x="96" y="108" width="29" height="7" rx="3.5" fill={LAVENDER} />
      <rect x="96" y="122" width="34" height="7" rx="3.5" fill={LAVENDER} />
      <path d="m126 43 6 12 13 2-10 9 3 13-12-6-12 6 3-13-10-9 13-2z" fill={PEACH} />
    </g>
  );
}

function Sales() {
  return (
    <g>
      <path d="M20 25h120l-39 47v48l-42 18V72z" fill={CREAM} />
      <circle cx="52" cy="47" r="9" fill={LAVENDER} />
      <circle cx="80" cy="47" r="9" fill={PEACH} />
      <circle cx="108" cy="47" r="9" fill={PAPER} />
      <rect x="63" y="68" width="34" height="8" rx="4" fill={PLUM} opacity=".55" />
      <circle cx="80" cy="107" r="20" fill={LAVENDER} />
      <path d="m69 107 8 8 16-21-6-5-11 15-2-3z" fill={PAPER} />
    </g>
  );
}

function Invoice() {
  return (
    <g>
      <path d="M36 20h82v119l-11-8-11 8-11-8-11 8-11-8-11 8-16-11z" fill={PAPER} />
      <rect x="53" y="49" width="49" height="8" rx="4" fill={LAVENDER} />
      <rect x="53" y="66" width="31" height="8" rx="4" fill={LILAC} />
      <rect x="53" y="91" width="48" height="8" rx="4" fill={LILAC} />
      <circle cx="111" cy="105" r="31" fill={PEACH} />
      <path d="m94 105 12 12 22-30-7-5-16 23-5-6z" fill={PAPER} />
      <rect x="72" y="27" width="8" height="36" rx="4" fill={PLUM} />
      <rect x="63" y="34" width="25" height="8" rx="4" fill={PLUM} />
      <rect x="63" y="49" width="25" height="8" rx="4" fill={PLUM} />
    </g>
  );
}

function Helpdesk() {
  return (
    <g>
      <rect x="18" y="27" width="124" height="86" rx="17" fill={PAPER} />
      <rect x="18" y="27" width="124" height="24" rx="17" fill={LILAC} />
      <circle cx="33" cy="39" r="4" fill={PEACH} />
      <circle cx="46" cy="39" r="4" fill={LAVENDER} />
      <rect x="41" y="70" width="46" height="8" rx="4" fill={LAVENDER} />
      <rect x="41" y="87" width="31" height="8" rx="4" fill={LILAC} />
      <circle cx="112" cy="82" r="25" fill={LAVENDER} />
      <rect x="108" y="66" width="8" height="32" rx="4" fill={PAPER} />
      <rect x="96" y="78" width="32" height="8" rx="4" fill={PAPER} />
      <rect x="65" y="113" width="30" height="15" fill={PAPER} />
      <rect x="45" y="126" width="70" height="9" rx="4.5" fill={PLUM} />
    </g>
  );
}

function Content() {
  return (
    <g>
      <rect x="22" y="23" width="116" height="114" rx="20" fill={PAPER} />
      <rect x="38" y="39" width="84" height="49" rx="12" fill={LAVENDER} />
      <circle cx="58" cy="59" r="9" fill={PEACH} />
      <path d="m44 82 18-17 13 12 13-17 27 22z" fill={PLUM} opacity=".55" />
      <rect x="40" y="104" width="56" height="8" rx="4" fill={LILAC} />
      <rect x="40" y="120" width="39" height="8" rx="4" fill={LILAC} />
      <path d="m120 95 5 11 11 5-11 5-5 11-5-11-11-5 11-5z" fill={PEACH} />
    </g>
  );
}

function Contract() {
  return (
    <g>
      <rect x="36" y="19" width="88" height="122" rx="8" fill={PAPER} />
      <rect x="53" y="47" width="53" height="8" rx="4" fill={LAVENDER} />
      <rect x="53" y="65" width="39" height="8" rx="4" fill={LILAC} />
      <rect x="53" y="83" width="51" height="8" rx="4" fill={LILAC} />
      <rect x="53" y="101" width="31" height="8" rx="4" fill={LILAC} />
      <circle cx="112" cy="108" r="31" fill={CREAM} />
      <rect x="108" y="88" width="8" height="27" rx="4" fill={PEACH} />
      <circle cx="112" cy="124" r="5" fill={PEACH} />
      <path d="m98 25 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill={LAVENDER} />
    </g>
  );
}

function Automation() {
  return (
    <g>
      <circle cx="80" cy="80" r="53" fill={LAVENDER} />
      <circle cx="80" cy="80" r="25" fill={PAPER} />
      <circle cx="80" cy="80" r="10" fill={PEACH} />
      {[0, 45, 90, 135].map((rotation) => (
        <rect key={rotation} x="75" y="11" width="10" height="28" rx="5" fill={PLUM} transform={`rotate(${rotation} 80 80)`} />
      ))}
    </g>
  );
}

function Reporting() {
  return <g>
    <rect x="29" y="18" width="103" height="126" rx="12" fill={PAPER} />
    <rect x="45" y="36" width="53" height="8" rx="4" fill={LILAC} />
    <rect x="45" y="98" width="16" height="26" rx="4" fill={PEACH} />
    <rect x="70" y="77" width="16" height="47" rx="4" fill={LAVENDER} />
    <rect x="95" y="58" width="16" height="66" rx="4" fill={PLUM} />
  </g>;
}
