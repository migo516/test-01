
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  userId: string;
  newPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, newPassword }: ResetPasswordRequest = await req.json();

    if (!userId || !newPassword) {
      return new Response(
        JSON.stringify({ error: "사용자 ID와 새 비밀번호가 필요합니다." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: "비밀번호는 6자 이상이어야 합니다." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`비밀번호 변경 요청: 사용자 ID ${userId}`);

    // Admin 클라이언트 생성 (서비스 롤 키 사용)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 먼저 사용자가 존재하는지 확인
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData.user) {
      console.error("사용자 조회 오류:", userError);
      return new Response(
        JSON.stringify({ error: "사용자를 찾을 수 없습니다." }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`사용자 찾음: ${userData.user.email}`);

    // 사용자 비밀번호 업데이트 - 더 명시적인 방법 사용
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
      email_confirm: true // 이메일 확인을 true로 설정하여 바로 사용 가능하게 함
    });

    if (error) {
      console.error("비밀번호 업데이트 오류:", error.message, error);
      return new Response(
        JSON.stringify({ 
          error: "비밀번호 업데이트에 실패했습니다.", 
          details: error.message 
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("비밀번호 변경 성공:", data?.user?.id);

    // 기존 세션들을 무효화하여 새 비밀번호로만 로그인 가능하게 함
    try {
      await supabaseAdmin.auth.admin.signOut(userId, 'global');
      console.log("기존 세션 무효화 완료");
    } catch (signOutError) {
      console.log("세션 무효화 중 오류 (무시 가능):", signOutError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "비밀번호가 성공적으로 변경되었습니다.",
        userId: data?.user?.id 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Edge Function 오류:", error);
    return new Response(
      JSON.stringify({ 
        error: "서버 오류가 발생했습니다.", 
        details: error.message 
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
