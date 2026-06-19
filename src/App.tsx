import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Info,
  Moon,
  Radio,
  Search,
  ShieldCheck,
  Sun,
  Users,
  X,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type Decision = "recall" | "noRecall" | "review";
type BiasAnswer = "Yes" | "No" | "Not sure";

type Radiologist = {
  id: string;
  name: string;
  role: string;
  expertise: string;
  initials: string;
  recommended: boolean;
};

type ParticipantDecision = {
  decision: Decision;
  reason: string;
};

const BLUE = "#124BCE";

const stepNames: Record<Step, string> = {
  1: "Pre-meeting briefing",
  2: "Select arbitration panel",
  3: "Confirm meeting setup",
  4: "Silent review",
  5: "Participant opinions",
  6: "Reveal AI",
  7: "Evidence review",
  8: "Bias check",
  9: "Final decision",
  10: "Meeting summary",
};

const mammograms = [
  { id: "L-CC", src: "/assets/mammo-l-cc.png", label: "L-CC" },
  { id: "L-MLO", src: "/assets/mammo-l-mlo.png", label: "L-MLO" },
  { id: "R-CC", src: "/assets/mammo-r-cc.png", label: "R-CC" },
  { id: "R-MLO", src: "/assets/mammo-r-mlo.png", label: "R-MLO" },
];

const caseMeta = "Case BS-V000254 · Session 1 of 10 · Age 72";

const caseDetails = [
  ["Case ID", "Case 017"],
  ["Screening context", "Routine breast screening"],
  ["Breast density", "Dense breast"],
  ["Prior image", "Available"],
  ["Arbitration question", "Should this patient be recalled?"],
  ["Disagreement trigger", "AI marked subtle asymmetry"],
];

const timeline = [
  ["Human judgement", "Reader 1: No recall", "Recorded before AI reveal"],
  ["AI reader result", "AI: Recall suggested", "Revealed after lock"],
  ["Reader 1 after AI", "No recall", "Further review"],
];

const radiologists: Radiologist[] = [
  { id: "morris", name: "Dr. Helen Morris", role: "Consultant Radiologist", expertise: "Prior comparison", initials: "HM", recommended: true },
  { id: "grant", name: "Dr. Olivia Grant", role: "Senior Arbitrator", expertise: "Arbitration lead", initials: "OG", recommended: true },
  { id: "nair", name: "Dr. Priya Nair", role: "Dense Breast Specialist", expertise: "Dense breast", initials: "PN", recommended: true },
  { id: "bennett", name: "Dr. Lucy Bennett", role: "AI Evaluation Lead", expertise: "AI safety", initials: "LB", recommended: true },
  { id: "shah", name: "Dr. Amir Shah", role: "Breast Screening Reader", expertise: "Screening recall", initials: "AS", recommended: false },
  { id: "patel", name: "Dr. James Patel", role: "Breast Imaging Specialist", expertise: "Architectural distortion", initials: "JP", recommended: false },
  { id: "collins", name: "Dr. Maya Collins", role: "Screening Programme Reader", expertise: "Programme QA", initials: "MC", recommended: false },
  { id: "evans", name: "Dr. Sarah Evans", role: "Consultant Radiologist", expertise: "Assessment", initials: "SE", recommended: false },
  { id: "wright", name: "Dr. Daniel Wright", role: "Clinical Governance Lead", expertise: "Governance", initials: "DW", recommended: false },
  { id: "carter", name: "Dr. Emily Carter", role: "Quality Assurance Reader", expertise: "Learning cases", initials: "EC", recommended: false },
];

const decisionCopy: Record<Decision, string> = {
  recall: "Recall",
  noRecall: "No recall",
  review: "Need further review",
};

const defaultReasons: Record<Decision, string> = {
  recall: "Subtle asymmetry requires assessment",
  noRecall: "Stable compared with prior",
  review: "Need focused comparison before finalising",
};

const biasQuestions = [
  ["Automation bias", "Are we accepting AI mainly because confidence is high?"],
  ["Algorithm aversion", "Are we rejecting AI mainly because it is AI?"],
  ["Anchoring bias", "Was AI revealed after initial human review?"],
  ["Evidence balance", "Has image evidence been reviewed before final decision?"],
  ["Decision change", "Did anyone change their view after seeing AI?"],
];

