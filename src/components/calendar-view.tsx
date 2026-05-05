'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

type Diary = {
  id: string;
  content: string;
  emotion: string;
  emotion_score: number;
  ai_comment: string;
  created_at: string;
};

export function CalendarView() {
  const { user } = useAuth();
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dayDiaries, setDayDiaries] = useState<Diary[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDiaries();
    }
  }, [user]);

  const fetchDiaries = async () => {
    const { data, error } = await supabase
      .from('diaries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching diaries:', error);
    } else {
      setDiaries(data || []);
    }
  };

  const getEmoji = (emotion: string) => {
    switch (emotion) {
      case '행복': return '😊';
      case '슬픔': return '😢';
      case '분노': return '😠';
      case '불안': return '😰';
      case '평온': return '🌿';
      default: return '😶';
    }
  };

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (!date) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const filtered = diaries.filter(d => 
      format(parseISO(d.created_at), 'yyyy-MM-dd') === dateStr
    );

    if (filtered.length > 0) {
      setDayDiaries(filtered);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-3xl mx-auto">
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[24px] ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
        <CardContent className="p-2 md:p-6 flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            locale={ko}
            className="w-full"
            classNames={{
              day_today: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-full",
              day_selected: "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-full",
            }}
            modifiers={{
              hasDiary: diaries.map(d => new Date(d.created_at))
            }}
            modifiersStyles={{
              hasDiary: { fontWeight: 'bold' }
            }}
            components={{
              DayContent: ({ date }) => {
                const dayEntries = diaries.filter(d => 
                  format(parseISO(d.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                );
                return (
                  <div className="relative w-full h-full flex items-center justify-center pt-1 group">
                    <span className="z-10 text-sm">{date.getDate()}</span>
                    {dayEntries.length > 0 && (
                      <div className="absolute bottom-1 flex -space-x-1">
                        {dayEntries.slice(0, 1).map((d) => (
                          <span key={d.id} className="text-[10px] transform group-hover:scale-125 transition-transform">
                            {getEmoji(d.emotion)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[90vw] md:max-w-md border-none shadow-2xl p-0 overflow-hidden bg-[#F8F9FB] dark:bg-slate-950 rounded-[32px] max-h-[85vh] flex flex-col">
          <DialogHeader className="bg-slate-900 dark:bg-slate-900 px-8 py-10 text-center shrink-0">
            <div className="text-white/40 text-xs font-bold tracking-widest uppercase mb-2">History</div>
            <DialogTitle className="text-2xl font-bold text-white">
              {selectedDate && format(selectedDate, 'M월 d일의 조각들', { locale: ko })}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-4 space-y-4 overflow-y-auto flex-1 pb-10">
            {dayDiaries.map((diary) => (
              <Card key={diary.id} className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden ring-1 ring-slate-100/50 dark:ring-slate-800">
                <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-50 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getEmoji(diary.emotion)}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{diary.emotion}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                    {format(parseISO(diary.created_at), 'HH:mm')}
                  </span>
                </div>
                <CardContent className="p-5 space-y-4">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic">
                    "{diary.content}"
                  </p>
                  <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="text-[10px] font-bold text-indigo-400 dark:text-indigo-300 uppercase tracking-widest mb-2">AI Comment</div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                      {diary.ai_comment}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
