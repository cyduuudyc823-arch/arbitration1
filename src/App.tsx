import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CircleDot,
  Eraser,
  Grid3X3,
  Layers,
  Link2,
  Moon,
  Move,
  PenLine,
  Ruler,
  RotateCcw,
  Search,
  Send,
  SlidersHorizontal,
  Sun,
  ZoomIn,
} from "lucide-react";

type MeetingState = "live" | "summary";
type ActiveTab = "originalImages" | "readingData";
type TimelineKey = "current" | "2023" | "2020";
type Tool = "zoom" | "pan" | "mark" | "erase" | "window" | "magnify";
type FinalDecision = "Recall" | "No recall";

type Position = {
  x: number;
  y: number;
};

type Mark = {
  id: number;
  paneId: string;
  x: number;
  y: number;
};

type MammogramImage = {
  id: string;
  paneId: string;
  label: string;
  src: string;
  laterality: "L" | "R";
  view: "CC" | "MLO";
  objectPosition: "left center" | "right center";
};

type TimelineItem = {
  id: TimelineKey;
  label: string;
  year: string;
  src: string;
  note: string;
};

const assetPath = (fileName: string) => `/assets/${fileName}`;

const mammograms: MammogramImage[] = [
  { id: "r-mlo", paneId: "pane-rmlo", label: "R-MLO", src: assetPath("mammogram-r-mlo.webp"), laterality: "R", view: "MLO", objectPosition: "right center" },
  { id: "l-mlo", paneId: "pane-lmlo", label: "L-MLO", src: assetPath("mammogram-l-mlo.webp"), laterality: "L", view: "MLO", objectPosition: "left center" },
  { id: "r-cc", paneId: "pane-rcc", label: "R-CC", src: assetPath("mammogram-r-cc.webp"), laterality: "R", view: "CC", objectPosition: "right center" },
  { id: "l-cc", paneId: "pane-lcc", label: "L-CC", src: assetPath("mammogram-l-cc.webp"), laterality: "L", view: "CC", objectPosition: "left center" },
];

const timelineItems: TimelineItem[] = [
  {
    id: "current",
    label: "Current Screening",
    year: "2026",
    src: assetPath("mammogram-l-cc.webp"),
    note: "AI flagged focal asymmetry in the left upper outer quadrant.",
  },
  {
    id: "2023",
    label: "Prior 2023",
    year: "2023",
    src: assetPath("mammogram-l-mlo.webp"),
    note: "No recall-level finding recorded on prior comparison.",
  },
  {
    id: "2020",
    label: "Prior 2020",
    year: "2020",
    src: assetPath("mammogram-r-cc.webp"),
    note: "Previous routine screen, no suspicious interval change.",
  },
];

const participants = ["Reader A", "Reader B", "Reader C"];
const defaultRecallReason =
  "Focal asymmetry was confirmed after review of current and prior images. The panel recorded the disagreement as a learning case without attributing individual fault.";
const defaultNoRecallReason =
  "The panel did not identify a recall-level correlate after review of the current and prior images. The disagreement is retained as a non-blame learning record.";

