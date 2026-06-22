import { SignUp } from '@clerk/nextjs';

export const metadata = {
  title: 'Sign Up | Nexora',
  description: 'Create your Nexora account',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 30%, rgba(6,182,212,0.15) 0%, transparent 60%)',
      }} />
      <div className="relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Join Nexora</h1>
          <p className="text-muted text-sm">Create your account to start shopping</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-transparent shadow-none border-0',
              formButtonPrimary: 'bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 transition-opacity',
              footerActionLink: 'text-primary hover:text-primary-hover',
            },
          }}
        />
      </div>
    </div>
  );
}
