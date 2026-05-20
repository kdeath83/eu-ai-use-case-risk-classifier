Build an AI Risk Classification Scanner web application for EU AI Act compliance.

TECH STACK: React + TypeScript frontend, Node.js/Express backend. Use Vite for the frontend build.

WHAT IT DOES:
The tool helps EU Financial Services Institutions (FSIs) determine if their AI system is 'high-risk' under the EU AI Act Article 6 draft guidelines (May 2026).

CORE FEATURES:
1. SYSTEM INPUT FORM: Users paste/upload:
   - System name, description, intended purpose
   - Marketing materials, terms of service text
   - Technical specs (autonomy level, data inputs, outputs)
   - Target sector (dropdown: biometrics, critical infrastructure, education, employment, essential services, law enforcement, migration, justice/democratic processes, none)

2. ANNEX III CLASSIFICATION ENGINE:
   - Parse natural language descriptions against the 8 Annex III sectoral use cases
   - Score match confidence for each use case (0-100%)
   - Flag when 'intended purpose' construction suggests high-risk (broad marketing = deemed high-risk per para 12)
   - Identify if the system is a 'safety component' under Annex I (product safety)

3. MATERIAL INFLUENCE SCORER:
   - Questionnaire: Does the system make autonomous decisions? Does a human review? Can the human override?
   - Score: 0-100 (0 = purely preparatory/procedural, 100 = fully autonomous outcome determination)
   - Flag if score > threshold suggesting 'material influence' on outcomes

4. PROFILING DETECTOR:
   - Check if system processes personal data to 'evaluate aspects' of natural persons (GDPR Art 4(4) cross-check)
   - Flag: performance at work, economic situation, health, preferences, interests, reliability, behaviour, location/movements
   - Absolute red flag: if profiling detected, filter mechanism is inapplicable

5. ARTICLE 6(3) FILTER WIZARD:
   - Decision tree through the 5 filter conditions
   - Gatekeeper: does system materially influence outcome?
   - Alternative conditions: narrow procedural task, improves completed human activity, detects decision-making patterns, preparatory task
   - Output: Likely exempt / Borderline / Likely high-risk

6. CLASSIFICATION REPORT:
   - Summary: High-risk / Not high-risk / Borderline
   - Rationale export (JSON format suitable for EU database registration under Article 6(4))
   - Evidence summary: which Annex III points triggered, why material influence test passed/failed, profiling status

DESIGN:
- Clean, professional UI (like a compliance dashboard)
- Dark blue header (#0D3360)
- White cards with subtle shadows
- Progress indicator through the assessment steps
- Results page with color-coded risk levels (green/amber/red)

When completely finished, create a README.md with setup instructions.