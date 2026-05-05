'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ShieldCheck } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { signOut } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      alert('비밀번호가 변경되었습니다. 보안을 위해 다시 로그인해주세요.');
      onOpenChange(false);
      setNewPassword('');
      setConfirmPassword('');
      
      // 비밀번호 변경 후 즉시 로그아웃 처리
      await signOut();
    } catch (error: unknown) {
      const err = error as Error;
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-none shadow-2xl rounded-[32px] bg-white dark:bg-slate-900 p-0 overflow-hidden">
        <DialogHeader className="bg-slate-50 dark:bg-slate-800/50 px-8 py-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-indigo-500" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">프로필 설정</DialogTitle>
          <DialogDescription className="text-slate-400">
            보안을 위해 정기적으로 비밀번호를 변경해주세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">새 비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  placeholder="6자리 이상 입력"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">비밀번호 확인</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  placeholder="비밀번호 재입력"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50"
                  required
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-xl font-bold transition-all shadow-lg shadow-slate-200 dark:shadow-none"
            disabled={loading}
          >
            {loading ? '변경 중...' : '비밀번호 변경하기'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
