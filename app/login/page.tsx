import { LoginPageView } from "@/components/auth/LoginPageView";

type LoginPageProps = {
  searchParams?: Promise<{
    redirect?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return <LoginPageView redirectPath={params?.redirect} />;
}
