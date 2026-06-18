import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Lock,
  MessageSquareText,
  Moon,
  PanelRight,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const BLUE = "#124BCE";

const mammograms = [
  { id: "L-CC", src: "/assets/mammo-l-cc.png", label: "L-CC", age: 72 },
  { id: "R-CC", src: "/assets/mammo-r-cc.png", label: "R-CC", age: 72 },
  { id: "L-MLO", src: "/assets/mammo-l-mlo.png", label: "L-MLO", age: 72 },
  { id: "R-MLO", src: "/assets/mammo-r-mlo.png", label: "R-MLO", age: 72 },
];

const caseFacts = [
  ["Case ID", "Case 017"],
  ["Screening context", "Routine breast screening"],
  ["Breast density", "Dense breast"],
  ["Prior image", "Available"],
  ["Arbitration question", "Should this patient be recalled?"],
  ["Disagreement trigger", "AI marked subtle asymmetry"],
];

const participantData = [
  {
    name: "Participant 1",
    view: "Recall",
    confidence: "Medium",
    evidence: ["Prior image", "Breast density", "AI mark"],
    reason: "Subtle asymmetry appears more meaningful after prior comparison.",
  },
  {
    name: "Participant 2",
    view: "No Recall",
    confidence: "High",
    evidence: ["Lesion feature", "Image quality"],
    reason: "The feature may represent overlapping tissue rather than a new change.",
  },
  {
    name: "Participant 3",
    view: "Not yet stated",
    confidence: "Pending",
    evidence: [],
    reason: "Waiting to speak.",
  },
  {
    name: "Participant 4",
    view: "Further Review",
    confidence: "Low",
    evidence: ["Prior image", "Breast density"],
    reason: "I would like a focused comparison before committing to recall.",
  },
];

const transcript = [
  {
    speaker: "Chair",
    time: "10:04",
    text: "We are reviewing a high-confidence AI positive case where the human reader recorded no recall before AI reveal.",
  },
  {
    speaker: "Participant 1",
    time: "10:05",
    text: "I lean recall. The asymmetry is subtle, but the dense breast and prior comparison make me cautious.",
  },
  {
    speaker: "Participant 2",
    time: "10:07",
    text: "I am still no recall. It could be overlapping tissue, and the appearance is low suspicion on this view.",
  },
  {
    speaker: "124BCE facilitator",
    time: "10:08",
    text: "Current disagreement pattern: AI-positive, human-negative. No final recommendation is being made by the plugin.",
  },
];

function App() {
  const [step, setStep] = useState(0);
  const [aiLayer, setAiLayer] = useState(1);
  const [activeImage, setActiveImage] = useState(mammograms[0].id);
  const [showMarker, setShowMarker] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [sentToLibrary, setSentToLibrary] = useState(false);
  const [meetingEnded, setMeetingEnded] = useState(false);
  const [pluginTheme, setPluginTheme] = useState("dark");

  const currentImage = mammograms.find((image) => image.id === activeImage) ?? mammograms[0];
  const arbitrationActive = step > 0;

  return (
    <div className="demo-root bg-black text-white">
      <header className="demo-header border-b border-white/10 text-xs text-white/70">
        <div className="flex items-center gap-2 border-r border-white/10 px-2">
          <IconButton active label="Add view">
            <PanelRight size={18} />
          </IconButton>
          <IconButton label="Zoom in">
            <ZoomIn size={16} />
          </IconButton>
          <IconButton label="Zoom out">
            <ZoomOut size={16} />
          </IconButton>
        </div>
        <div className="flex items-center justify-center">
          <div className="rounded border border-white/10 bg-white/5 px-5 py-2 font-semibold text-white/72">
            Case BS-V000254 · Session 1 of 10 · Age 72
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-l border-white/10 px-3">
          <button className="rounded border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white/75">
            Instructions
          </button>
          <button className="rounded border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white/75">
            Home
          </button>
        </div>
      </header>

      <main className="demo-layout overflow-hidden">
        <ThumbnailRail activeImage={activeImage} setActiveImage={setActiveImage} />

        <section className="demo-viewer min-w-0 bg-black">
          {arbitrationActive ? (
            <FourUpViewer showMarker={showMarker} showHeatmap={showHeatmap} />
          ) : (
            <SingleViewer image={currentImage} showMarker={showMarker} showHeatmap={showHeatmap} />
          )}
        </section>

        <aside
          className={`demo-plugin-panel overflow-y-auto border-l ${
            pluginTheme === "light" ? "plugin-light border-black/10 bg-white" : "border-white/10 bg-[#101116]"
          }`}
        >
          <PluginShell
            step={step}
            setStep={setStep}
            aiLayer={aiLayer}
            setAiLayer={setAiLayer}
            showMarker={showMarker}
            setShowMarker={setShowMarker}
            showHeatmap={showHeatmap}
            setShowHeatmap={setShowHeatmap}
            sentToLibrary={sentToLibrary}
            setSentToLibrary={setSentToLibrary}
            meetingEnded={meetingEnded}
            setMeetingEnded={setMeetingEnded}
            pluginTheme={pluginTheme}
            setPluginTheme={setPluginTheme}
          />
        </aside>
      </main>
    </div>
  );
}

