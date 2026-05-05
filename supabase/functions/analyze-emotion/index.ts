import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content } = await req.json()

    // --- [현재: 무료 모드 - 무작위 감정 생성기] ---
    const emotions = ["행복", "슬픔", "분노", "불안", "평온"];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const randomScore = Math.floor(Math.random() * 40) + 60; 
    const comments = [
      "오늘 하루 정말 고생 많으셨어요! 당신의 진심이 느껴지는 글이네요.",
      "이런 감정을 느끼셨군요. 내일은 더 좋은 일만 가득할 거예요.",
      "글 속에 담긴 마음이 참 따뜻하네요. 스스로를 많이 칭찬해 주세요!",
      "솔직하게 감정을 기록하는 것만으로도 큰 힐링이 됩니다. 잘하셨어요."
    ];
    const randomComment = comments[Math.floor(Math.random() * comments.length)];

    const result = {
      emotion: randomEmotion,
      emotion_score: randomScore,
      ai_comment: `[무료 모드] ${randomComment}`
    };

    /* 
    --- [유료 버전 전환 시 사용할 실제 OpenAI 코드 (주석)] ---
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: '감정 분석봇...' }, { role: 'user', content: content }],
        response_format: { type: 'json_object' }
      }),
    });
    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    -------------------------------------------------------
    */

    await new Promise(resolve => setTimeout(resolve, 800));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
