'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Calendar as CalendarIcon, Quote } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function DiaryForm({ user }: { user: User | null }) {
  const [content, setContent] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    emotion: string;
    emotion_score: number;
    ai_comment: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setLoading(true);
    setResult(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('analyze-emotion', {
        body: { content },
      });

      if (functionError) throw functionError;

      const now = new Date();
      const combinedDate = new Date(date);
      combinedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

      const { error: dbError } = await supabase.from('diaries').insert({
        user_id: user.id,
        content: content,
        emotion: data.emotion,
        emotion_score: data.emotion_score,
        ai_comment: data.ai_comment,
        created_at: combinedDate.toISOString(),
      });

      if (dbError) throw dbError;

      setResult(data);
      setContent('');
    } catch (error: any) {
      console.error('Error:', error);
      alert('분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getEmoji = (emotion: string) => {
    switch (emotion) {
      case '행복': return '😊';
      case '슬픔': return '😢';
      case '분노': return '😠';
      case '불안': return '😰';
      case '평온': return '🌿';
      default: return '🤔';
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xl font-medium text-slate-800 dark:text-slate-200">오늘을 기록할까요?</h2>
          <Popover>
            <PopoverTrigger className="h-8 px-3 text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full bg-slate-100/50 dark:bg-slate-800/50 flex items-center gap-1.5 transition-colors outline-none focus:ring-1 focus:ring-slate-200 dark:focus:ring-slate-700">
              <CalendarIcon className="h-3.5 w-3.5" />
              {format(date, 'M월 d일', { locale: ko })}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-2xl bg-white dark:bg-slate-900" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                locale={ko}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
          <CardContent className="p-0">
            <form onSubmit={handleSubmit}>
              <Textarea 
                placeholder="마음을 담은 한 문장..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[160px] resize-none border-none focus-visible:ring-0 text-lg p-6 placeholder:text-slate-300 dark:placeholder:text-slate-600 bg-transparent dark:text-slate-100"
                disabled={loading}
              />
              <div className="p-4 flex justify-end bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-800">
                <Button 
                  type="submit" 
                  disabled={loading || !content.trim()} 
                  className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white text-white rounded-full px-6 transition-all active:scale-95 shadow-md shadow-slate-200 dark:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin border-2 border-slate-400 border-t-slate-900 rounded-full" />
                      생각 중...
                    </span>
                  ) : (
                    <>분석하기 <Send className="ml-2 h-3.5 w-3.5" /></>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="border-none bg-gradient-to-br from-indigo-500 to-slate-900 dark:from-indigo-600 dark:to-black text-white rounded-[32px] shadow-2xl shadow-indigo-100 dark:shadow-none overflow-hidden">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-5xl shadow-inner border border-white/10">
                {getEmoji(result.emotion)}
              </div>
              
              <div className="space-y-1">
                <div className="text-white/60 text-xs font-bold uppercase tracking-widest">Today's Vibe</div>
                <h3 className="text-3xl font-bold">{result.emotion}</h3>
                <div className="text-indigo-300 text-sm font-medium">강도 {result.emotion_score}%</div>
              </div>

              <div className="relative pt-4 w-full">
                <Quote className="h-5 w-5 text-white/20 absolute -top-1 left-0" />
                <p className="text-lg font-light text-white/90 leading-relaxed italic px-2">
                  {result.ai_comment}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
