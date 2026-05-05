'use client';

import { useAuth } from '@/providers/auth-provider';
import { LogOut, Calendar as CalendarIcon, PenLine, Sparkles, User as UserIcon, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiaryForm } from '@/components/diary-form';
import { CalendarView } from '@/components/calendar-view';
import { StatsView } from '@/components/stats-view';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SettingsDialog } from '@/components/settings-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState } from 'react';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 flex flex-col">
      {/* 1. 최상단 헤더 */}
      <header className="w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 h-14">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center shadow-lg">
              <Sparkles className="h-4 w-4 text-yellow-400 dark:text-slate-900" />
            </div>
            <h1 className="text-xs font-black tracking-widest text-slate-900 dark:text-white uppercase italic">SENTIGRAPH</h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-7 w-7 rounded-full overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 outline-none">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold">
                    {user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2 border-none shadow-2xl rounded-2xl p-2 bg-white dark:bg-slate-900" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal px-2 py-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My Account</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800" />
                <DropdownMenuGroup>
                  <DropdownMenuItem 
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 rounded-xl focus:bg-slate-50 dark:focus:bg-slate-800 cursor-pointer"
                  >
                    <UserIcon className="mr-2 h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">프로필 설정</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={signOut}
                    className="p-2 rounded-xl focus:bg-red-50 dark:focus:bg-red-900/20 text-red-500 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">로그아웃</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

      {/* 2. Tabs 영역: orientation을 명시하고 flex-col을 강제 적용하여 무조건 위아래로 쌓이게 함 */}
      <Tabs defaultValue="write" orientation="horizontal" className="w-full flex flex-col items-stretch">
        {/* 메뉴 영역 (Middle) */}
        <div className="w-full bg-white dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-xl">
          <div className="mx-auto max-w-4xl px-6 h-12 flex items-center justify-center">
            <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-full border border-slate-200/20 dark:border-slate-700/20 h-auto gap-1">
              <TabsTrigger value="write" className="rounded-full px-5 py-1.5 text-[11px] md:text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
                <PenLine className="mr-1.5 h-3.5 w-3.5" /> <span className="xs:inline">쓰기</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-full px-5 py-1.5 text-[11px] md:text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
                <CalendarIcon className="mr-1.5 h-3.5 w-3.5" /> <span className="xs:inline">기록</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="rounded-full px-5 py-1.5 text-[11px] md:text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
                <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> <span className="xs:inline">분석</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* 본문 영역 (Bottom) */}
        <main className="w-full flex-1 mx-auto max-w-4xl px-6 pt-10 pb-20">
          <TabsContent value="write" className="w-full mt-0 focus-visible:outline-none">
            <DiaryForm user={user} />
          </TabsContent>
          
          <TabsContent value="calendar" className="w-full mt-0 focus-visible:outline-none">
            <CalendarView />
          </TabsContent>

          <TabsContent value="stats" className="w-full mt-0 focus-visible:outline-none">
            <StatsView />
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}
