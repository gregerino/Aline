import { useState } from 'react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, company?: string) => Promise<void>;
}

export default function LoginPage({ onLogin, onRegister }: Props) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await onRegister(email, password, company || undefined);
      } else {
        await onLogin(email, password);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Något gick fel';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Aline</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight max-w-md">
            Hitta de bästa utvecklarna med AI-driven sökning
          </h1>
          <p className="text-slate-400 mt-4 text-lg max-w-md leading-relaxed">
            Sök bland tusentals GitHub-profiler. Aline analyserar kompetens, aktivitet och erfarenhet
            för att matcha dig med rätt kandidater.
          </p>
        </div>
        <div className="relative z-10 space-y-4">
          {[
            'NLP-driven sökning — skriv som du tänker',
            'Hybrid AI-ranking av kandidater',
            'Kandidatpool med pipeline-hantering',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-slate-300 text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Aline</span>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {isRegister ? 'Skapa konto' : 'Välkommen tillbaka'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isRegister ? 'Kom igång med Aline på under en minut' : 'Logga in för att fortsätta'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-postadress</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="namn@foretag.se"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Lösenord</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Minst 6 tecken"
                  required
                />
              </div>
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Företag <span className="text-gray-400">(valfritt)</span></label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Ditt företag"
                  />
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {isRegister ? 'Skapa konto' : 'Logga in'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="w-full mt-5 text-sm text-slate-400 hover:text-white transition-colors text-center"
          >
            {isRegister ? 'Har redan ett konto? Logga in' : 'Inget konto? Skapa ett gratis'}
          </button>
        </div>
      </div>
    </div>
  );
}