function App() {
  const [meetingState, setMeetingState] = useState<MeetingState>("live");
  const [activeTab, setActiveTab] = useState<ActiveTab>("originalImages");
  const [activeTimeline, setActiveTimeline] = useState<TimelineKey>("current");
  const [activeTool, setActiveTool] = useState<Tool>("mark");
  const [activePaneId, setActivePaneId] = useState("pane-lcc");
  const [marks, setMarks] = useState<Mark[]>([
    { id: 1, paneId: "pane-lcc", x: 25, y: 48 },
  ]);
  const [recordingSeconds, setRecordingSeconds] = useState(12);
  const [recordingPosition, setRecordingPosition] = useState<Position>(() => ({
    x: typeof window === "undefined" ? 24 : Math.max(8, window.innerWidth - 166),
    y: typeof window === "undefined" ? 112 : Math.max(88, window.innerHeight - 184),
  }));
  const [draggingRecording, setDraggingRecording] = useState(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const [darkMode, setDarkMode] = useState(false);
  const [librarySent, setLibrarySent] = useState(false);
  const [finalDecision, setFinalDecision] = useState<FinalDecision>("Recall");
  const [summaryReason, setSummaryReason] = useState(defaultRecallReason);

  const selectedTimeline = useMemo(
    () => timelineItems.find((item) => item.id === activeTimeline) ?? timelineItems[0],
    [activeTimeline],
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRecordingSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!draggingRecording) return undefined;

    function handlePointerMove(event: PointerEvent) {
      const width = 142;
      const height = 156;
      setRecordingPosition({
        x: clamp(event.clientX - dragOffset.current.x, 8, window.innerWidth - width - 8),
        y: clamp(event.clientY - dragOffset.current.y, 24, window.innerHeight - height - 8),
      });
    }

    function handlePointerUp() {
      setDraggingRecording(false);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [draggingRecording]);

  function handleImageClick(event: React.MouseEvent<HTMLButtonElement>, paneId: string) {
    setActivePaneId(paneId);

    if (activeTool === "erase") {
      setMarks((current) => current.filter((mark) => mark.paneId !== paneId));
      return;
    }

    if (activeTool !== "mark") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    setMarks((current) => [
      ...current,
      { id: Date.now(), paneId, x: clamp(x, 6, 94), y: clamp(y, 8, 92) },
    ]);
  }

  function beginRecordingDrag(event: React.PointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    dragOffset.current = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
    setDraggingRecording(true);
  }

  function closeMeeting(decision: FinalDecision) {
    setFinalDecision(decision);
    setSummaryReason(decision === "Recall" ? defaultRecallReason : defaultNoRecallReason);
    setMeetingState("summary");
  }

  return (
    <div className={`clinical-app ${darkMode ? "theme-dark" : "theme-light"}`}>
      <RecordingWidget
        seconds={recordingSeconds}
        position={recordingPosition}
        dragging={draggingRecording}
        onPointerDown={beginRecordingDrag}
      />

      {meetingState === "live" ? (
        <>
          <div className="header-hover-zone" aria-hidden="true" />
          <ClinicalHeader darkMode={darkMode} setDarkMode={setDarkMode} />
          <main className="meeting-shell">
            <section className="meeting-card">
              <div className="meeting-card-header">
                <ReadyologyBrand compact />
                <div className="tab-list" role="tablist" aria-label="Arbitration meeting content">
                  <TabButton active={activeTab === "originalImages"} onClick={() => setActiveTab("originalImages")}>
                    Original Images
                  </TabButton>
                  <TabButton active={activeTab === "readingData"} onClick={() => setActiveTab("readingData")}>
                    Reading Data
                  </TabButton>
                </div>
                <div className="decision-actions" aria-label="Final arbitration decision">
                  <button className="decision-action recall" onClick={() => closeMeeting("Recall")}>
                    Recall
                  </button>
                  <button className="decision-action no-recall" onClick={() => closeMeeting("No recall")}>
                    No recall
                  </button>
                </div>
              </div>

              {activeTab === "originalImages" ? (
                <OriginalImagesTab
                  activeTool={activeTool}
                  setActiveTool={setActiveTool}
                  activePaneId={activePaneId}
                  setActivePaneId={setActivePaneId}
                  marks={marks}
                  handleImageClick={handleImageClick}
                  activeTimeline={activeTimeline}
                  setActiveTimeline={setActiveTimeline}
                  selectedTimeline={selectedTimeline}
                />
              ) : (
                <ReadingDataTab marks={marks} />
              )}
            </section>
          </main>
        </>
      ) : (
        <MeetingSummary
          finalDecision={finalDecision}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          librarySent={librarySent}
          setLibrarySent={setLibrarySent}
          summaryReason={summaryReason}
          setSummaryReason={setSummaryReason}
          backToMeeting={() => setMeetingState("live")}
        />
      )}
    </div>
  );
}

function ClinicalHeader({
  darkMode,
  setDarkMode,
}: {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}) {
  return (
    <header className="clinical-header">
      <ReadyologyBrand />

      <div className="header-meta">
        <MetaPill label="Participants" value="3 anonymised participants" />
        <MetaPill label="Focus" value="Routine screening · Left breast · Upper outer quadrant" />
      </div>

      <button className="mode-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        {darkMode ? "Light" : "Night"}
      </button>
    </header>
  );
}

function ReadyologyBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`readyology-brand ${compact ? "compact" : ""}`}>
      <img className="readyology-full-logo" src="/assets/readyology-arbitration-logo.svg" alt="Ready-ology Arbitration Meeting" />
    </div>
  );
}

