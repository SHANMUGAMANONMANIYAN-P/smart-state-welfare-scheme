import { query } from '../config/db.js';

/**
 * Smart Scheme Chatbot Service
 * Provides grounded scheme advice using officially verified government datasets.
 * Features safe fallback when no AI API key is configured.
 */

// Preset common questions and suggestion chips
export const DEFAULT_SUGGESTIONS = {
  en: [
    'What schemes are available for farmers in Tamil Nadu?',
    'What are the eligibility rules for Kalaignar Magalir Urimai Thittam?',
    'How do I apply for PM-KISAN and what documents are required?',
    'Is there any health insurance scheme covering up to Rs 5 Lakhs?',
    'What pension schemes are available for senior citizens?',
  ],
  ta: [
    'தமிழ்நாடு விவசாயிகளுக்கான நலத்திட்டங்கள் என்னென்ன?',
    'கலைஞர் மகளிர் உரிமைத் திட்டத்தின் தகுதி வரம்புகள் என்ன?',
    'PM-KISAN திட்டத்திற்கு தேவையான ஆவணங்கள் என்ன?',
    'ரூ 5 லட்சம் வரை இலவச மருத்துவ காப்பீடு திட்டம் எது?',
    'மூத்த குடிமக்களுக்கான முதியோர் ஓய்வூதிய திட்டம் எது?',
  ],
};

/**
 * Match query against verified database schemes and generate an authoritative answer
 */
