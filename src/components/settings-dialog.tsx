'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KeyRound, ShieldCheck } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      alert('비밀번호가 성공적으로 변경되었습니다! 다시 로그인해주세요.');
      setNewPassword('');
      setConfirmPassword('');
      onOpenChange(false);
      
      // 자동 로그아웃 실행
      await supabase.auth.signOut();
      window.location.href = '/login'; 
    } catch (error: any) {
      alert('변경 중 오류 발생: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-none shadow-2xl rounded-[32px] p-0 overflow-hidden bg-white">
        <DialogHeader className="bg-slate-900 p-8 text-center text-white">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <KeyRound className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold">계정 설정</DialogTitle>
          <DialogDescription className="text-slate-400">
            비밀번호를 변경하여 보안을 강화하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">새 비밀번호</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="6자 이상 입력"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-12 rounded-xl bg-slate-50 border-slate-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">비밀번호 확인</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="한 번 더 입력"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 rounded-xl bg-slate-50 border-slate-100"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
          >
            {loading ? (
              '변경 중...'
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> 비밀번호 업데이트
              </span>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