function RecordingWidget({
  seconds,
  position,
  dragging,
  onPointerDown,
}: {
  seconds: number;
  position: Position;
  dragging: boolean;
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
}) {
  return (
    <aside
      className={`recording-widget ${dragging ? "dragging" : ""}`}
      aria-label="Recording status"
      onPointerDown={onPointerDown}
      style={{ left: position.x, top: position.y }}
    >
      <span className="recording-visual" aria-hidden="true">
        <span className="recording-glow" />
        <span className="recording-core">
          <span className="audio-bars">
            <span />
            <span />
            <span />
            <span />
            <span />
          </span>
        </span>
      </span>
      <div className="recording-copy">
        <strong>Recording</strong>
        <span>{formatTimer(seconds)}</span>
        <small>Ambient discussion capture active</small>
      </div>
    </aside>
  );
}

function OriginalImagesTab({
  activeTool,
  setActiveTool,
  activePaneId,
  setActivePaneId,
  marks,
  handleImageClick,
  activeTimeline,
  setActiveTimeline,
  selectedTimeline,
}: {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  activePaneId: string;
  setActivePaneId: (paneId: string) => void;
  marks: Mark[];
  handleImageClick: (event: React.MouseEvent<HTMLButtonElement>, paneId: string) => void;
  activeTimeline: TimelineKey;
  setActiveTimeline: (timeline: TimelineKey) => void;
  selectedTimeline: TimelineItem;
}) {
  return (
    <div className="original-layout reading-room">
      <ReadingToolbar activeTool={activeTool} setActiveTool={setActiveTool} />
      <div className="reading-main">
        <ViewerThumbnailRail activePaneId={activePaneId} setActivePaneId={setActivePaneId} />
        <ReadingViewer
          marks={marks}
          activePaneId={activePaneId}
          setActivePaneId={setActivePaneId}
          onImageClick={handleImageClick}
          showAi={false}
        />
        <HistoryHoverPanel
          activeTimeline={activeTimeline}
          setActiveTimeline={setActiveTimeline}
          selectedTimeline={selectedTimeline}
        />
      </div>
    </div>
  );
}

function ReadingToolbar({
  activeTool,
  setActiveTool,
}: {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}) {
  const tools: Array<{ id: Tool | "length" | "freehand" | "reset" | "grid" | "sync"; label: string; icon: React.ReactNode }> = [
    { id: "pan", label: "Pan", icon: <Move size={18} /> },
    { id: "zoom", label: "Zoom", icon: <ZoomIn size={18} /> },
    { id: "magnify", label: "Magnify", icon: <Search size={18} /> },
    { id: "window", label: "Window", icon: <SlidersHorizontal size={18} /> },
    { id: "length", label: "Length", icon: <Ruler size={18} /> },
    { id: "erase", label: "Erase", icon: <Eraser size={18} /> },
    { id: "mark", label: "Mark", icon: <CircleDot size={18} /> },
    { id: "freehand", label: "Freehand", icon: <PenLine size={18} /> },
    { id: "reset", label: "Reset", icon: <RotateCcw size={18} /> },
    { id: "grid", label: "Grid", icon: <Grid3X3 size={18} /> },
    { id: "sync", label: "Sync", icon: <Link2 size={18} /> },
  ];

  return (
    <div className="reading-toolbar" aria-label="Mammogram viewer toolbar">
      <div className="reading-tool-group">
        {tools.map((tool) => (
          <button
            className={activeTool === tool.id ? "active" : ""}
            key={tool.id}
            onClick={() => {
              if (["zoom", "pan", "mark", "erase", "window", "magnify"].includes(tool.id)) {
                setActiveTool(tool.id as Tool);
              }
            }}
            title={tool.label}
          >
            {tool.icon}
            <span className="tool-label">{tool.label}</span>
          </button>
        ))}
      </div>
      <div className="reading-case-chip"><span>Case </span>BSV000254<span> · Session 1 of 10 · Age 72</span></div>
    </div>
  );
}