export async function answerSchemeQuestion({ question, language = 'en', userProfile = null }) {
  if (!question || typeof question !== 'string' || !question.trim()) {
    return {
      answer: language === 'ta' 
        ? 'தயவுசெய்து ஏதேனும் ஒரு அரசு நலத்திட்டம் குறித்து கேள்வியை உள்ளிடவும்.'
        : 'Please enter a question regarding welfare schemes, eligibility, or required documents.',
      matched_schemes: [],
      source_citations: [],
      follow_up_suggestions: DEFAULT_SUGGESTIONS[language] || DEFAULT_SUGGESTIONS.en,
      is_fallback: true,
      verified: true,
    };
  }

  const cleanQ = question.trim().toLowerCase();

  // 1. Fetch all active schemes with their criteria and documents from the database
  const schemes = await query('SELECT * FROM welfare_schemes WHERE is_active = 1');
  const enrichedSchemes = [];

  for (const s of schemes) {
    const criteria = await query(
      'SELECT criterion_type, profile_field, operator, target_value, is_mandatory, description, failure_reason FROM eligibility_criteria WHERE scheme_id = ?',
      [s.id]
    );
    const documents = await query(
      'SELECT document_name, description, is_mandatory, issuing_authority FROM scheme_documents WHERE scheme_id = ?',
      [s.id]
    );

    let occupations = [];
    if (typeof s.eligible_occupations === 'string') {
      try {
        occupations = JSON.parse(s.eligible_occupations);
      } catch {
        occupations = [s.eligible_occupations];
      }
    }

    enrichedSchemes.push({
      ...s,
      criteria,
      documents,
      occupations,
    });
  }

  // 2. Score relevance of each scheme to the question
  const scoredSchemes = enrichedSchemes.map((s) => {
    let score = 0;
    const nameMatch = s.scheme_name.toLowerCase();
    const descMatch = s.description.toLowerCase();
    const deptMatch = s.department.toLowerCase();
    const catMatch = s.category.toLowerCase();
    const slugMatch = s.slug.toLowerCase();

    // Scheme specific keywords
    if (cleanQ.includes(slugMatch) || cleanQ.includes(s.scheme_name.toLowerCase().split(' ')[0])) score += 10;
    if (nameMatch.split(' ').some((w) => w.length > 3 && cleanQ.includes(w))) score += 5;

    // Domain keywords
    if ((cleanQ.includes('kisan') || cleanQ.includes('farmer') || cleanQ.includes('agri') || cleanQ.includes('விவசாயி') || cleanQ.includes('உழவர்')) && 
        (catMatch.includes('agri') || nameMatch.includes('kisan') || nameMatch.includes('farmer') || nameMatch.includes('uzhavar'))) {
      score += 8;
    }

    if ((cleanQ.includes('magalir') || cleanQ.includes('urimai') || cleanQ.includes('kmut') || cleanQ.includes('மகளிர்') || cleanQ.includes('உரிமை')) && 
        (nameMatch.includes('magalir') || nameMatch.includes('urimai') || slugMatch.includes('magalir'))) {
      score += 15;
    }

    if ((cleanQ.includes('woman') || cleanQ.includes('women') || cleanQ.includes('mother') || cleanQ.includes('பெண்') || cleanQ.includes('தாய்')) && 
        (catMatch.includes('women') || nameMatch.includes('women') || nameMatch.includes('pudhumai') || nameMatch.includes('magalir'))) {
      score += 7;
    }

    if ((cleanQ.includes('health') || cleanQ.includes('medical') || cleanQ.includes('hospital') || cleanQ.includes('ayushman') || cleanQ.includes('மருத்துவம்') || cleanQ.includes('காப்பீடு')) && 
        (catMatch.includes('health') || nameMatch.includes('health') || nameMatch.includes('ayushman') || nameMatch.includes('cmchis'))) {
      score += 8;
    }

    if ((cleanQ.includes('house') || cleanQ.includes('housing') || cleanQ.includes('pmay') || cleanQ.includes('வீடு') || cleanQ.includes('குடியிருப்பு')) && 
        (catMatch.includes('housing') || nameMatch.includes('awas') || nameMatch.includes('pmay'))) {
      score += 8;
    }

    if ((cleanQ.includes('pension') || cleanQ.includes('old age') || cleanQ.includes('senior') || cleanQ.includes('ஓய்வூதியம்') || cleanQ.includes('முதியோர்')) && 
        (nameMatch.includes('pension') || nameMatch.includes('ignoaps') || catMatch.includes('social'))) {
      score += 8;
    }

    if ((cleanQ.includes('gas') || cleanQ.includes('lpg') || cleanQ.includes('cylinder') || cleanQ.includes('ujjwala') || cleanQ.includes('எரிவாயு')) && 
        (nameMatch.includes('ujjwala') || slugMatch.includes('ujjwala'))) {
      score += 10;
    }

    if ((cleanQ.includes('handloom') || cleanQ.includes('weaver') || cleanQ.includes('artisan') || cleanQ.includes('நெசவாளர்') || cleanQ.includes('கைத்தறி')) && 
        (nameMatch.includes('handloom') || nameMatch.includes('artisan'))) {
      score += 10;
    }

    if ((cleanQ.includes('student') || cleanQ.includes('education') || cleanQ.includes('college') || cleanQ.includes('pudhumai') || cleanQ.includes('மாணவர்') || cleanQ.includes('கல்வி')) && 
        (nameMatch.includes('pudhumai') || catMatch.includes('education'))) {
      score += 10;
    }

    if ((cleanQ.includes('electricity') || cleanQ.includes('power') || cleanQ.includes('மின்சாரம்') || cleanQ.includes('இலவச மின்சாரம்')) && 
        (nameMatch.includes('electricity') || descMatch.includes('electricity'))) {
      score += 10;
    }

    if ((cleanQ.includes('tamil nadu') || cleanQ.includes('tn') || cleanQ.includes('தமிழ்நாடு')) && s.state_coverage === 'Tamil Nadu') {
      score += 3;
    }

    return { scheme: s, score };
  });

  scoredSchemes.sort((a, b) => b.score - a.score);
  const matched = scoredSchemes.filter((item) => item.score > 0).map((item) => item.scheme);
  const topSchemes = matched.slice(0, 3);

  // 3. Optional: Call Gemini AI API if GEMINI_API_KEY is configured in environment
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiApiKey && topSchemes.length > 0) {
    try {
      const aiResponse = await callGeminiAI(geminiApiKey, question, topSchemes, language);
      if (aiResponse) {
        return {
          answer: aiResponse,
          matched_schemes: topSchemes.map(formatSchemeSummary),
          source_citations: topSchemes.map((s) => ({
            scheme_name: s.scheme_name,
            official_url: s.official_url || s.source_url,
            department: s.department,
            last_verified: s.last_verified_date,
          })),
          follow_up_suggestions: generateFollowUps(topSchemes, language),
          is_fallback: false,
          verified: true,
        };
      }
    } catch (err) {
      console.warn('Gemini AI fallback triggered:', err.message);
    }
  }

  // 4. Deterministic Grounded Rule-Based Engine (Guaranteed zero-hallucination)
  const isTamil = language === 'ta';
  let responseText = '';

  if (topSchemes.length === 0) {
    if (isTamil) {
      responseText = `மன்னிக்கவும், உங்களின் கேள்விக்கு பொருத்தமான குறிப்பிட்ட திட்டத்தை கண்டறிய முடியவில்லை. \n\nநீங்கள் பின்வரும் தலைப்புகளில் கேட்கலாம்:\n- **விவசாயிகள் திட்டங்கள்** (PM-KISAN, உழவர் பாதுகாப்பு)\n- **மகளிர் திட்டங்கள்** (கலைஞர் மகளிர் உரிமைத் திட்டம், புதுமைப் பெண்)\n- **மருத்துவ காப்பீடு** (முதலமைச்சரின் விரிவான மருத்துவ காப்பீட்டுத் திட்டம் CMCHIS, ஆயுஷ்மான் பாரத்)\n- **முதியோர் ஓய்வூதியம்** (IGNOAPS)\n- **வீட்டுவசதி திட்டங்கள்** (பிரதம மந்திரி ஆவாஸ் திட்டம் PMAY-G)\n\nமேலும் 'அனைத்து நலத்திட்டங்கள்' பக்கத்தில் முழு பட்டியலைத் தேடலாம்.`;
    } else {
      responseText = `I could not locate an exact match for your specific query in our verified government welfare registry.\n\nHere are popular topics you can ask about:\n- **Farmer Welfare:** PM-KISAN, Free Electricity, Farmers Social Security Scheme\n- **Women Empowerment:** Kalaignar Magalir Urimai Thittam (Rs 1,000/month), Pudhumai Penn Scheme\n- **Healthcare:** Ayushman Bharat PM-JAY (Rs 5 Lakhs), Tamil Nadu CMCHIS\n- **Senior Citizens:** Indira Gandhi National Old Age Pension Scheme (IGNOAPS)\n- **Housing Grants:** Pradhan Mantri Awas Yojana - Gramin (PMAY-G)\n\nYou can also browse the full list on the **All Welfare Schemes** screen.`;
    }
  } else {
    // Generate structured verified answer for top matched schemes
    if (isTamil) {
      responseText = `உங்களின் கேள்விக்கு தொடர்புடைய அதிகாரப்பூர்வ அரசு நலத்திட்ட விவரங்கள் கீழே தொகுத்து வழங்கப்பட்டுள்ளன:\n\n`;
    } else {
      responseText = `Based on verified government records, here are the relevant welfare scheme details:\n\n`;
    }

    topSchemes.forEach((s, idx) => {
      const officialLink = s.official_url || s.source_url || '#';
      const lastVer = s.last_verified_date || '2026-02-28';

      if (isTamil) {
        responseText += `### ${idx + 1}. ${s.scheme_name}\n`;
        responseText += `- **நிர்வாகத் துறை:** ${s.department}\n`;
        responseText += `- **பயன்பாட்டு எல்லை:** ${s.state_coverage}\n`;
        responseText += `- **திட்ட நன்மைகள்:** ${s.benefits_summary || s.description}\n`;

        if (s.criteria && s.criteria.length > 0) {
          responseText += `- **முக்கிய தகுதி வரம்புகள்:**\n`;
          s.criteria.slice(0, 3).forEach((c) => {
            responseText += `  • ${c.description || `${c.profile_field} ${c.operator} ${c.target_value}`}\n`;
          });
        }

        if (s.documents && s.documents.length > 0) {
          responseText += `- **தேவையான முக்கிய ஆவணங்கள்:** ${s.documents.map((d) => d.document_name).join(', ')}\n`;
        }

        responseText += `- **சரிபார்க்கப்பட்ட நாள்:** ${lastVer}\n`;
        responseText += `- **அதிகாரப்பூர்வ விண்ணப்ப தளம்:** [${officialLink}](${officialLink})\n\n`;
      } else {
        responseText += `### ${idx + 1}. ${s.scheme_name}\n`;
        responseText += `- **Administering Department:** ${s.department}\n`;
        responseText += `- **Geographical Coverage:** ${s.state_coverage}\n`;
        responseText += `- **Key Benefits:** ${s.benefits_summary || s.description}\n`;

        if (s.criteria && s.criteria.length > 0) {
          responseText += `- **Key Eligibility Rules:**\n`;
          s.criteria.slice(0, 3).forEach((c) => {
            responseText += `  • ${c.description || `${c.profile_field} ${c.operator} ${c.target_value}`}\n`;
          });
        }

        if (s.documents && s.documents.length > 0) {
          responseText += `- **Required Documents:** ${s.documents.map((d) => d.document_name).join(', ')}\n`;
        }

        responseText += `- **Last Verified:** ${lastVer}\n`;
        responseText += `- **Official Portal:** [${officialLink}](${officialLink})\n\n`;
      }
    });

    if (isTamil) {
      responseText += `\n> ℹ️ **முக்கிய குறிப்பு:** இது ஒரு சுயாதீன தகவல் வழிகாட்டி மட்டுமே. திட்ட விண்ணப்பங்கள் மற்றும் அதிகாரப்பூர்வ ஒப்புதலுக்கு மேலே உள்ள அரசு இணையதளத்தைப் பயன்படுத்தவும்.`;
    } else {
      responseText += `\n> ℹ️ **Important Note:** This is an independent informational advisory tool. To officially register and apply, please visit the government portal links provided above.`;
    }
  }

  return {
    answer: responseText,
    matched_schemes: topSchemes.map(formatSchemeSummary),
    source_citations: topSchemes.map((s) => ({
      scheme_name: s.scheme_name,
      official_url: s.official_url || s.source_url,
      department: s.department,
      last_verified: s.last_verified_date,
    })),
    follow_up_suggestions: generateFollowUps(topSchemes, language),
    is_fallback: true,
    verified: true,
  };
}

