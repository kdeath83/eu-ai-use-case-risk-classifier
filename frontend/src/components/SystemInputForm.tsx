import { useState, FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';

interface SystemInputFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

const sectors = [
  { value: 'none', label: 'None / Not sure' },
  { value: 'biometrics', label: 'Biometrics' },
  { value: 'critical_infrastructure', label: 'Critical Infrastructure' },
  { value: 'education', label: 'Education & Vocational Training' },
  { value: 'employment', label: 'Employment & Workers' },
  { value: 'essential_services', label: 'Essential Services & Benefits' },
  { value: 'law_enforcement', label: 'Law Enforcement' },
  { value: 'migration', label: 'Migration & Border Control' },
  { value: 'justice_democratic', label: 'Justice & Democratic Processes' },
];

const autonomyLevels = [
  { value: 'none', label: 'No autonomy (pure tool)' },
  { value: 'low', label: 'Low (assists human)' },
  { value: 'medium', label: 'Medium (recommends, human decides)' },
  { value: 'high', label: 'High (decides, human reviews)' },
  { value: 'full', label: 'Full (fully autonomous)' },
];

export default function SystemInputForm({ onSubmit, initialData }: SystemInputFormProps) {
  const [formData, setFormData] = useState({
    systemName: initialData?.systemName || '',
    description: initialData?.description || '',
    intendedPurpose: initialData?.intendedPurpose || '',
    marketingMaterials: initialData?.marketingMaterials || '',
    termsOfService: initialData?.termsOfService || '',
    technicalSpecs: initialData?.technicalSpecs || '',
    targetSector: initialData?.targetSector || 'none',
    autonomyLevel: initialData?.autonomyLevel || 'medium',
    humanReview: initialData?.humanReview ?? true,
    humanOverride: initialData?.humanOverride ?? true,
    personalDataProcessed: initialData?.personalDataProcessed ?? false,
    dataInputs: initialData?.dataInputs || [] as string[],
    outputs: initialData?.outputs || [] as string[],
  });

  const [dataInputTag, setDataInputTag] = useState('');
  const [outputTag, setOutputTag] = useState('');

  const addTag = (field: 'dataInputs' | 'outputs', value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
  };

  const removeTag = (field: 'dataInputs' | 'outputs', index: number) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_item: string, i: number) => i !== index) }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card">
        <h3 className="card-title">System Information</h3>
        
        <div className="form-group">
          <label className="form-label">System Name *</label>
          <input
            className="form-input"
            value={formData.systemName}
            onChange={e => setFormData(prev => ({ ...prev, systemName: e.target.value }))}
            placeholder="e.g., Credit Risk Scoring Engine v2"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea
            className="form-textarea"
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what the system does, its inputs, and outputs..."
            required
            maxLength={10000}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Intended Purpose *</label>
          <textarea
            className="form-textarea"
            value={formData.intendedPurpose}
            onChange={e => setFormData(prev => ({ ...prev, intendedPurpose: e.target.value }))}
            placeholder="What is the system intended to be used for?"
            required
            maxLength={10000}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Marketing Materials (optional)</label>
          <textarea
            className="form-textarea"
            value={formData.marketingMaterials}
            onChange={e => setFormData(prev => ({ ...prev, marketingMaterials: e.target.value }))}
            placeholder="Paste marketing copy, sales descriptions, or website text..."
            maxLength={10000}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Terms of Service (optional)</label>
          <textarea
            className="form-textarea"
            value={formData.termsOfService}
            onChange={e => setFormData(prev => ({ ...prev, termsOfService: e.target.value }))}
            placeholder="Paste relevant ToS clauses..."
            maxLength={10000}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Technical Specifications (optional)</label>
          <textarea
            className="form-textarea"
            value={formData.technicalSpecs}
            onChange={e => setFormData(prev => ({ ...prev, technicalSpecs: e.target.value }))}
            placeholder="Paste technical documentation, architecture notes, or system specs..."
            maxLength={10000}
          />
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Technical Configuration</h3>

        <div className="form-group">
          <label className="form-label">Target Sector</label>
          <select
            className="form-select"
            value={formData.targetSector}
            onChange={e => setFormData(prev => ({ ...prev, targetSector: e.target.value }))}
          >
            {sectors.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Autonomy Level</label>
          <select
            className="form-select"
            value={formData.autonomyLevel}
            onChange={e => setFormData(prev => ({ ...prev, autonomyLevel: e.target.value }))}
          >
            {autonomyLevels.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Data Inputs</label>
          <div className="tag-container">
            {formData.dataInputs.map((tag: string, i: number) => (
              <span key={i} className="tag">
                {tag}
                <span className="tag-remove" onClick={() => removeTag('dataInputs', i)}>×</span>
              </span>
            ))}
            <input
              className="tag-input"
              value={dataInputTag}
              onChange={e => setDataInputTag(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('dataInputs', dataInputTag);
                  setDataInputTag('');
                }
              }}
              placeholder="Add input type (press Enter)"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Outputs</label>
          <div className="tag-container">
            {formData.outputs.map((tag: string, i: number) => (
              <span key={i} className="tag">
                {tag}
                <span className="tag-remove" onClick={() => removeTag('outputs', i)}>×</span>
              </span>
            ))}
            <input
              className="tag-input"
              value={outputTag}
              onChange={e => setOutputTag(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('outputs', outputTag);
                  setOutputTag('');
                }
              }}
              placeholder="Add output type (press Enter)"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.humanReview}
              onChange={e => setFormData(prev => ({ ...prev, humanReview: e.target.checked }))}
            />
            Human review required
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.humanOverride}
              onChange={e => setFormData(prev => ({ ...prev, humanOverride: e.target.checked }))}
            />
            Human can override
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.personalDataProcessed}
              onChange={e => setFormData(prev => ({ ...prev, personalDataProcessed: e.target.checked }))}
            />
            Processes personal data
          </label>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <div />
        <button type="submit" className="btn btn-primary">
          Next <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
}
