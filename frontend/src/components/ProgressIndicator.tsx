interface ProgressIndicatorProps {
  currentStep: number;
}

const steps = [
  'System Info',
  'Material Influence',
  'Profiling Check',
  'Filter Assessment',
  'Results'
];

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  return (
    <div className="progress-bar">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        return (
          <div
            key={stepNum}
            className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
          >
            <div className="progress-step-circle">
              {isCompleted ? '✓' : stepNum}
            </div>
            <span className="progress-step-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