function ThumbnailRail({ activeImage, setActiveImage }) {
  return (
    <aside className="border-r border-white/10 bg-[#111217] px-2 py-3">
      <p className="mb-3 text-xs font-semibold uppercase text-white/42">Views</p>
      <div className="space-y-3">
        {mammograms.map((image) => (
          <button
            key={image.id}
            onClick={() => setActiveImage(image.id)}
            className={`w-full rounded border p-1 text-left transition ${
              activeImage === image.id ? "border-[#124BCE] bg-[#124BCE]/10" : "border-white/10 bg-black/50 hover:border-white/35"
            }`}
          >
            <img src={image.src} alt={`${image.label} mammogram`} className="h-24 w-full rounded object-cover" />
            <p className="mt-1 text-center text-[11px] font-semibold text-white/70">{image.label}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}

function SingleViewer({ image, showMarker, showHeatmap }) {
  return (
    <div className="relative h-full overflow-hidden bg-black">
      <div className="absolute inset-0 flex items-center justify-center">
        <img src={image.src} alt={`${image.label} mammogram`} className="h-full max-h-full w-auto max-w-full object-contain" />
      </div>
      <ViewerAnnotations label={image.label} showMarker={showMarker} showHeatmap={showHeatmap} />
    </div>
  );
}

function FourUpViewer({ showMarker, showHeatmap }) {
  return (
    <div className="grid h-full grid-cols-2 grid-rows-2 bg-black">
      {mammograms.map((image, index) => (
        <div key={image.id} className="relative overflow-hidden border-b border-r border-white/10 bg-black">
          <img src={image.src} alt={`${image.label} mammogram`} className="h-full w-full object-contain" />
          <ViewerAnnotations label={image.label} showMarker={showMarker && index === 0} showHeatmap={showHeatmap && index === 0} compact />
        </div>
      ))}
    </div>
  );
}

function ViewerAnnotations({ label, showMarker, showHeatmap, compact = false }) {
  return (
    <>
      <div className="absolute left-4 top-3 flex gap-3 text-[#124BCE]">
        <Search size={compact ? 14 : 16} />
        <Eye size={compact ? 14 : 16} />
      </div>
      <div className="absolute right-4 top-3 text-[11px] font-semibold text-white/30">Age: 72</div>
      <div className="absolute bottom-4 left-4 text-[11px] font-semibold leading-5 text-white/45">
        <p>{label}</p>
        <p>Zoom 1:1 · WW 4096 / WC 2047</p>
      </div>
      {showHeatmap && <div className="absolute left-[52%] top-[26%] h-32 w-32 rounded-full bg-[#124BCE]/25 blur-xl" />}
      {showMarker && (
        <div className="absolute left-[56%] top-[29%] h-24 w-24 rounded-full border-2 border-dashed border-[#124BCE] bg-[#124BCE]/5" />
      )}
    </>
  );
}

function PluginShell(props) {
  const {
    step,
    setStep,
    aiLayer,
    setAiLayer,
    showMarker,
    setShowMarker,
    showHeatmap,
    setShowHeatmap,
    sentToLibrary,
    setSentToLibrary,
    meetingEnded,
    setMeetingEnded,
    pluginTheme,
    setPluginTheme,
  } = props;

  return (
    <div className={`min-h-full ${pluginTheme === "light" ? "bg-white text-black" : "bg-[#101116] text-white"}`}>
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#101116]/95 p-4 backdrop-blur">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/38">Hospital viewer panel</p>
            <h1 className="mt-1 text-lg font-semibold text-white">Case BS-V000254</h1>
            <p className="mt-1 text-xs text-white/48">Native record + 124BCE arbitration plugin</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPluginTheme(pluginTheme === "light" ? "dark" : "light")}
              className="grid h-10 w-10 place-items-center rounded border border-[#124BCE]/45 bg-white text-[#124BCE]"
              title={pluginTheme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              aria-label={pluginTheme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {pluginTheme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <div className="grid h-10 w-10 place-items-center rounded border border-[#124BCE]/50 bg-[#124BCE] text-white">
              <BrainCircuit size={19} />
            </div>
          </div>
        </div>

        <FlowProgress step={step} meetingEnded={meetingEnded} />
      </div>

      <div className="space-y-4 p-4">
        {step === 0 ? (
          <CaseDetail onEnter={() => setStep(1)} />
        ) : (
          <ArbitrationFlow
            step={step}
            setStep={setStep}
            aiLayer={aiLayer}
            setAiLayer={setAiLayer}
            showMarker={showMarker}
            setShowMarker={setShowMarker}
            showHeatmap={showHeatmap}
            setShowHeatmap={setShowHeatmap}
            sentToLibrary={sentToLibrary}
            setSentToLibrary={setSentToLibrary}
            meetingEnded={meetingEnded}
            setMeetingEnded={setMeetingEnded}
          />
        )}
      </div>
    </div>
  );
}

function CaseDetail({ onEnter }) {
  return (
    <>
      <PanelLabel tone="native">Native Breast Screening Viewer</PanelLabel>

      <NativeCard title="Case Details" defaultOpen>
        <div className="space-y-2">
          {caseFacts.map(([label, value]) => (
            <InfoRow key={label} label={label} value={value} />
          ))}
        </div>
      </NativeCard>

      <NativeCard title="Historical Evidence" defaultOpen>
        <div className="grid grid-cols-2 gap-2">
          <EvidenceImage title="Current" src="/assets/mammo-l-cc.png" />
          <EvidenceImage title="Prior" src="/assets/mammo-l-mlo.png" />
        </div>
        <div className="mt-3 space-y-2 text-sm text-white/62">
          <p>Prior screen available from 2023-01-18.</p>
          <p>Dense tissue limits immediate certainty; prior comparison is required before final discussion.</p>
        </div>
      </NativeCard>

      <NativeCard title="Decision Timeline" defaultOpen>
        <div className="grid gap-3">
          <Compare label="Human judgement" left="Reader 1: No recall" right="Recorded before AI reveal" />
          <Compare label="AI reader result" left="AI: Recall suggested" right="Revealed after lock" />
          <Compare label="Reader 1 after AI" left="No recall" right="Further review" />
        </div>
        <div className="mt-4 rounded border border-white/10 bg-black p-3 text-sm font-semibold text-white/72">
          Potential AI influence detected
        </div>
      </NativeCard>

      <PanelLabel tone="plugin">124BCE Arbitration Plugin</PanelLabel>

      <Card title="AI Reader Result" defaultOpen>
        <div className="rounded border border-white/10 bg-black p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-white/35">AI judgement</p>
          <p className="mt-2 text-lg font-bold text-white">Recall suggested</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <MiniField label="Confidence" value="High" />
            <MiniField label="Finding type" value="Focal asymmetry" />
          </div>
        </div>
      </Card>

      <Card title="Disagreement Type Summary" defaultOpen accent>
        <div className="rounded border border-[#124BCE]/35 bg-[#124BCE]/10 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#124BCE]" />
            <div>
              <p className="text-sm font-bold text-white">High-confidence AI positive vs human negative</p>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Reader 1 recorded no recall before AI reveal. The AI reader suggested recall with high confidence, creating an arbitration trigger.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Suggested Next Step" defaultOpen accent>
        <div className="rounded border border-[#124BCE]/40 bg-black p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#124BCE]">
            <Lock size={14} />
            Warm handover prepared
          </div>
          <p className="text-sm leading-6 text-white/68">
            Send this case into arbitration with the human judgement locked and AI evidence introduced in layers.
          </p>
        </div>
        <button onClick={onEnter} className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-[#124BCE] px-4 py-3 text-sm font-bold text-white">
          Enter Arbitration
          <ChevronRight size={16} />
        </button>
      </Card>
    </>
  );
}

function ArbitrationFlow(props) {
  const {
    setStep,
    aiLayer,
    setAiLayer,
    showMarker,
    setShowMarker,
    showHeatmap,
    setShowHeatmap,
    sentToLibrary,
    setSentToLibrary,
    meetingEnded,
    setMeetingEnded,
  } = props;

  return (
    <>
      <MeetingWorkspace
        aiLayer={aiLayer}
        setAiLayer={setAiLayer}
        showMarker={showMarker}
        setShowMarker={setShowMarker}
        showHeatmap={showHeatmap}
        setShowHeatmap={setShowHeatmap}
        meetingEnded={meetingEnded}
        setMeetingEnded={setMeetingEnded}
        sentToLibrary={sentToLibrary}
        setSentToLibrary={setSentToLibrary}
      />

      <button
        onClick={() => setStep(0)}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
      >
        <ArrowLeft size={16} />
        Back to Case Details
      </button>
    </>
  );
}

function MeetingWorkspace(props) {
  const {
    aiLayer,
    setAiLayer,
    showMarker,
    setShowMarker,
    showHeatmap,
    setShowHeatmap,
    meetingEnded,
    setMeetingEnded,
    sentToLibrary,
    setSentToLibrary,
  } = props;

  return (
    <>
      <PanelLabel tone="plugin">124BCE Live Arbitration Meeting</PanelLabel>

      <Card title="Meeting Recording" defaultOpen accent>
        <div className="rounded border border-[#124BCE]/35 bg-black p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${meetingEnded ? "bg-white/35" : "bg-[#124BCE] animate-pulse"}`} />
              <div>
                <p className="text-sm font-bold">{meetingEnded ? "Recording completed" : "Recording in progress"}</p>
                <p className="mt-1 text-xs text-white/45">{meetingEnded ? "Duration 18:42 · transcript locked" : "Live audio capture · elapsed 10:08"}</p>
              </div>
            </div>
            <Badge>{meetingEnded ? "Summary ready" : "Live"}</Badge>
          </div>
          <div className="mt-4 flex h-10 items-end gap-1 rounded bg-[#101116] px-3 py-2">
            {[36, 52, 26, 60, 42, 70, 34, 56, 48, 64, 28, 50, 38, 72, 44, 58].map((height, index) => (
              <span
                key={`${height}-${index}`}
                className="w-full rounded-sm bg-[#124BCE]"
                style={{ height: `${meetingEnded ? height * 0.45 : height}%`, opacity: meetingEnded ? 0.45 : 0.95 }}
              />
            ))}
          </div>
        </div>
      </Card>

      {!meetingEnded ? (
        <>
          <Card title="Current Speaker" defaultOpen>
            <div className="rounded border border-[#124BCE]/35 bg-[#124BCE]/10 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Participant 2 is speaking</p>
                  <p className="mt-1 text-xs text-white/45">Topic: whether the finding could be overlapping tissue</p>
                </div>
                <span className="rounded bg-[#124BCE] px-2 py-1 text-xs font-bold text-white">On mic</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/74">
                "I am still no recall. It could be overlapping tissue, and the appearance is low suspicion on this view."
              </p>
            </div>
          </Card>

          <ParticipantViews />
          <LiveTranscript />
          <MeetingKeywords />

          <Card title="Shared Evidence Controls" defaultOpen>
            <div className="grid grid-cols-2 gap-2">
              <Toggle active={showMarker} onClick={() => setShowMarker(!showMarker)} label="AI mark" />
              <Toggle active={showHeatmap} onClick={() => setShowHeatmap(!showHeatmap)} label="Heatmap" />
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map((layer) => (
                <button
                  key={layer}
                  onClick={() => setAiLayer(layer)}
                  className={`rounded border py-2 text-xs font-bold ${aiLayer === layer ? "border-[#124BCE] bg-[#124BCE]" : "border-white/10 bg-white/5 text-white/60"}`}
                >
                  L{layer}
                </button>
              ))}
            </div>
            <p className="mt-3 rounded border border-white/10 bg-black p-3 text-sm leading-6 text-white/68">
              {aiLayer === 1 && "Case context only. AI details remain hidden to reduce anchoring."}
              {aiLayer === 2 && "AI marked subtle asymmetry in the upper outer region."}
              {aiLayer === 3 && "AI confidence: high recall recommendation."}
              {aiLayer === 4 && "Heatmap and similar case examples can be reviewed by the group."}
              {aiLayer === 5 && "Learning note: check dense breast AI marks against priors before accepting or dismissing them."}
            </p>
          </Card>

          <button onClick={() => setMeetingEnded(true)} className="flex w-full items-center justify-center gap-2 rounded bg-[#124BCE] px-4 py-3 text-sm font-bold text-white">
            <Check size={16} />
            End Meeting & Generate Summary
          </button>
        </>
      ) : (
        <MeetingSummary sentToLibrary={sentToLibrary} setSentToLibrary={setSentToLibrary} />
      )}
    </>
  );
}

function ParticipantViews() {
  return (
    <Card title="Participant Views" defaultOpen>
      <div className="space-y-3">
        {participantData.map((participant) => (
          <div key={participant.name} className="rounded border border-white/10 bg-black p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold">{participant.name}</p>
                <p className="mt-1 text-xs text-white/42">Confidence: {participant.confidence}</p>
              </div>
              <Badge>{participant.view}</Badge>
            </div>
            {participant.evidence.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {participant.evidence.map((item) => (
                  <Badge key={item}>{item}</Badge>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded border border-white/10 bg-white/5 p-2 text-sm text-white/48">No opinion recorded yet</p>
            )}
            <p className="mt-3 text-sm leading-6 text-white/66">{participant.reason}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function LiveTranscript() {
  return (
    <Card title="Live Transcript" defaultOpen>
      <div className="space-y-3">
        {transcript.map((line) => (
          <div key={`${line.time}-${line.speaker}`} className="rounded border border-white/10 bg-black p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-bold text-white">{line.speaker}</span>
              <span className="text-white/38">{line.time}</span>
            </div>
            <p className="text-sm leading-6 text-white/68">{line.text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MeetingKeywords() {
  const keywords = ["AI-positive human-negative", "focal asymmetry", "dense breast", "prior comparison", "overlapping tissue", "low suspicion"];

  return (
    <Card title="Meeting Keywords" defaultOpen>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <Badge key={keyword}>{keyword}</Badge>
        ))}
      </div>
    </Card>
  );
}

function MeetingSummary({ sentToLibrary, setSentToLibrary }) {
  return (
    <>
      <Card title="Meeting Summary" defaultOpen accent>
        <div className="space-y-3 text-sm leading-6 text-white/70">
          <p>
            The meeting reviewed a disagreement where Reader 1 recorded no recall and the AI reader suggested recall with high confidence.
          </p>
          <p>
            Participant 1 supported recall due to subtle asymmetry, dense breast tissue, and the need for prior comparison. Participant 2 supported no recall, noting possible overlapping tissue and low suspicion appearance. Participant 3 did not provide a view before meeting closure.
          </p>
        </div>
      </Card>

      <Card title="Final Arbitration Record" defaultOpen>
        <Metric label="Final decision" value="Recall" />
        <Metric label="Disagreement type" value="High-confidence AI positive vs human negative" />
        <Metric label="Bias check" value="Automation anchoring reviewed" />
        <div className="mt-3 rounded border border-white/10 bg-black p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-white/35">Rationale</p>
          <p className="mt-2 text-sm leading-6 text-white/68">
            Recall selected after balanced review of AI evidence, human disagreement, and the need for cautious prior-image comparison in dense breast tissue.
          </p>
        </div>
      </Card>

      <Card title="Learning Receipt" defaultOpen>
        <Timeline
          items={[
            "Audio recording and transcript completed",
            "Participant views captured with one pending contribution",
            "Disagreement classified as AI-positive human-negative",
            "Final arbitration summary generated",
          ]}
        />
        <button
          onClick={() => setSentToLibrary(true)}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded px-4 py-3 text-sm font-bold ${
            sentToLibrary ? "bg-white text-black" : "bg-[#124BCE] text-white"
          }`}
        >
          {sentToLibrary ? <Check size={16} /> : <BookOpen size={16} />}
          {sentToLibrary ? "Sent to Learning Case Library" : "Send to Learning Case Library"}
        </button>
      </Card>
    </>
  );
}

function StepOverview() {
  return (
    <Card title="Case Overview" defaultOpen>
      <div className="space-y-2">
        {[
          ["Case ID", "Case 017"],
          ["Reader 1", "No Recall"],
          ["AI suggestion", "Recall"],
          ["Disagreement trigger", "AI marked subtle asymmetry"],
          ["Breast density", "Dense breast"],
          ["Prior image", "Available"],
        ].map(([label, value]) => (
          <InfoRow key={label} label={label} value={value} />
        ))}
      </div>
      <Callout icon={<ShieldCheck size={16} />}>
        AI evidence will be introduced gradually to avoid anchoring and automation bias.
      </Callout>
    </Card>
  );
}

function StepReasoning() {
  return (
    <>
      <div className="space-y-3">
        {participantData.map((item) => (
          <Card key={item.name}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{item.name}</h3>
              <Badge>{item.view}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <MiniField label="Initial view" value={item.view} />
              <MiniField label="Confidence" value={item.confidence} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.evidence.map((evidence) => (
                <Badge key={evidence}>{evidence}</Badge>
              ))}
            </div>
            <p className="mt-3 rounded border border-white/10 bg-black p-3 text-sm leading-6 text-white/75">{item.reason}</p>
          </Card>
        ))}
      </div>
      <Card title="Anonymous Aggregation" defaultOpen>
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Recall" value="2" />
          <Metric label="No Recall" value="1" />
          <Metric label="Further Review" value="1" />
        </div>
        <p className="mt-4 text-sm leading-6 text-white/62">
          Before open discussion, the platform captures independent reasoning so junior radiologists do not need to change or hide their views after hearing a senior opinion.
        </p>
      </Card>
    </>
  );
}

function StepEvidence({ aiLayer, setAiLayer, showMarker, setShowMarker, showHeatmap, setShowHeatmap }) {
  return (
    <>
      <Card title="Human Views" defaultOpen>
        <InfoRow label="Reader 1" value="No Recall" />
        <InfoRow label="AI reader" value="Recall suggested" />
        <InfoRow label="Independent votes" value="Recall 2 · No Recall 1 · Further Review 1" />
        <InfoRow label="Reader 1 changed after AI" value="No Recall → Further Review" />
      </Card>

      <Card title="Image Evidence" defaultOpen>
        <div className="grid grid-cols-2 gap-2">
          <EvidenceImage title="Current" src="/assets/mammo-l-cc.png" />
          <EvidenceImage title="Prior" src="/assets/mammo-l-mlo.png" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Toggle active={showMarker} onClick={() => setShowMarker(!showMarker)} label="AI mark" />
          <Toggle active={showHeatmap} onClick={() => setShowHeatmap(!showHeatmap)} label="Heatmap" />
        </div>
        <ul className="mt-3 space-y-2 text-sm text-white/65">
          <li>Dense breast tissue</li>
          <li>Subtle asymmetry</li>
          <li>Prior comparison needed</li>
        </ul>
      </Card>

      <Card title="AI Evidence Layers" defaultOpen>
        <div className="grid grid-cols-5 gap-1">
          {[1, 2, 3, 4, 5].map((layer) => (
            <button
              key={layer}
              onClick={() => setAiLayer(layer)}
              className={`rounded border py-2 text-xs font-bold ${aiLayer === layer ? "border-[#124BCE] bg-[#124BCE]" : "border-white/10 bg-white/5 text-white/60"}`}
            >
              L{layer}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded border border-white/10 bg-black p-4 text-sm leading-6 text-white/75">
          {aiLayer === 1 && "AI suggestion exists but details are hidden to avoid anchoring."}
          {aiLayer === 2 && "AI marked subtle asymmetry in the upper outer region."}
          {aiLayer === 3 && "AI confidence: 82% recall recommendation."}
          {aiLayer === 4 && "Heatmap and similar case cards are available for comparison."}
          {aiLayer === 5 && "Learning note: in dense breast cases, AI marks should be checked against prior images before being accepted or dismissed."}
        </div>
        <p className="mt-3 text-sm leading-6 text-white/55">
          AI is available as evidence, but it does not dominate the discussion from the beginning.
        </p>
      </Card>
    </>
  );
}

function StepDiscussion() {
  return (
    <Card title="Live Reasoning Map" defaultOpen>
      <ReasonColumn title="Supports Recall" items={["AI marked subtle asymmetry", "Possible new change compared with prior image", "Dense breast makes detection difficult"]} />
      <ReasonColumn title="Supports No Recall" items={["Feature may be overlapping tissue", "Low suspicion appearance", "No clear lesion boundary"]} />
      <ReasonColumn title="Unresolved Questions" items={["Is the finding stable on prior?", "Does MLO view support the same area?", "Should this be a cautious recall?"]} />
      <Callout icon={<MessageSquareText size={16} />}>
        The plugin summarises the meeting discussion. It is a facilitator, not a diagnostic authority.
      </Callout>
    </Card>
  );
}

function StepBalance() {
  return (
    <Card title="Discussion Balance Check" defaultOpen>
      <Metric label="Recall arguments" value="3" />
      <Metric label="No recall arguments" value="3" />
      <Metric label="Junior contribution" value="Recorded" />
      <Metric label="AI anchoring risk" value="Moderate" />
      <Callout icon={<AlertTriangle size={16} />}>
        Prompt: ask whether the no-recall position has been fully explored before finalising.
      </Callout>
    </Card>
  );
}

function StepFinal() {
  return (
    <Card title="Final Arbitration Decision" defaultOpen>
      <div className="grid grid-cols-2 gap-2">
        <button className="rounded border border-[#124BCE] bg-[#124BCE] px-3 py-3 text-sm font-bold text-white">Recall</button>
        <button className="rounded border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-white/60">No Recall</button>
      </div>
      <div className="mt-4 rounded border border-white/10 bg-black p-3">
        <p className="text-xs font-semibold uppercase text-white/42">Recorded rationale</p>
        <p className="mt-2 text-sm leading-6 text-white/76">
          Recall selected after balanced review of reader disagreement, prior comparison need, and AI-marked subtle asymmetry.
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge>AI-human disagreement</Badge>
        <Badge>Dense breast</Badge>
        <Badge>Potential AI influence reviewed</Badge>
      </div>
    </Card>
  );
}

function StepReceipt({ sentToLibrary, setSentToLibrary }) {
  return (
    <Card title="Learning Receipt" defaultOpen>
      <Timeline
        items={[
          "Human views recorded independently",
          "AI evidence introduced in layers",
          "Disagreement and bias risks captured",
          "Final arbitration decision: Recall",
          "Learning case ready for library",
        ]}
      />
      <button
        onClick={() => setSentToLibrary(true)}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded px-4 py-3 text-sm font-bold ${
          sentToLibrary ? "bg-white text-black" : "bg-[#124BCE] text-white"
        }`}
      >
        {sentToLibrary ? <Check size={16} /> : <BookOpen size={16} />}
        {sentToLibrary ? "Sent to Learning Case Library" : "Send to Learning Case Library"}
      </button>
    </Card>
  );
}

function FlowProgress({ step, meetingEnded }) {
  const flow = ["Case Details", "Live Meeting", "Meeting Summary"];
  const progressIndex = step === 0 ? 0 : meetingEnded ? 2 : 1;
  return (
    <div className="rounded border border-white/10 bg-black p-3">
      <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-white/40">
        <span>Review flow</span>
        <span>{progressIndex + 1} / {flow.length}</span>
      </div>
      <div className="flex gap-1">
        {flow.map((item, index) => (
          <button
            key={item}
            title={item}
            className={`h-2 flex-1 rounded-full ${index <= progressIndex ? "bg-[#124BCE]" : "bg-white/14"}`}
          />
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold text-white">{flow[progressIndex]}</p>
    </div>
  );
}

function PanelLabel({ tone, children }) {
  const isPlugin = tone === "plugin";
  return (
    <div className={`flex items-center gap-2 pt-1 text-[11px] font-bold uppercase tracking-[0.18em] ${isPlugin ? "text-[#124BCE]" : "text-white/38"}`}>
      <span className={`h-px flex-1 ${isPlugin ? "bg-[#124BCE]/55" : "bg-white/12"}`} />
      {children}
      <span className={`h-px flex-1 ${isPlugin ? "bg-[#124BCE]/55" : "bg-white/12"}`} />
    </div>
  );
}

function NativeCard({ title, defaultOpen = false, children }) {
  return (
    <CollapsibleSection
      title={title}
      defaultOpen={defaultOpen}
      className="rounded border border-white/10 bg-[#14151a] p-4"
      titleClassName="text-white/78"
    >
      {children}
    </CollapsibleSection>
  );
}

function Card({ title, defaultOpen = false, accent = false, children }) {
  if (!title) {
    return (
      <section className="rounded border border-white/10 bg-[#171820] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.3)]">
        {children}
      </section>
    );
  }

  return (
    <CollapsibleSection
      title={title}
      defaultOpen={defaultOpen}
      className={`rounded border p-4 shadow-[0_18px_48px_rgba(0,0,0,0.3)] ${
        accent ? "border-[#124BCE]/45 bg-[#171820]" : "border-white/10 bg-[#171820]"
      }`}
      titleClassName="text-white"
    >
      {children}
    </CollapsibleSection>
  );
}

function CollapsibleSection({ title, defaultOpen, className, titleClassName, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={className}>
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-3 text-left">
        <h2 className={`text-sm font-bold ${titleClassName}`}>{title}</h2>
        <ChevronDown size={16} className={`shrink-0 text-white/45 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </section>
  );
}

function EvidenceImage({ title, src }) {
  return (
    <div className="overflow-hidden rounded border border-white/10 bg-black">
      <div className="flex items-center justify-between px-2 py-1 text-[10px] font-semibold uppercase text-white/45">
        <span>{title}</span>
        <span>DICOM</span>
      </div>
      <img src={src} alt={`${title} mammogram evidence`} className="h-28 w-full object-cover" />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/10 py-2 text-sm last:border-b-0">
      <span className="text-white/45">{label}</span>
      <span className="max-w-[58%] text-right font-semibold text-white/88">{value}</span>
    </div>
  );
}

function Badge({ children }) {
  return <span className="inline-flex rounded border border-[#124BCE]/45 bg-[#124BCE]/12 px-2 py-1 text-xs font-bold text-white">{children}</span>;
}

function Timeline({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item} className="flex gap-3">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#124BCE] text-xs font-bold text-white">{index + 1}</div>
          <p className="pt-1 text-sm leading-5 text-white/72">{item}</p>
        </div>
      ))}
    </div>
  );
}

function Compare({ label, left, right }) {
  return (
    <div className="rounded border border-white/10 bg-black p-3">
      <p className="text-xs font-semibold uppercase text-white/42">{label}</p>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <span className="text-white/60">{left}</span>
        <ChevronRight size={14} className="text-[#124BCE]" />
        <span className="font-semibold text-white">{right}</span>
      </div>
    </div>
  );
}

function MiniField({ label, value }) {
  return (
    <div className="rounded border border-white/10 bg-black p-2">
      <p className="text-[10px] font-semibold uppercase text-white/35">{label}</p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="mt-2 rounded border border-white/10 bg-black p-3">
      <p className="text-[10px] font-semibold uppercase text-white/35">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function Toggle({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`rounded border px-3 py-2 text-xs font-bold ${active ? "border-[#124BCE] bg-[#124BCE] text-white" : "border-white/10 bg-white/5 text-white/60"}`}
    >
      {label}
    </button>
  );
}

function ReasonColumn({ title, items }) {
  return (
    <div className="mb-3 rounded border border-white/10 bg-black p-3">
      <h3 className="text-sm font-bold">{title}</h3>
      <ul className="mt-2 space-y-2 text-sm text-white/65">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function Callout({ icon, children }) {
  return (
    <div className="mt-4 flex gap-2 rounded border border-[#124BCE]/45 bg-[#124BCE]/10 p-3 text-sm leading-6 text-white/78">
      <span className="mt-1 text-[#124BCE]">{icon}</span>
      <p>{children}</p>
    </div>
  );
}

function IconButton({ active = false, label, children }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`grid h-8 w-8 place-items-center rounded border ${active ? "border-[#124BCE] bg-[#124BCE] text-white" : "border-white/10 bg-white/5 text-white/58"}`}
    >
      {children}
    </button>
  );
}

export default App;
