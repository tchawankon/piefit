'use strict';
/* PieFit Nutrition AI: key helpers and the Gemini / Claude / OpenAI calls used by the Food tab.
   Loaded before nutrition.js. No DOM access here, so it can be tested on its own. */
const NutritionAI = (() => {
  const isThNow = () => typeof SET !== 'undefined' && SET.lang === 'th';

  /* ---------- API Key Utilities ---------- */
  function cleanKey(raw) {
    if (!raw) return '';
    let k = String(raw).trim();
    k = k.replace(/^["'`]|["'`]$/g, '').trim();
    k = k.replace(/^(?:bearer\s+|gemini_api_key\s*=\s*|openai_api_key\s*=\s*|anthropic_api_key\s*=\s*|api_key\s*=\s*|key\s*=\s*)/i, '').trim();
    k = k.replace(/^["'`]|["'`]$/g, '').trim();
    return k;
  }

  function detectKeyType(raw) {
    const k = cleanKey(raw);
    if (!k) return 'empty';
    if (k.startsWith('AIza') || k.startsWith('AQ')) return 'gemini';
    if (k.startsWith('sk-ant-')) return 'claude';
    if (k.startsWith('sk-')) return 'openai';
    return 'unknown';
  }

  function getStoredKey() {
    if (typeof store === 'undefined') return '';
    // 'nutri_key' is the key saved from the Food tab; 'aikey' is the AI coach's Claude key;
    // 'gemini_key' is where older versions saved Gemini keys. The key saved most deliberately wins.
    const keys = ['nutri_key', 'aikey', 'gemini_key'].map(n => cleanKey(store.get(n, ''))).filter(Boolean);
    return keys.find(k => detectKeyType(k) !== 'unknown') || keys[0] || '';
  }

  function parseJsonSafe(rawText) {
    if (!rawText) throw new Error('ไม่ได้รับข้อมูลตอบกลับจาก AI');
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {}
    }
    const clean = rawText.replace(/```(?:json)?/gi, '').trim();
    return JSON.parse(clean);
  }

  /* Discover supported Gemini models dynamically from the user's key */
  async function discoverGeminiModels(key) {
    if (window._geminiModelCache && window._geminiModelCache.key === key) {
      return window._geminiModelCache.models;
    }

    const versions = ['v1beta', 'v1'];
    let discovered = [];

    for (const ver of versions) {
      try {
        const url = `https://generativelanguage.googleapis.com/${ver}/models`;
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'x-goog-api-key': key }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.models)) {
            const available = data.models
              .filter(m => !m.supportedGenerationMethods || m.supportedGenerationMethods.includes('generateContent'))
              .map(m => ({
                id: m.name.replace(/^models\//, ''),
                ver
              }));

            if (available.length > 0) {
              // Prioritize flash models (sorted highest/latest version first, e.g. 3.8 > 2.5 > 2.0)
              const flash = available.filter(m => m.id.toLowerCase().includes('flash'));
              flash.sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true, sensitivity: 'base' }));
              const others = available.filter(m => !m.id.toLowerCase().includes('flash'));
              discovered = flash.concat(others);
              break;
            }
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error ? errData.error.message : '';
          if (res.status === 400 || res.status === 403) {
            throw new Error(errMsg || `Gemini API Auth Error ${res.status}`);
          }
        }
      } catch (e) {
        if (e.message && (e.message.toLowerCase().includes('api key') || e.message.toLowerCase().includes('permission') || e.message.toLowerCase().includes('credential') || e.message.toLowerCase().includes('auth'))) {
          throw e;
        }
      }
    }

    if (discovered.length > 0) {
      window._geminiModelCache = { key, models: discovered };
      return discovered;
    }

    // Default fallbacks if discovery fails (e.g. offline list endpoint)
    return [
      { id: 'gemini-2.5-flash', ver: 'v1beta' },
      { id: 'gemini-2.5-flash-lite', ver: 'v1beta' },
      { id: 'gemini-2.0-flash', ver: 'v1beta' },
      { id: 'gemini-2.0-flash', ver: 'v1' }
    ];
  }

  // Calls Gemini, Claude, or OpenAI depending on key format
  async function queryAIForNutrition(foodDesc, rawKey) {
    const key = cleanKey(rawKey);
    const type = detectKeyType(key);

    const prompt = `Analyze this meal and estimate its calories and macronutrients: "${foodDesc}".
Reply strictly with a valid JSON object without markdown formatting or code fences:
{"name":"${foodDesc}","cal":520,"p":42,"c":55,"f":14,"notes":"estimation"}`;

    // 1. Google Gemini API (keys start with 'AQ' or 'AIza')
    if (type === 'gemini') {
      const candidates = await discoverGeminiModels(key);
      let lastErr = null;

      for (const target of candidates) {
        try {
          const url = `https://generativelanguage.googleapis.com/${target.ver}/models/${target.id}:generateContent`;
          const genConfig = { responseMimeType: 'application/json' };
          // 2.5 Flash: switch thinking off for latency; 3.x uses thinkingLevel instead
          if (/2\.5-flash/.test(target.id)) genConfig.thinkingConfig = { thinkingBudget: 0 };
          else if (/gemini-3/.test(target.id)) genConfig.thinkingConfig = { thinkingLevel: 'low' };

          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': key
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: genConfig
            })
          });

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            const errMsg = (errJson.error && errJson.error.message) ? errJson.error.message : `Gemini HTTP ${res.status}`;

            // If responseMimeType or thinkingConfig is rejected on this model, retry once with a minimal config
            if (res.status === 400 && (errMsg.toLowerCase().includes('mime') || errMsg.toLowerCase().includes('thinking'))) {
              const retryRes = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
              });
              if (retryRes.ok) {
                const retryJson = await retryRes.json();
                return parseJsonSafe(retryJson.candidates?.[0]?.content?.parts?.[0]?.text);
              }
            }

            if (res.status === 404 || errMsg.toLowerCase().includes('not found')) {
              lastErr = new Error(errMsg);
              continue;
            }
            throw new Error(errMsg);
          }

          const json = await res.json();
          const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
          return parseJsonSafe(rawText);
        } catch (e) {
          lastErr = e;
          if (e.message && (e.message.toLowerCase().includes('not found') || e.message.includes('404'))) {
            continue;
          }
          throw e;
        }
      }
      throw lastErr || new Error('Gemini API call failed');
    }

    // 2. Anthropic Claude (keys start with 'sk-ant-')
    if (type === 'claude') {
      // same SDK build and model as the AI coach, so the SDK is already cached for offline use
      const SDK = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.133.0/+esm';
      let Anthropic;
      try { ({ default: Anthropic } = await import(SDK)); }
      catch (e) { throw new Error(isThNow() ? 'โหลดตัวเชื่อมต่อ Claude ไม่ได้ (ต้องต่อเน็ตครั้งแรก)' : 'Could not load the Claude SDK (internet needed the first time)'); }
      const client = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
      const msg = await client.messages.create({
        model: 'claude-haiku-5-5',
        max_tokens: 1000,
        system: 'You are a nutrition calculator. Reply with one JSON object only, no prose, no code fences.',
        messages: [{ role: 'user', content: prompt }]
      });
      const rawText = (msg.content || []).filter(b => b.type === 'text').map(b => b.text).join('') || '';
      return parseJsonSafe(rawText);
    }

    // 3. OpenAI API (keys start with 'sk-')
    if (type === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'You are a nutrition calculator. Reply strictly with JSON: {"name": string, "cal": number, "p": number, "c": number, "f": number, "notes": string}' },
            { role: 'user', content: `Analyze: "${foodDesc}"` }
          ]
        })
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error((errJson.error && errJson.error.message) ? errJson.error.message : `OpenAI HTTP ${res.status}`);
      }
      const json = await res.json();
      const rawText = json.choices?.[0]?.message?.content || '{}';
      return parseJsonSafe(rawText);
    }

    const isTh = (typeof SET !== 'undefined' && SET.lang === 'th');
    const preview = key ? `"${key.slice(0, 8)}..."` : '(ค่าว่าง)';
    throw new Error(isTh
      ? `รูปแบบคีย์ไม่ถูกต้อง (${preview}) กรุณาใช้ Gemini API Key ที่ขึ้นต้นด้วย AQ... หรือ AIza... จาก Google AI Studio`
      : `Unsupported API key format (${preview}). Please use a valid Gemini key starting with AQ... or AIza...`);
  }

  return { cleanKey, detectKeyType, getStoredKey, parseJsonSafe, queryAIForNutrition };
})();
