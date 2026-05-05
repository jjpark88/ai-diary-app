'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('회원가입 확인 메일이 발송되었습니다.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
      }
    } catch (error: unknown) {
      const err = error as Error;
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] dark:bg-slate-950 p-4 transition-colors duration-300">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[32px] overflow-hidden bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800">
        <CardHeader className="space-y-4 pt-10 pb-8 text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-2xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center shadow-xl">
              <Sparkles className="h-6 w-6 text-yellow-400 dark:text-slate-900" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">SENTIGRAPH</CardTitle>
            <CardDescription className="text-slate-400 font-medium">당신의 감정을 기록하고 분석하세요</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  type="email" 
                  placeholder="이메일" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="pl-10 h-11 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-slate-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  type="password" 
                  placeholder="비밀번호" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="pl-10 h-11 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-slate-200"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-slate-200 dark:shadow-none"
              disabled={loading}
            >
              {loading ? '처리 중...' : (isSignUp ? '시작하기' : '로그인')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="pb-10 flex justify-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-medium text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '처음이신가요? 회원가입'}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