function App() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(["morris", "grant", "nair"]);
  const [speakerIndex, setSpeakerIndex] = useState(0);
  const [participantDecisions, setParticipantDecisions] = useState<Record<string, ParticipantDecision>>({});
  const [decisionTarget, setDecisionTarget] = useState<Radiologist | null>(null);
  const [infoDrawerOpen, setInfoDrawerOpen] = useState(false);
  const [openDrawerSections, setOpenDrawerSections] = useState<Record<string, boolean>>({
    details: true,
    evidence: true,
    timeline: true,
    disagreement: true,
  });
  const [biasIndex, setBiasIndex] = useState(0);
  const [biasAnswers, setBiasAnswers] = useState<Record<number, BiasAnswer>>({});
  const [finalDecision, setFinalDecision] = useState({
    decision: "Recall for assessment",
    side: "Left",
    finding: "Focal asymmetry",
    basis: "Combined interpretation",
    confidence: "Medium",
    note: "",
  });
  const [showMammogramImages, setShowMammogramImages] = useState(true);

  const selectedRadiologists = useMemo(
    () => radiologists.filter((doctor) => selectedIds.includes(doctor.id)),
    [selectedIds],
  );

  const activeSpeaker = selectedRadiologists[speakerIndex] ?? selectedRadiologists[0];
  const allOpinionsCaptured = selectedRadiologists.every((doctor) => participantDecisions[doctor.id]);
  const showAi = currentStep >= 6;
  const isMeetingStep = currentStep >= 4 && currentStep <= 9;

  function goToStep(step: Step) {
    setCurrentStep(step);
    if (step === 4) {
      setSpeakerIndex(0);
    }
  }

  function nextStep() {
    if (currentStep < 10) {
      goToStep((currentStep + 1) as Step);
    }
  }

  function previousStep() {
    if (currentStep > 1) {
      goToStep((currentStep - 1) as Step);
    }
  }

  function toggleRadiologist(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function saveDecision(doctorId: string, decision: Decision, reason: string) {
    const nextDecisions = {
      ...participantDecisions,
      [doctorId]: { decision, reason: reason || defaultReasons[decision] },
    };
    setParticipantDecisions((current) => ({
      ...current,
      [doctorId]: { decision, reason: reason || defaultReasons[decision] },
    }));
    const nextMissingIndex = selectedRadiologists.findIndex((doctor) => !nextDecisions[doctor.id]);
    if (nextMissingIndex >= 0) {
      setSpeakerIndex(nextMissingIndex);
    }
    setDecisionTarget(null);
  }

  function nextSpeakerOrReveal() {
    if (activeSpeaker && !participantDecisions[activeSpeaker.id]) {
      setDecisionTarget(activeSpeaker);
      return;
    }

    const nextMissingIndex = selectedRadiologists.findIndex((doctor, index) => index > speakerIndex && !participantDecisions[doctor.id]);
    if (nextMissingIndex >= 0) {
      setSpeakerIndex(nextMissingIndex);
      return;
    }

    const anyMissingIndex = selectedRadiologists.findIndex((doctor) => !participantDecisions[doctor.id]);
    if (anyMissingIndex >= 0) {
      setSpeakerIndex(anyMissingIndex);
      return;
    }

    if (allOpinionsCaptured) {
      goToStep(6);
    }
  }

  function answerBias(answer: BiasAnswer) {
    setBiasAnswers((current) => ({ ...current, [biasIndex]: answer }));
    if (biasIndex < biasQuestions.length - 1) {
      setBiasIndex((index) => index + 1);
    }
  }

  const themeClass = darkMode ? "theme-dark" : "theme-light";

  return (
    <div className={`workflow-app ${themeClass}`}>
      <div className="top-hover-zone" aria-hidden="true" />
      <AppHeader currentStep={currentStep} darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className={`step-frame ${isMeetingStep ? "meeting-frame" : ""}`}>
        <div className="step-transition" key={currentStep}>
          {currentStep === 1 && <BriefingStep />}
          {currentStep === 2 && <PanelStep selectedIds={selectedIds} selectedRadiologists={selectedRadiologists} toggleRadiologist={toggleRadiologist} />}
          {currentStep === 3 && <ConfirmStep selectedRadiologists={selectedRadiologists} />}
          {currentStep >= 4 && currentStep <= 6 && (
            <MeetingStep
              step={currentStep}
              selectedRadiologists={selectedRadiologists}
              participantDecisions={participantDecisions}
              activeSpeaker={activeSpeaker}
              speakerIndex={speakerIndex}
              setDecisionTarget={setDecisionTarget}
              showAi={showAi}
              showMammogramImages={showMammogramImages}
              setShowMammogramImages={setShowMammogramImages}
              openDrawer={() => setInfoDrawerOpen(true)}
            />
          )}
          {currentStep === 7 && <EvidenceStep showAi={showAi} />}
          {currentStep === 8 && <BiasStep biasIndex={biasIndex} biasAnswers={biasAnswers} answerBias={answerBias} />}
          {currentStep === 9 && <FinalDecisionStep finalDecision={finalDecision} setFinalDecision={setFinalDecision} />}
          {currentStep === 10 && (
            <SummaryStep
              selectedRadiologists={selectedRadiologists}
              participantDecisions={participantDecisions}
              finalDecision={finalDecision}
              setCurrentStep={setCurrentStep}
            />
          )}
        </div>
      </main>

      <BottomBar
        currentStep={currentStep}
        selectedCount={selectedRadiologists.length}
        allOpinionsCaptured={allOpinionsCaptured}
        finalNoteReady={finalDecision.note.trim().length > 0}
        previousStep={previousStep}
        nextStep={nextStep}
        setCurrentStep={setCurrentStep}
        nextSpeakerOrReveal={nextSpeakerOrReveal}
      />

      {isMeetingStep && (
        <button className="floating-info" onClick={() => setInfoDrawerOpen(true)}>
          <Info size={18} />
          <span>Case pack</span>
        </button>
      )}

      <InfoDrawer
        open={infoDrawerOpen}
        onClose={() => setInfoDrawerOpen(false)}
        openSections={openDrawerSections}
        setOpenSections={setOpenDrawerSections}
      />

      {decisionTarget && (
        <DecisionChooser
          doctor={decisionTarget}
          onClose={() => setDecisionTarget(null)}
          onSave={saveDecision}
        />
      )}
    </div>
  );
}

