// checkinService.js — the AI half of the Wellness Check-In feature.
// Same Gemini client and API key as aiScreeningService.js (Phase 4) — no
// new integration pattern, just a different prompt and a different
// consumer of the result.
//
// Unlike post screening (which is fire-and-forget, since a post is already
// live by the time it runs), a check-in is awaited: the user is on a
// journaling screen waiting for a reflection back, so this call sits in
// the request/response cycle rather than running in the background.

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Ask for strict JSON back so we can reliably separate "is this safe?"
// from "what should we say?" in one call, instead of two round-trips.
const CHECKIN_PROMPT = `You are a supportive, bounded wellness journaling companion for a mental health platform. A user has submitted a free-text journal entry.

Respond with ONLY valid JSON, no other text, in exactly this shape:
{"classification": "safe" or "crisis", "reflection": "..."}

Rules for "classification":
- "crisis": the entry suggests the person may be in immediate danger (suicidal ideation, self-harm intent, an active emergency)
- "safe": everything else, including entries expressing sadness, stress, grief, or difficulty that do NOT indicate immediate danger

Rules for "reflection":
- If classification is "safe": write a short (2-4 sentence), warm, validating reflection in second person. Do NOT give advice. Do NOT suggest treatments, coping techniques, or next steps. Do NOT diagnose or name any condition. Just acknowledge and gently reflect back what they shared.
- If classification is "crisis": set reflection to an empty string "" — a fixed safety message is shown instead of your text, never your own words, for entries in this category.

Journal entry:
"""
{{CONTENT}}
"""`;

// Shown to the user instead of any AI-generated text whenever an entry is
// classified as crisis, OR whenever classification fails outright (fail
// safe: if we can't confirm it's safe, treat it as needing a human).
const CRISIS_SAFETY_MESSAGE =
  "Thank you for sharing this. What you're going through sounds really hard, and you deserve support beyond a journal entry. Please reach out to one of the emergency helplines, or start a conversation with one of our professionals — you don't have to go through this alone.";

async function reflectOnCheckin(content) {
  try {
    const prompt = CHECKIN_PROMPT.replace('{{CONTENT}}', content);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    // Models sometimes wrap JSON in ```json fences despite instructions —
    // strip those defensively before parsing.
    const cleaned = raw.replace(/^```json\s*|```$/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (parsed.classification === 'crisis') {
      return { classification: 'crisis', reflection: CRISIS_SAFETY_MESSAGE };
    }
    if (parsed.classification === 'safe' && typeof parsed.reflection === 'string' && parsed.reflection.trim()) {
      return { classification: 'safe', reflection: parsed.reflection.trim() };
    }

    // Unexpected shape — fail safe, same principle as aiScreeningService's
    // "default to harmful" fallback: if we can't trust the parse, route it
    // to a human rather than silently showing possibly-wrong AI text.
    console.warn(`Unexpected check-in AI response, defaulting to crisis-safe path: ${raw}`);
    return { classification: null, reflection: CRISIS_SAFETY_MESSAGE };
  } catch (err) {
    console.error('Check-in AI reflection failed:', err.message);
    return { classification: null, reflection: CRISIS_SAFETY_MESSAGE };
  }
}

module.exports = { reflectOnCheckin, CRISIS_SAFETY_MESSAGE };