function ViewerThumbnailRail({
  activePaneId,
  setActivePaneId,
}: {
  activePaneId: string;
  setActivePaneId: (paneId: string) => void;
}) {
  return (
    <aside className="viewer-series">
      <div className="series-label">Views</div>
      {mammograms.map((image) => (
        <button
          className={`viewer-thumb ${activePaneId === image.paneId ? "active" : ""}`}
          key={image.paneId}
          onClick={() => setActivePaneId(image.paneId)}
        >
          <div className="thumb-img">
            <img src={image.src} alt={`${image.label} thumbnail`} style={{ objectPosition: image.objectPosition }} />
          </div>
          <span className="thumb-tag">{image.label}</span>
          <div className="thumb-label">
            <strong>{image.view}</strong>
            <span>{image.laterality}</span>
            <em>Current</em>
          </div>
        </button>
      ))}
    </aside>
  );
}

function ReadingViewer({
  marks,
  activePaneId,
  setActivePaneId,
  onImageClick,
  showAi,
}: {
  marks: Mark[];
  activePaneId?: string;
  setActivePaneId?: (paneId: string) => void;
  onImageClick?: (event: React.MouseEvent<HTMLButtonElement>, paneId: string) => void;
  showAi?: boolean;
}) {
  return (
    <div className="reading-viewer">
      {mammograms.map((image) => (
        <button
          className={`mamo-pane ${activePaneId === image.paneId ? "active" : ""}`}
          id={image.paneId}
          key={image.paneId}
          onClick={(event) => {
            setActivePaneId?.(image.paneId);
            onImageClick?.(event, image.paneId);
          }}
          type="button"
        >
          <span className="pane-label">{image.label}</span>
          <span className="pane-age">Age: 72</span>
          <img className="mamo-img" src={image.src} alt={`${image.label} mammogram`} style={{ objectPosition: image.objectPosition }} />
          {(image.paneId === "pane-lcc" || image.paneId === "pane-lmlo") && (
            <span
              className={`finding-marker ${showAi || image.paneId === "pane-lcc" ? "visible" : ""}`}
              style={image.paneId === "pane-lcc" ? { top: "48%", left: "25%" } : { top: "45%", left: "28%" }}
            >
              <span className="finding-ring" />
            </span>
          )}
          {marks
            .filter((mark) => mark.paneId === image.paneId)
            .map((mark) => (
              <span
                className="human-mark-ring labelled"
                key={mark.id}
                style={{ left: `${mark.x}%`, top: `${mark.y}%` }}
              >
                <span className="human-ring-label">Mark</span>
                <span className="human-ring-circle" />
              </span>
            ))}
          <span className="pane-meta"><span>Zoom 1:1</span><span>WW/WL: 4096 / 2047</span></span>
        </button>
      ))}
    </div>
  );
}