function AppHeader({ currentStep, darkMode, setDarkMode }: { currentStep: Step; darkMode: boolean; setDarkMode: (value: boolean) => void }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <span className="brand-dot">124</span>
        <div>
          <strong>124BCE Arbitration Meeting</strong>
          <small>{caseMeta}</small>
        </div>
      </div>

      <div className="step-status">
        <span>Step {currentStep} of 10</span>
        <strong>{stepNames[currentStep]}</strong>
        <div className="progress-track">
          <i style={{ width: `${currentStep * 10}%` }} />
        </div>
      </div>

      <div className="header-actions">
        <button className="mode-button" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          {darkMode ? "Light" : "Night"}
        </button>
      </div>
    </header>
  );
}

function BriefingStep() {
  return (
    <section className="briefing-layout">
      <div className="briefing-main">
        <StepTitle eyebrow="Pre-meeting briefing" title="Review the case pack before arbitration." subtitle="The team sees the clinical question, human judgement, AI result, and historical evidence before entering the meeting." />
        <div className="question-banner">
          <AlertTriangle size={18} />
          <span>Meeting question</span>
          <strong>Should this patient be recalled?</strong>
        </div>
        <BriefingPack />
      </div>

      <aside className="case-preview">
        <div className="preview-image">
          <img src="/assets/mammo-l-cc.png" alt="Current mammogram evidence" />
          <span>L-CC current</span>
        </div>
        <div className="preview-note">
          <strong>High-confidence AI positive vs human negative</strong>
          <p>Reader 1 recorded no recall before AI reveal. AI suggested recall with high confidence.</p>
        </div>
      </aside>
    </section>
  );
}

