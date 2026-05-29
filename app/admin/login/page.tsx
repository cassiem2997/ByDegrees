import { Lock } from "lucide-react";

import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAdmin } from "@/app/admin/login/actions";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "1";

  return (
    <SiteShell>
      <div className="mx-auto max-w-md rounded-[36px] border border-white/75 bg-white/75 p-6 backdrop-blur">
        <div className="mb-6">
          <div className="mb-3 inline-flex rounded-2xl bg-ink/5 p-3 text-ink">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold text-ink">관리자 로그인</h1>
          <p className="mt-2 text-sm text-ink/56">
            운영자만 접근 가능한 통계 페이지입니다.
          </p>
        </div>

        <form action={loginAdmin} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink/72">관리자 패스코드</span>
            <Input name="passcode" placeholder="패스코드 입력" type="password" />
          </label>
          {hasError ? (
            <p className="text-sm text-coral">패스코드가 올바르지 않습니다.</p>
          ) : null}
          <Button className="w-full" type="submit">
            입장하기
          </Button>
        </form>
      </div>
    </SiteShell>
  );
}
