'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BrainCircuit, Sun, CloudRain, ThermometerSun, 
  Cloud, Map, Wind, Activity, HelpCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';

type Diary = {
  id: string;
  content: string;
  emotion: string;
  emotion_score: number;
  created_at: string;
};

type KeywordNode = {
  word: string;
  count: number;
  avgScore: number;
  color: string;
  fontSize: number;
  x: number;
  y: number;
};

export function StatsView() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [nodes, setNodes] = useState<KeywordNode[]>([]);
  const [weatherStats, setWeatherStats] = useState({
    avgTemp: 0,
    rainProb: 0,
    status: '맑음',
    advisory: ''
  });
  const [volatility, setVolatility] = useState({
    index: 0,
    status: '',
    data: [] as { name: string; score: number }[]
  });
  const [loading, setLoading] = useState(true);

  const processKeywords = (data: Diary[]) => {
    const stopWords = ['오늘', '진짜', '너무', '정말', '하고', '했다', '것이다', '있는', '했다', '매우', '생각', '사람', '일기', '했다'];
    const keywordMap: Record<string, { count: number; totalScore: number }> = {};

    data.forEach(d => {
      const words = d.content.split(/\s+/).map((w: string) => w.replace(/[.,!?]/g, ''));
      words.forEach((word: string) => {
        if (word.length > 1 && !stopWords.includes(word)) {
          if (!keywordMap[word]) {
            keywordMap[word] = { count: 0, totalScore: 0 };
          }
          keywordMap[word].count += 1;
          keywordMap[word].totalScore += d.emotion_score;
        }
      });
    });

    const sortedKeywords = Object.entries(keywordMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8);

    const centerX = 200;
    const centerY = 180;
    const radius = 110;

    const newNodes: KeywordNode[] = sortedKeywords.map(([word, info], index) => {
      const angle = (index / sortedKeywords.length) * 2 * Math.PI;
      const avgScore = info.totalScore / info.count;
      return {
        word,
        count: info.count,
        avgScore,
        color: avgScore >= 60 ? '#22c55e' : avgScore <= 40 ? '#ef4444' : '#94a3b8',
        fontSize: Math.min(24, 12 + info.count * 3),
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    setNodes(newNodes);
  };

  const calculateWeather = (data: Diary[]) => {
    if (data.length === 0) return;
    const avgScore = data.reduce((acc, curr) => acc + curr.emotion_score, 0) / data.length;
    const negativeEmotions = ['슬픔', '불안', '분노'];
    const negativeDays = data.filter(d => negativeEmotions.includes(d.emotion)).length;
    const rainProb = (negativeDays / data.length) * 100;

    let status = '맑음';
    let advisory = '당신의 마음은 현재 쾌청한 상태입니다. 지금의 평온함을 만끽하세요.';
    if (rainProb > 40) { status = '흐림'; advisory = '마음에 구름이 조금 끼어있네요. 휴식이 필요해 보입니다.'; }
    if (rainProb > 70) { status = '비'; advisory = '마음 비 주의보! 부정적인 감정이 쏟아지고 있으니 주의하세요.'; }

    setWeatherStats({ avgTemp: Math.round(avgScore * 0.4 + 10), rainProb: Math.round(rainProb), status, advisory });
  };

  const calculateVolatility = (data: Diary[]) => {
    if (data.length < 2) return;
    let totalDiff = 0;
    const pulseData = data.map((d, i) => {
      if (i === 0) return { name: 'S', score: d.emotion_score };
      const diff = Math.abs(d.emotion_score - data[i-1].emotion_score);
      totalDiff += diff;
      return { name: `E${i+1}`, score: d.emotion_score };
    });
    const avgDiff = totalDiff / (data.length - 1);
    let status = '평온한 호수';
    if (avgDiff > 20) status = '잔잔한 파도';
    if (avgDiff > 40) status = '거친 파도';
    if (avgDiff > 60) status = '몰아치는 폭풍';
    setVolatility({ index: Math.round(avgDiff), status, data: pulseData });
  };

  const fetchData = useCallback(async () => {
    const { data, error } = await supabase
      .from('diaries')
      .select('content, emotion, emotion_score, created_at')
      .order('created_at', { ascending: true });

    if (!error && data) {
      const fetchedDiaries = data as Diary[];
      processKeywords(fetchedDiaries);
      calculateWeather(fetchedDiaries);
      calculateVolatility(fetchedDiaries);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  if (loading) return <div className="text-center py-20 text-slate-400 text-sm italic animate-pulse">마음의 데이터를 분석 중입니다...</div>;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <Tabs defaultValue="network" className="w-full flex flex-col items-center">
        <div className="flex justify-center mb-10">
          <TabsList className="h-7 bg-slate-200/50 dark:bg-slate-800/50 p-0.5 rounded-full border border-slate-100 dark:border-slate-800 gap-0">
            <TabsTrigger value="network" className="rounded-full px-4 py-1 text-[10px] font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 transition-all">
              감정 지도
            </TabsTrigger>
            <TabsTrigger value="weather" className="rounded-full px-4 py-1 text-[10px] font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 transition-all">
              마음 날씨
            </TabsTrigger>
            <TabsTrigger value="volatility" className="rounded-full px-4 py-1 text-[10px] font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 transition-all">
              감정 기복
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="network" className="w-full mt-0 focus-visible:outline-none animate-in fade-in duration-500">
          <div className="space-y-6">
            <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[40px] overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
              <CardHeader className="text-center pt-10 pb-2">
                <div className="flex justify-center mb-2">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <BrainCircuit className="h-6 w-6 text-indigo-500" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">나의 감정 트리거 지도</CardTitle>
                <p className="text-sm text-slate-400 mt-2">단어와 감정 사이의 보이지 않는 연결고리</p>
              </CardHeader>
              
              <CardContent className="flex justify-center py-4 overflow-visible">
                <div className="relative w-full max-w-[400px] h-[360px]">
                  <svg width="100%" height="100%" viewBox="0 0 400 360" className="overflow-visible">
                    {nodes.map((node, i) => (
                      <line key={`line-${i}`} x1="200" y1="180" x2={node.x} y2={node.y} stroke={node.color} strokeWidth={Math.min(5, 1 + node.count)} strokeOpacity="0.3" />
                    ))}
                    <circle cx="200" cy="180" r="35" fill={theme === 'dark' ? '#0f172a' : '#fff'} stroke="#6366f1" strokeWidth="3" />
                    <text x="200" y="185" textAnchor="middle" fontSize="14" fontWeight="bold" fill={theme === 'dark' ? '#fff' : '#1e293b'}>나</text>
                    {nodes.map((node, i) => (
                      <g key={`node-${i}`} className="group cursor-default">
                        <circle cx={node.x} cy={node.y} r="3" fill={node.color} />
                        <text x={node.x} y={node.y - 12} textAnchor="middle" fontSize={node.fontSize} fontWeight="bold" fill={theme === 'dark' ? '#e2e8f0' : '#1e293b'}>{node.word}</text>
                        <text x={node.x} y={node.y + 15} textAnchor="middle" fontSize="10" fill={node.color} fontWeight="bold">{Math.round(node.avgScore)}%</text>
                      </g>
                    ))}
                  </svg>
                </div>
              </CardContent>

              <div className="bg-slate-50/50 dark:bg-slate-800/30 p-8 border-t border-slate-50 dark:border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex gap-3 items-start">
                    <HelpCircle className="h-5 w-5 text-indigo-400 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">How to analyze</p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        중앙의 &quot;나&quot;와 연결된 선들은 당신의 감정 트리거입니다. <span className="text-green-500 font-bold">초록색 선</span>은 기분을 좋게 만드는 행복 트리거, <span className="text-red-500 font-bold">빨간색 선</span>은 스트레스 트리거를 의미합니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <HelpCircle className="h-5 w-5 text-indigo-400 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meaning of size</p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        단어의 <span className="font-bold">글씨 크기</span>가 클수록 당신의 일기에 더 자주 등장한 핵심 주제입니다. 선이 굵을수록 해당 감정과의 상관관계가 더욱 강력함을 나타냅니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weather" className="w-full mt-0 focus-visible:outline-none animate-in fade-in duration-500">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-none shadow-lg bg-white dark:bg-slate-900 rounded-[32px] p-6 flex flex-col items-center justify-center text-center space-y-4 ring-1 ring-slate-100 dark:ring-slate-800">
                <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-4xl">
                  {weatherStats.status === '맑음' ? <Sun className="h-10 w-10 text-yellow-400 animate-spin-slow" /> : 
                   weatherStats.status === '흐림' ? <Cloud className="h-10 w-10 text-slate-400" /> : 
                   <CloudRain className="h-10 w-10 text-indigo-400" />}
                </div>
                <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">마음 날씨</p><h3 className="text-2xl font-black text-slate-900 dark:text-white">{weatherStats.status}</h3></div>
              </Card>
              <Card className="border-none shadow-lg bg-white dark:bg-slate-900 rounded-[32px] p-6 flex flex-col items-center justify-center text-center space-y-4 ring-1 ring-slate-100 dark:ring-slate-800">
                <div className="h-16 w-16 rounded-full bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center"><ThermometerSun className="h-10 w-10 text-orange-500" /></div>
                <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">평균 기온</p><h3 className="text-2xl font-black text-slate-900 dark:text-white">{weatherStats.avgTemp}℃</h3></div>
              </Card>
              <Card className="border-none shadow-lg bg-white dark:bg-slate-900 rounded-[32px] p-6 flex flex-col items-center justify-center text-center space-y-4 ring-1 ring-slate-100 dark:ring-slate-800">
                <div className="h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center"><CloudRain className="h-10 w-10 text-indigo-500" /></div>
                <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">강수 확률</p><h3 className="text-2xl font-black text-slate-900 dark:text-white">{weatherStats.rainProb}%</h3></div>
              </Card>
            </div>
            <Card className="border-none shadow-xl bg-slate-900 dark:bg-black text-white rounded-[32px] p-8 relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /><span className="text-xs font-bold uppercase tracking-widest text-slate-400">마음 기상 특보</span></div>
                <p className="text-xl font-medium leading-relaxed italic">&quot;{weatherStats.advisory}&quot;</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="volatility" className="w-full mt-0 focus-visible:outline-none animate-in fade-in duration-500">
          <div className="space-y-6">
            <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[40px] overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
              <CardHeader className="text-center pt-10 pb-4">
                <div className="flex justify-center mb-2">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-red-500" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">감정 변동성 지수</CardTitle>
                <p className="text-sm text-slate-400 mt-2">마음의 파동이 얼마나 역동적인가요?</p>
              </CardHeader>
              <CardContent className="h-[250px] px-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={volatility.data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                    <XAxis dataKey="name" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: theme === 'dark' ? '#0f172a' : '#fff' }} itemStyle={{ color: '#ef4444' }} />
                    <Line type="stepAfter" dataKey="score" stroke="#ef4444" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
              <div className="bg-red-50/30 dark:bg-red-950/10 p-8 border-t border-red-50 dark:border-red-900/20 text-center">
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Volatility Status</p>
                <div className="text-4xl font-black text-slate-900 dark:text-white mb-2">{volatility.status}</div>
                <p className="text-xs text-slate-500">평균 변동폭: {volatility.index}pt / 100pt</p>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