function BriefingPack() {
  return (
    <div className="briefing-pack">
      <ClinicalModule title="Case Details">
        <InfoGrid rows={caseDetails} />
      </ClinicalModule>
      <ClinicalModule title="Historical Evidence">
        <div className="evidence-pair">
          <EvidenceThumb title="Current" src="/assets/mammo-l-cc.png" />
          <EvidenceThumb title="Prior" src="/assets/mammo-l-mlo.png" />
        </div>
        <p className="clinical-note">Prior screen available from 2023-01-18.</p>
        <p className="clinical-note">Dense tissue limits immediate certainty; prior comparison is required before final discussion.</p>
      </ClinicalModule>
      <ClinicalModule title="Decision Timeline">
        <div className="timeline-list">
          {timeline.map(([label, left, right]) => (
            <div className="timeline-item" key={label}>
              <span>{label}</span>
              <strong>{left}</strong>
              <ChevronRight size={14} />
              <em>{right}</em>
            </div>
          ))}
        </div>
        <div className="amber-note">Potential AI influence detected</div>
      </ClinicalModule>
      <ClinicalModule title="Disagreement Type Summary">
        <div className="disagreement-summary">
          <strong>High-confidence AI positive vs human negative</strong>
          <p>Reader 1 recorded no recall before AI reveal. The AI reader suggested recall with high confidence, creating an arbitration trigger.</p>
        </div>
      </ClinicalModule>
    </div>
  );
}

function PanelStep({
  selectedIds,
  selectedRadiologists,
  toggleRadiologist,
}: {
  selectedIds: string[];
  selectedRadiologists: Radiologist[];
  toggleRadiologist: (id: string) => void;
}) {
  const recommended = radiologists.filter((doctor) => doctor.recommended);
  const available = radiologists.filter((doctor) => !doctor.recommended);
  return (
    <section className="panel-step">
      <StepTitle eyebrow="Select panel" title="Choose the arbitration participants." subtitle="This behaves like selecting meeting attendees, with recommended readers separated from the full available pool." />
      <DoctorGroup title="Recommended for this case" doctors={recommended} selectedIds={selectedIds} toggleRadiologist={toggleRadiologist} featured />
      <DoctorGroup title="Available radiologists" doctors={available} selectedIds={selectedIds} toggleRadiologist={toggleRadiologist} />
      <div className="selected-strip">
        <div className="avatar-stack">
          {selectedRadiologists.map((doctor) => <Avatar key={doctor.id} doctor={doctor} />)}
        </div>
        <strong>{selectedRadiologists.length} radiologists selected</strong>
      </div>
    </section>
  );
}

