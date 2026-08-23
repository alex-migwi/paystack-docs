import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/docs/transaction/initialize');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-zinc-500 font-mono text-sm">
      Redirecting to Paystack Transaction Initialize API docs...
    </div>
  );
}
