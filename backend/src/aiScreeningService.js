// aiScreeningService.js — sends new post content to Gemini for
// classification (safe / harmful / crisis) and acts on the result.
//
// Why ASYNC? A post goes live immediately when created — the patient isn't
// blocked waiting on an AI API call, which could take a second or more.
// The screening happens in the background right after; if it comes back
// harmful or crisis, the post is auto-flagged for moderator review. The
// user experience isn't slowed down, but harmful content still gets caught.

const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('./config/db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SCREENING_PROMPT = `You are a content safety classifier for a mental health support forum.
Classify the following post into exactly one category:
- "safe": normal content, no concerning signals
- "harmful": spam, abuse, harassment, or clearly inappropriate content
- "crisis": content suggesting the poster may be in immediate danger (suicidal ideation, self-harm intent, medical emergency)

Respond with ONLY the single word: safe, harmful, or crisis. No other text.

Post content:
"""
{{CONTENT}}
"""`;

// The actual API call + classification logic, separated from the "what do
// we do with the result" logic below — makes this independently testable
// and swappable (e.g. mocked in tests) without touching the database logic.
async function classifyContent(content) {
  const prompt = SCREENING_PROMPT.replace('{{CONTENT}}', content);

  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim().toLowerCase();

  if (['safe', 'harmful', 'crisis'].includes(text)) {
    return text;
  }
  // If the model returns something unexpected, fail safe: treat as harmful
  // so a human reviews it, rather than silently trusting an unparseable response.
  console.warn(`Unexpected AI classification response: "${text}" — defaulting to 'harmful' for safety.`);
  return 'harmful';
}

// Called (without awaiting) right after a post is created. Runs in the
// background: updates the post's ai_classification, and if the result is
// harmful or crisis, automatically creates a flag so it surfaces in the
// moderator queue — the same queue a human-filed flag would appear in.
async function screenPost(postId, content) {
  try {
    const classification = await classifyContent(content);

    await pool.query('UPDATE posts SET ai_classification = $1 WHERE id = $2', [classification, postId]);

    if (classification === 'harmful' || classification === 'crisis') {
      await pool.query(
        `INSERT INTO flags (post_id, flagged_by, reason)
         VALUES ($1, $2, $3)`,
        [postId, null, `AI screening flagged this post as: ${classification}`]
      );
      await pool.query('UPDATE posts SET is_flagged = TRUE WHERE id = $1', [postId]);
      console.log(`Post ${postId} auto-flagged by AI screening: ${classification}`);
    }
  } catch (err) {
    // A screening failure should never crash the app or block the post —
    // it already went live. Log it and move on; the post just won't have
    // an AI classification for this attempt.
    console.error(`AI screening failed for post ${postId}:`, err.message);
  }
}

module.exports = { screenPost, classifyContent };