function DoctorGroup({
  title,
  doctors,
  selectedIds,
  toggleRadiologist,
  featured = false,
}: {
  title: string;
  doctors: Radiologist[];
  selectedIds: string[];
  toggleRadiologist: (id: string) => void;
  featured?: boolean;
}) {
  return (
    <section className="doctor-group">
      <h2>{title}</h2>
      <div className={featured ? "recommended-doctors" : "available-doctors"}>
        {doctors.map((doctor) => {
          const selected = selectedIds.includes(doctor.id);
          return (
            <button className={`doctor-row ${featured ? "featured" : ""} ${selected ? "selected" : ""}`} key={doctor.id} onClick={() => toggleRadiologist(doctor.id)}>
              <Avatar doctor={doctor} />
              <span>
                <strong>{doctor.name}</strong>
                <small>{doctor.role}</small>
              </span>
              <em>{doctor.expertise}</em>
              {selected && <Check size={18} />}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ConfirmStep({ selectedRadiologists }: { selectedRadiologists: Radiologist[] }) {
  return (
    <section className="confirm-grid">
      <StepTitle eyebrow="Confirm setup" title="Ready to enter structured arbitration." subtitle="AI evidence will remain hidden until after initial human review." />
      <div className="setup-panel">
        <SetupRow label="Case" value={caseMeta} />
        <SetupRow label="Meeting mode" value="Structured arbitration" />
        <SetupRow label="AI analysis" value="Hidden until reveal" />
        <SetupRow label="Reasoning capture" value="On" />
      </div>
      <div className="setup-panel">
        <h2>Selected panel members</h2>
        <div className="confirm-members">
          {selectedRadiologists.map((doctor) => (
            <div key={doctor.id}>
              <Avatar doctor={doctor} />
              <span>{doctor.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MeetingStep({
  step,
  selectedRadiologists,
  participantDecisions,
  activeSpeaker,
  speakerIndex,
  setDecisionTarget,
  showAi,
  showMammogramImages,
  setShowMammogramImages,
  openDrawer,
}: {
  step: Step;
  selectedRadiologists: Radiologist[];
  participantDecisions: Record<string, ParticipantDecision>;
  activeSpeaker: Radiologist;
  speakerIndex: number;
  setDecisionTarget: (doctor: Radiologist) => void;
  showAi: boolean;
  showMammogramImages: boolean;
  setShowMammogramImages: (value: boolean) => void;
  openDrawer: () => void;
}) {
  const showSpeaker = step === 5;
  return (
    <section className="meeting-room">
      <div className="meeting-topbar">
        <div>
          <strong>Case BS-V000254</strong>
          <span>Arbitration Meeting</span>
        </div>
        <div>
          <span>Step {step} of 10 · {stepNames[step]}</span>
          <span>Elapsed 10:08</span>
        </div>
      </div>

      <div className="shared-stage">
        <button className="inline-info" onClick={openDrawer}><Info size={16} /> Briefing</button>
        <div className="recording-float"><i /> Reasoning capture active</div>
        <button className="image-visibility-toggle" onClick={() => setShowMammogramImages(!showMammogramImages)}>
          {showMammogramImages ? "Hide mammogram" : "Show mammogram"}
        </button>
        <MammogramGrid showAi={showAi} showImages={showMammogramImages} />
        {showSpeaker && activeSpeaker && (
          <div className="speaking-bubble">
            <span><Radio size={18} /></span>
            <div>
              <strong>{activeSpeaker.name} is speaking</strong>
              <small>Participant {speakerIndex + 1} of {selectedRadiologists.length}</small>
            </div>
          </div>
        )}
        {showAi && <div className="ai-reveal-note">AI analysis revealed after initial human review to reduce anchoring bias.</div>}
      </div>

      <div className="participant-strip">
        {selectedRadiologists.map((doctor) => (
          <ParticipantCard
            key={doctor.id}
            doctor={doctor}
            decision={participantDecisions[doctor.id]}
            speaking={showSpeaker && activeSpeaker?.id === doctor.id && !participantDecisions[doctor.id]}
            onClick={() => setDecisionTarget(doctor)}
          />
        ))}
        <AiCard showAi={showAi} />
      </div>
    </section>
  );
}

function MammogramGrid({ showAi, showImages = true }: { showAi: boolean; showImages?: boolean }) {
  return (
    <div className="mammogram-grid">
      {mammograms.map((image, index) => (
        <div className="mammo-cell" key={image.id}>
          {showImages ? (
            <img src={image.src} alt={`${image.label} mammogram`} />
          ) : (
            <div className="mammogram-hidden">
              <Search size={22} />
              <strong>Image hidden</strong>
            </div>
          )}
          <span>{image.label}</span>
          {showImages && index === 0 && <div className="human-marker" />}
          {showImages && index === 0 && showAi && <div className="ai-heatmap" />}
        </div>
      ))}
    </div>
  );
}

function ParticipantCard({ doctor, decision, speaking, onClick }: { doctor: Radiologist; decision?: ParticipantDecision; speaking: boolean; onClick: () => void }) {
  return (
    <button className={`participant-card ${speaking ? "speaking" : ""} ${decision ? "made" : "waiting"}`} onClick={onClick}>
      <Avatar doctor={doctor} speaking={speaking} />
      <span>
        <strong>{doctor.name}</strong>
        {decision ? (
          <>
            <DecisionPill decision={decision.decision} />
            <small>{decision.reason}</small>
          </>
        ) : (
          <small>{speaking ? "Speaking now" : "Waiting for input"}</small>
        )}
      </span>
    </button>
  );
}

function AiCard({ showAi }: { showAi: boolean }) {
  return (
    <article className={`participant-card ai ${showAi ? "made" : "waiting"}`}>
      <span className="ai-avatar"><BrainCircuit size={18} /></span>
      <span>
        <strong>AI system</strong>
        {showAi ? (
          <>
            <DecisionPill decision="recall" />
            <small>87% · Possible architectural distortion</small>
          </>
        ) : (
          <small>Hidden until reveal AI</small>
        )}
      </span>
    </article>
  );
}

function EvidenceStep({ showAi }: { showAi: boolean }) {
  return (
    <section className="evidence-step">
      <StepTitle eyebrow="Evidence review" title="Review the concern before bias check." subtitle="Evidence is ordered from primary concern to supporting human, AI, and context details." />
      <div className="evidence-workspace">
        <div className="primary-concern">
          <p>Primary concern</p>
          <h2>Possible focal asymmetry</h2>
          <span>Dense breast tissue · prior comparison required</span>
        </div>
        <ClinicalModule title="Human evidence">
          <p className="clinical-note">Reader 1 recorded no recall before AI reveal. Reader 1 after AI: no recall to further review.</p>
          <EvidenceThumb title="Current mammogram evidence" src="/assets/mammo-l-cc.png" />
        </ClinicalModule>
        <ClinicalModule title="AI evidence">
          <p className="clinical-note">{showAi ? "AI reader result: Recall suggested. High confidence. Finding type: focal asymmetry." : "AI analysis remains hidden until reveal."}</p>
          <div className="mini-ai-view"><MammogramGrid showAi={showAi} /></div>
        </ClinicalModule>
        <ClinicalModule title="Context evidence">
          <p className="clinical-note">Prior screen available from 2023-01-18. Dense tissue limits immediate certainty; prior comparison is required before final discussion.</p>
        </ClinicalModule>
      </div>
    </section>
  );
}

function BiasStep({ biasIndex, biasAnswers, answerBias }: { biasIndex: number; biasAnswers: Record<number, BiasAnswer>; answerBias: (answer: BiasAnswer) => void }) {
  const complete = Object.keys(biasAnswers).length === biasQuestions.length;
  const [title, question] = biasQuestions[biasIndex];
  return (
    <section className="bias-step">
      <StepTitle eyebrow="Bias check" title="Check the discussion before final decision." subtitle="One bias question is shown at a time to avoid a flat checklist." />
      <div className="bias-card">
        {complete ? (
          <>
            <ShieldCheck size={38} />
            <h2>Bias check completed.</h2>
            <p>Automation bias, algorithm aversion, anchoring bias, evidence balance, and decision change have been reviewed.</p>
          </>
        ) : (
          <>
            <span>Question {biasIndex + 1} of {biasQuestions.length}</span>
            <h2>{title}</h2>
            <p>{question}</p>
            <div className="bias-buttons">
              {(["Yes", "No", "Not sure"] as BiasAnswer[]).map((answer) => (
                <button key={answer} onClick={() => answerBias(answer)}>{answer}</button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function FinalDecisionStep({
  finalDecision,
  setFinalDecision,
}: {
  finalDecision: { decision: string; side: string; finding: string; basis: string; confidence: string; note: string };
  setFinalDecision: React.Dispatch<React.SetStateAction<{ decision: string; side: string; finding: string; basis: string; confidence: string; note: string }>>;
}) {
  function update(key: keyof typeof finalDecision, value: string) {
    setFinalDecision((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="final-step">
      <StepTitle eyebrow="Final decision" title="Record the clinical decision and reasoning." subtitle="The meeting cannot end until a reasoning note is completed." />
      <div className="final-grid">
        <div className="decision-options">
          {["Recall for assessment", "Return to routine screening", "Need further review"].map((option) => (
            <button className={finalDecision.decision === option ? "active" : ""} key={option} onClick={() => update("decision", option)}>
              {option}
            </button>
          ))}
        </div>
        <div className="decision-fields">
          <TextField label="Side" value={finalDecision.side} onChange={(value) => update("side", value)} />
          <TextField label="Finding type" value={finalDecision.finding} onChange={(value) => update("finding", value)} />
          <TextField label="Decision basis" value={finalDecision.basis} onChange={(value) => update("basis", value)} />
          <TextField label="Confidence" value={finalDecision.confidence} onChange={(value) => update("confidence", value)} />
          <label className="note-field">
            <span>Reasoning note required</span>
            <textarea value={finalDecision.note} onChange={(event) => update("note", event.target.value)} placeholder="Record why this decision was made..." />
          </label>
        </div>
      </div>
    </section>
  );
}

function SummaryStep({
  selectedRadiologists,
  participantDecisions,
  finalDecision,
  setCurrentStep,
}: {
  selectedRadiologists: Radiologist[];
  participantDecisions: Record<string, ParticipantDecision>;
  finalDecision: { decision: string; basis: string; confidence: string; note: string };
  setCurrentStep: (step: Step) => void;
}) {
  return (
    <section className="summary-step">
      <div className="summary-document">
        <p className="kicker">{caseMeta}</p>
        <h1>{finalDecision.decision}</h1>
        <p className="summary-lede">{finalDecision.note || "Panel agreed that the subtle left-sided finding requires assessment."}</p>

        <SummarySection title="Why this decision was made">
          <p>Decision basis: {finalDecision.basis}. Confidence: {finalDecision.confidence}. The panel reviewed human reasoning, AI recommendation, historical evidence, and bias prompts.</p>
        </SummarySection>
        <SummarySection title="Participant opinions">
          <div className="summary-list">
            {selectedRadiologists.map((doctor) => {
              const decision = participantDecisions[doctor.id];
              return (
                <div key={doctor.id}>
                  <strong>{doctor.name}</strong>
                  <span>{decision ? decisionCopy[decision.decision] : "No final opinion recorded"}</span>
                  <em>{decision?.reason ?? "Pending"}</em>
                </div>
              );
            })}
          </div>
        </SummarySection>
        <SummarySection title="AI recommendation">
          <p>AI system: Recall · high confidence · focal asymmetry. AI was revealed after initial human review to reduce anchoring bias.</p>
        </SummarySection>
        <SummarySection title="Evidence reviewed">
          <p>Current and prior mammogram evidence, prior screen from 2023-01-18, dense breast limitation, decision timeline, and disagreement type summary.</p>
        </SummarySection>
        <SummarySection title="Bias reflection">
          <p>Automation bias, algorithm aversion, anchoring bias, evidence balance, and decision change were reviewed before finalisation.</p>
        </SummarySection>
        <SummarySection title="Follow-up actions and learning tags">
          <div className="tag-row">
            {["AI-human disagreement", "Dense breast", "Prior comparison", "Reasoning receipt"].map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </SummarySection>
      </div>
      <div className="summary-actions">
        <button onClick={() => setCurrentStep(1)}>Back to queue</button>
        <button className="primary">Send to learning library</button>
      </div>
    </section>
  );
}

function BottomBar({
  currentStep,
  selectedCount,
  allOpinionsCaptured,
  finalNoteReady,
  previousStep,
  nextStep,
  setCurrentStep,
  nextSpeakerOrReveal,
}: {
  currentStep: Step;
  selectedCount: number;
  allOpinionsCaptured: boolean;
  finalNoteReady: boolean;
  previousStep: () => void;
  nextStep: () => void;
  setCurrentStep: (step: Step) => void;
  nextSpeakerOrReveal: () => void;
}) {
  if (currentStep === 10) return null;

  let primaryLabel = "Next";
  let primaryAction = nextStep;
  let disabled = false;

  if (currentStep === 1) primaryLabel = "Next: Select panel";
  if (currentStep === 2) {
    primaryLabel = "Next: Confirm meeting";
    disabled = selectedCount === 0;
  }
  if (currentStep === 3) primaryLabel = "Enter meeting";
  if (currentStep === 4) primaryLabel = "Invite first opinion";
  if (currentStep === 5) {
    primaryLabel = allOpinionsCaptured ? "Reveal AI" : "Next speaker";
    primaryAction = nextSpeakerOrReveal;
  }
  if (currentStep === 6) primaryLabel = "Review evidence";
  if (currentStep === 7) primaryLabel = "Bias check";
  if (currentStep === 8) primaryLabel = "Final decision";
  if (currentStep === 9) {
    primaryLabel = "End meeting";
    disabled = !finalNoteReady;
    primaryAction = () => setCurrentStep(10);
  }

  return (
    <footer className="bottom-bar">
      <button className="back-button" onClick={previousStep} disabled={currentStep === 1}>
        <ArrowLeft size={17} />
        Back
      </button>
      <div>
        <span>Step {currentStep} of 10</span>
        <strong>{stepNames[currentStep]}</strong>
      </div>
      <button className="primary-button" onClick={primaryAction} disabled={disabled}>
        {primaryLabel}
        <ArrowRight size={17} />
      </button>
    </footer>
  );
}

function InfoDrawer({
  open,
  onClose,
  openSections,
  setOpenSections,
}: {
  open: boolean;
  onClose: () => void;
  openSections: Record<string, boolean>;
  setOpenSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  return (
    <div className={`drawer-layer ${open ? "open" : ""}`} aria-hidden={!open}>
      <aside className="info-drawer">
        <div className="drawer-header">
          <div>
            <strong>Meeting reference pack</strong>
            <small>{caseMeta}</small>
          </div>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <DrawerSection id="details" title="Case Details" openSections={openSections} setOpenSections={setOpenSections}>
          <InfoGrid rows={caseDetails} />
        </DrawerSection>
        <DrawerSection id="evidence" title="Historical Evidence" openSections={openSections} setOpenSections={setOpenSections}>
          <div className="evidence-pair compact">
            <EvidenceThumb title="Current" src="/assets/mammo-l-cc.png" />
            <EvidenceThumb title="Prior" src="/assets/mammo-l-mlo.png" />
          </div>
          <p className="clinical-note">Prior screen available from 2023-01-18.</p>
          <p className="clinical-note">Dense tissue limits immediate certainty; prior comparison is required before final discussion.</p>
        </DrawerSection>
        <DrawerSection id="timeline" title="Decision Timeline" openSections={openSections} setOpenSections={setOpenSections}>
          <div className="timeline-list drawer">
            {timeline.map(([label, left, right]) => (
              <div className="timeline-item" key={label}>
                <span>{label}</span>
                <strong>{left}</strong>
                <em>{right}</em>
              </div>
            ))}
          </div>
        </DrawerSection>
        <DrawerSection id="disagreement" title="Disagreement Type Summary" openSections={openSections} setOpenSections={setOpenSections}>
          <div className="disagreement-summary">
            <strong>High-confidence AI positive vs human negative</strong>
            <p>Reader 1 recorded no recall before AI reveal. The AI reader suggested recall with high confidence, creating an arbitration trigger.</p>
          </div>
        </DrawerSection>
      </aside>
      <button className="drawer-scrim" onClick={onClose} aria-label="Close case pack" />
    </div>
  );
}

function DecisionChooser({ doctor, onClose, onSave }: { doctor: Radiologist; onClose: () => void; onSave: (id: string, decision: Decision, reason: string) => void }) {
  const [decision, setDecision] = useState<Decision>("recall");
  const [reason, setReason] = useState(defaultReasons.recall);

  function choose(nextDecision: Decision) {
    setDecision(nextDecision);
    setReason(defaultReasons[nextDecision]);
  }

  return (
    <div className="modal-layer">
      <section className="decision-modal">
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        <Avatar doctor={doctor} speaking />
        <h2>{doctor.name}</h2>
        <p>Record this participant's arbitration opinion.</p>
        <div className="modal-options">
          {(["recall", "noRecall", "review"] as Decision[]).map((item) => (
            <button key={item} className={decision === item ? "active" : ""} onClick={() => choose(item)}>
              {decisionCopy[item]}
            </button>
          ))}
        </div>
        <label className="note-field">
          <span>Short reasoning</span>
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} />
        </label>
        <button className="primary-button wide" onClick={() => onSave(doctor.id, decision, reason)}>Save opinion</button>
      </section>
    </div>
  );
}

function StepTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="step-title">
      <p>{eyebrow}</p>
      <h1>{title}</h1>
      <span>{subtitle}</span>
    </div>
  );
}

function ClinicalModule({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="clinical-module">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function DrawerSection({
  id,
  title,
  children,
  openSections,
  setOpenSections,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  openSections: Record<string, boolean>;
  setOpenSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const open = openSections[id];
  return (
    <section className="drawer-section">
      <button onClick={() => setOpenSections((current) => ({ ...current, [id]: !open }))}>
        <strong>{title}</strong>
        <ChevronDown size={16} className={open ? "open" : ""} />
      </button>
      {open && <div>{children}</div>}
    </section>
  );
}

function InfoGrid({ rows }: { rows: string[][] }) {
  return (
    <div className="info-grid">
      {rows.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function EvidenceThumb({ title, src }: { title: string; src: string }) {
  return (
    <div className="evidence-thumb">
      <img src={src} alt={`${title} mammogram evidence`} />
      <span>{title}</span>
    </div>
  );
}

function SetupRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="setup-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="summary-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Avatar({ doctor, speaking = false }: { doctor: Radiologist; speaking?: boolean }) {
  return <span className={`avatar ${speaking ? "speaking" : ""}`}>{doctor.initials}</span>;
}

function DecisionPill({ decision }: { decision: Decision }) {
  return <em className={`decision-pill ${decision}`}>{decisionCopy[decision]}</em>;
}

export default App;