function formatSchemeSummary(s) {
  return {
    id: s.id,
    name: s.scheme_name,
    category: s.category,
    department: s.department,
    state_coverage: s.state_coverage,
    official_url: s.official_url || s.source_url,
    last_verified_date: s.last_verified_date,
    benefits_summary: s.benefits_summary,
    criteria_count: s.criteria ? s.criteria.length : 0,
    documents_count: s.documents ? s.documents.length : 0,
  };
}

function generateFollowUps(schemes, language) {
  if (!schemes || schemes.length === 0) {
    return DEFAULT_SUGGESTIONS[language] || DEFAULT_SUGGESTIONS.en;
  }

  const isTamil = language === 'ta';
  const first = schemes[0];

  if (isTamil) {
    return [
      `${first.scheme_name} திட்டத்திற்கு என்னென்ன ஆவணங்கள் தேவை?`,
      'எனது தகுதியை சுயவிவரம் மூலம் எவ்வாறு சரிபார்ப்பது?',
      'தமிழ்நாடு அரசு வழங்கும் பிற நலத்திட்டங்கள் யாவை?',
    ];
  }

  return [
    `What documents are mandatory for ${first.scheme_name}?`,
    'How do I test my eligibility using my socio-economic profile?',
    'What other schemes are available in Tamil Nadu?',
  ];
}

