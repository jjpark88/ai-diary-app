import { createClient } from '@supabase/supabase-js';

// 클라이언트 컴포넌트에서 안전하게 사용할 수 있도록 NEXT_PUBLIC_ 접두어를 사용합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabase 클라이언트 싱글톤 인스턴스 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
