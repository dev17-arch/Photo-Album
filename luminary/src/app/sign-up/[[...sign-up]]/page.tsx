// src/app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Luminary<span className="text-stone-300">.</span></h1>
        <p className="text-stone-400 mt-1 text-sm">Create your personal photo archive</p>
      </div>
      <SignUp />
    </div>
  );
}
