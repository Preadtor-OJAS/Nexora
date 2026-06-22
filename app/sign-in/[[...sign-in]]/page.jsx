import { SignIn } from '@clerk/nextjs';

export const metadata = {
  title: 'Sign In | Nexora',
  description: 'Sign in to your Nexora account',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.2) 0%, transparent 60%)',
      }} />
      <div className="relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Welcome back</h1>
          <p className="text-muted text-sm">Sign in to continue shopping</p>
        </div>
        <SignIn
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