function HistoryHoverPanel({
  activeTimeline,
  setActiveTimeline,
  selectedTimeline,
}: {
  activeTimeline: TimelineKey;
  setActiveTimeline: (timeline: TimelineKey) => void;
  selectedTimeline: TimelineItem;
}) {
  return (
    <aside className="history-hover-rail">
      <div className="history-tab">Historical Images</div>
      <div className="history-panel">
        <div className="section-heading">
          <span>Prior-image timeline</span>
          <h2>{selectedTimeline.label}</h2>
          <p>{selectedTimeline.note}</p>
        </div>
        <div className="timeline-track">
          {timelineItems.map((item) => (
            <button
              className={`timeline-card ${activeTimeline === item.id ? "active" : ""}`}
              key={item.id}
              onClick={() => setActiveTimeline(item.id)}
            >
              <img src={item.src} alt={`${item.label} mammogram preview`} />
              <span>{item.year}</span>
              <strong>{item.label}</strong>
              <small>{item.note}</small>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function ReadingDataTab({ marks }: { marks: Mark[] }) {
  const readerMarks = marks.length ? marks : [{ id: 999, paneId: "pane-lcc", x: 25, y: 48 }];

  return (
    <div className="reading-data-layout">
      <div className="comparison-stack">
        <section className="reading-column reader-column">
          <PanelHeader icon={<CircleDot size={18} />} eyebrow="Reader 1 annotation" title="Reader 1" />
          <div className="annotation-frame">
            <ReadingViewer marks={readerMarks} />
          </div>
          <DecisionReason
            decision="No recall"
            tone="human"
            reason="No recall-level human mark at the AI finding location."
          />
          <DataRows rows={[["Confidence", "High"]]} />
        </section>

        <section className="reading-column ai-column">
          <PanelHeader icon={<Layers size={18} />} eyebrow="AI annotation" title="AI reader" />
          <div className="annotation-frame">
            <ReadingViewer marks={[]} showAi />
          </div>
          <DecisionReason
            decision="Recall suggested"
            tone="ai"
            reason="Subtle asymmetric density detected across L-CC and L-MLO views."
          />
          <DataRows
            rows={[
              ["Confidence", "91%"],
              ["Finding type", "Focal asymmetry"],
              ["Location", "Left breast · upper outer quadrant"],
            ]}
          />
        </section>
      </div>

      <aside className="case-card-stack">
        <InfoCard title="Case Detail" icon={<CircleDot size={21} />} status="Case pack" tone="case">
          <DataRows
            rows={[
              ["Case ID", "BS-V000254"],
              ["Age", "72"],
              ["Screening round", "Round 3"],
              ["Density", "A · Almost entirely fatty"],
              ["Review focus", "L-CC and L-MLO · upper outer quadrant"],
            ]}
          />
        </InfoCard>
        <InfoCard title="Decision Timeline" icon={<RotateCcw size={21} />} status="Locked sequence" tone="timeline">
          <div className="decision-timeline-list">
            <DecisionTimelineItem
              label="Reader 1"
              decision="No recall / Human-negative"
              reason="No matching recall-level human mark at the AI finding location."
            />
            <DecisionTimelineItem
              label="AI reader"
              decision="Recall suggested / AI-positive"
              reason="Focal asymmetry detected in the left upper outer quadrant."
            />
            <div className="current-question">
              <span>Current question</span>
              <strong>Should this case be recalled for further assessment?</strong>
            </div>
          </div>
        </InfoCard>
        <InfoCard title="Disagreement Type" icon={<Layers size={21} />} status="Priority review" tone="disagreement">
          <span className="highlight-badge">AI-positive / Human-negative</span>
          <p>Suggested category: Detection gap / Change</p>
        </InfoCard>
        <InfoCard title="Similar Case Reference" icon={<Search size={21} />} status="Learning match" tone="reference">
          <DataRows
            rows={[
              ["Reference", "REF-014"],
              ["Prior outcome", "Recalled after review"],
              ["Learning note", "Similar disagreement patterns may benefit from second-look review"],
            ]}
          />
        </InfoCard>
      </aside>
    </div>
  );
}

function MeetingSummary({
  finalDecision,
  darkMode,
  setDarkMode,
  librarySent,
  setLibrarySent,
  summaryReason,
  setSummaryReason,
  backToMeeting,
}: {
  finalDecision: FinalDecision;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  librarySent: boolean;
  setLibrarySent: (value: boolean) => void;
  summaryReason: string;
  setSummaryReason: (value: string) => void;
  backToMeeting: () => void;
}) {
  const keyReason = summaryReason.trim() || (finalDecision === "Recall" ? defaultRecallReason : defaultNoRecallReason);

  return (
    <>
      <div className="header-hover-zone" aria-hidden="true" />
      <header className="clinical-header summary-header">
        <div className="case-identity">
          <span className="brand-mark complete"><Check size={22} /></span>
          <div>
            <div className="header-title-row">
              <h1>Meeting complete</h1>
              <span className="status-chip complete">Reasoning receipt</span>
            </div>
            <p>Case BS-V000254 · Arbitration record ready</p>
          </div>
        </div>
        <button className="mode-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          {darkMode ? "Light" : "Night"}
        </button>
      </header>

      <main className="summary-shell">
        <section className="summary-receipt">
          <p className="receipt-kicker">Clinical reasoning receipt</p>
          <h2>{finalDecision === "Recall" ? "Recall to assessment" : "No recall"}</h2>
          <p className="receipt-lede">{keyReason}</p>

          <label className="reason-editor">
            <span>Editable clinical reason</span>
            <textarea
              value={summaryReason}
              onChange={(event) => setSummaryReason(event.target.value)}
              aria-label="Editable clinical reason"
            />
          </label>

          <div className="receipt-grid">
            <ReceiptItem label="Case" value="BS-V000254" />
            <ReceiptItem label="Disagreement type" value="AI-positive / Human-negative" />
            <ReceiptItem
              label="Key reason"
              value={keyReason}
            />
            <ReceiptItem label="Discussion captured" value="Yes · ambient discussion record attached" />
            <ReceiptItem label="Participants" value={participants.join(", ")} />
            <ReceiptItem label="Learning record status" value="Ready for case library after follow-up outcome is confirmed" />
          </div>

          <section className="learning-record">
            <h3>Arbitration record</h3>
            <p>
              Reader 1 recorded no recall before AI reveal. The AI output suggested recall with high confidence. The panel reviewed the image evidence and recorded the final arbitration decision: {keyReason}
            </p>
          </section>

          <section className="learning-record">
            <h3>Summary</h3>
            <p>
              This case is useful for shared learning because the disagreement pattern may recur where subtle asymmetry is visible across L-CC and L-MLO views but not initially marked by a human reader.
            </p>
          </section>

          <div className="summary-actions">
            <button onClick={backToMeeting}>Back to live meeting</button>
            <button className="primary" onClick={() => setLibrarySent(true)}>
              {librarySent ? <Check size={17} /> : <Send size={17} />}
              {librarySent ? "Sent locally" : "Send to learning library"}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button className={active ? "active" : ""} onClick={onClick} role="tab" aria-selected={active}>
      {children}
    </button>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="meta-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PanelHeader({ icon, eyebrow, title }: { icon: React.ReactNode; eyebrow: string; title: string }) {
  return (
    <div className="panel-header">
      <span>{icon}</span>
      <div>
        <small>{eyebrow}</small>
        <h2>{title}</h2>
      </div>
    </div>
  );
}

function DecisionReason({
  decision,
  reason,
  tone,
}: {
  decision: string;
  reason: string;
  tone: "human" | "ai";
}) {
  return (
    <div className="decision-reason">
      <div className={`decision-band ${tone}`}>
        <span>Decision</span>
        <strong>{decision}</strong>
      </div>
      <div className="reason-block">
        <span>Reason</span>
        <p>{reason}</p>
      </div>
    </div>
  );
}

function DecisionTimelineItem({
  label,
  decision,
  reason,
}: {
  label: string;
  decision: string;
  reason: string;
}) {
  return (
    <article className="decision-timeline-item">
      <span>{label}</span>
      <strong>{decision}</strong>
      <p>{reason}</p>
    </article>
  );
}

function InfoCard({
  title,
  icon,
  status,
  tone,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  status: string;
  tone: "case" | "timeline" | "disagreement" | "reference";
  children: React.ReactNode;
}) {
  return (
    <section className={`info-card ${tone}`}>
      <div className="info-card-header">
        <span className="info-icon">{icon}</span>
        <div>
          <small>{status}</small>
          <h3>{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
}

function DataRows({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="data-rows">
      {rows.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function ReceiptItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="receipt-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default App;