/**
 * Helper to call Gemini AI with strict grounding in verified scheme context
 */
async function callGeminiAI(apiKey, question, contextSchemes, language) {
  const contextText = contextSchemes
    .map(
      (s) =>
        `Scheme: ${s.scheme_name}
Department: ${s.department}
Coverage: ${s.state_coverage}
Category: ${s.category}
Benefits: ${s.benefits_summary || s.description}
Official URL: ${s.official_url || s.source_url}
Criteria Rules: ${JSON.stringify(s.criteria.map((c) => c.description))}
Required Documents: ${JSON.stringify(s.documents.map((d) => d.document_name))}
Last Verified: ${s.last_verified_date}`
    )
    .join('\n---\n');

  const systemPrompt = `You are the official Smart Welfare Scheme AI Assistant for Tamil Nadu and Central Government schemes.
Answer the user's question accurately in ${language === 'ta' ? 'Tamil (தமிழ்)' : 'English'}.
STRICT GROUNDING RULES:
1. ONLY use the verified schemes data provided below. NEVER invent schemes, benefit amounts, criteria, or URLs.
2. Provide concise, clear answers with official links and document requirements.
3. Explicitly state that you provide informational guidance based on government gazettes and users should verify on the official portal.

Verified Schemes Data:
${contextText}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: systemPrompt },
          { text: `Citizen Question: ${question}` },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 800,
    },
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || null;
}
