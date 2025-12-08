"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function SupabaseListener() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(() => {
        router.refresh();
      });
    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return null;
}
