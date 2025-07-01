import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Shield, Zap, Chrome, Sparkles, TrendingUp, Quote, Github, Twitter, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// --- StatisticLiveLogo component (refined) ---
type SizeProp = "default" | "2xl";
interface StatisticLiveLogoProps { size?: SizeProp; }
export function StatisticLiveLogo({ size = "default" }: StatisticLiveLogoProps) {
  const styles = {
    default: { text: "text-xl", dot: "text-3xl" },
    "2xl": { text: "text-3xl", dot: "text-4xl" },
  };
  const currentStyle = styles[size];
  return (
    <span className={cn("inline-flex items-baseline font-bold", currentStyle.text)}>
      <span className="text-slate-900">statistic</span>
      <span className={cn("mx-px leading-none text-emerald-500", currentStyle.dot)}>.</span>
      <span className="text-slate-900">live</span>
    </span>
  );
}

// Company logos with better selection
const companyLogos = [
  { name: "GitHub", url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" },
  { name: "Vercel", url: "https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png" },
  { name: "Supabase", url: "https://supabase.com/brand-assets/supabase-logo-icon.png" },
  { name: "Stripe", url: "https://stripe.com/img/v3/home/twitter.png" },
  { name: "Linear", url: "https://linear.app/favicon.ico" },
];

function useAnimatedCounter(to: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
          let start: number | null = null;
          const animate = (ts: number) => {
            if (start === null) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            setValue(Math.floor(progress * to));
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setValue(to);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [to, duration, hasStarted]);

  return { value, elementRef };
}

export default function LandingPage() {
  const pageviewsCounter = useAnimatedCounter(24700, 1800);
  const visitorsCounter = useAnimatedCounter(8200, 2000);
  const usersCounter = useAnimatedCounter(10000, 2200);

  return (
    <div className="min-h-screen bg-gray-50 font-inter text-slate-900 antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <StatisticLiveLogo size="default" />
              <div className="hidden sm:flex items-center space-x-2">
                <span className="inline-flex items-center bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  Free & Open Source
                </span>
                <span className="inline-flex items-center bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 border border-orange-200">
                  BETA
                </span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors duration-200">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors duration-200">
                Pricing
              </a>
              <a href="#docs" className="text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors duration-200">
                Docs
              </a>
              <a href="https://github.com" className="text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors duration-200">
                GitHub
              </a>
            </nav>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-slate-700 hover:text-emerald-600 hover:bg-emerald-50">
                Sign In
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200">
                Get Started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 pb-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column */}
            <div className="text-center lg:text-left">
              <div className="mb-8">
                <div className="inline-flex items-center bg-gradient-to-r from-emerald-50 to-blue-50 px-4 py-2 mb-6 border border-emerald-200">
                  <Sparkles className="h-4 w-4 text-emerald-600 mr-2" />
                  <span className="text-sm font-semibold text-emerald-700">Now in Public Beta</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
                  Privacy-First
                  <span className="block text-emerald-600">Web Analytics</span>
                  <span className="block text-slate-700">Made Simple</span>
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Beautiful, lightweight, and privacy-focused analytics for modern websites. 
                  <span className="font-semibold text-emerald-600"> 100% free</span> and 
                  <span className="font-semibold text-emerald-600"> open source</span>.
                </p>
              </div>

              <div className="mb-8">
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                  />
                  <Button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                    Start Free
                  </Button>
                </div>
                <p className="mt-3 text-sm text-slate-500 text-center lg:text-left">
                  No credit card required • Setup in 2 minutes • Currently in Beta
                </p>
              </div>

              <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                <div className="text-center bg-white p-4 border border-slate-200 shadow-sm">
                  <div className="text-2xl font-bold text-slate-900" ref={usersCounter.elementRef}>
                    {usersCounter.value.toLocaleString()}+
                  </div>
                  <div className="text-sm text-slate-600">Active Users</div>
                </div>
                <div className="text-center bg-white p-4 border border-slate-200 shadow-sm">
                  <div className="text-2xl font-bold text-slate-900">100%</div>
                  <div className="text-sm text-slate-600">Open Source</div>
                </div>
                <div className="text-center bg-white p-4 border border-slate-200 shadow-sm">
                  <div className="text-2xl font-bold text-slate-900">$0</div>
                  <div className="text-sm text-slate-600">Forever Free</div>
                </div>
              </div>
            </div>

            {/* Right Column - Analytics Cards */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-blue-100/50 blur-3xl transform rotate-6"></div>
              <div className="relative space-y-4">
                <div className="bg-white shadow-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-100 border border-emerald-200">
                        <BarChart3 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Live Visitors</h3>
                    </div>
                    <div className="flex items-center space-x-1 bg-emerald-50 px-2 py-1 border border-emerald-200">
                      <div className="w-2 h-2 bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs text-emerald-600 font-medium">Live</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2" ref={visitorsCounter.elementRef}>
                    {visitorsCounter.value.toLocaleString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-emerald-600 font-medium">+12% from yesterday</span>
                  </div>
                </div>

                <div className="bg-white shadow-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 border border-blue-200">
                        <Chrome className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Page Views</h3>
                    </div>
                    <div className="bg-slate-50 p-1 border border-slate-200">
                      <Sparkles className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2" ref={pageviewsCounter.elementRef}>
                    {pageviewsCounter.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">Total this month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="border-y border-slate-200 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Trusted by developers at
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {companyLogos.map((logo, index) => (
              <div key={logo.name} className="flex items-center justify-center h-12 grayscale hover:grayscale-0 transition-all duration-300">
                <img
                  src={logo.url}
                  alt={logo.name}
                  className="h-8 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything you need, nothing you don't
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Simple, powerful analytics that respect your users' privacy and won't slow down your site.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 border border-slate-200 bg-white hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
              <div className="p-3 bg-emerald-100 border border-emerald-200 w-fit mb-6">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Real-Time Analytics</h3>
              <p className="text-slate-600 mb-4">
                Monitor your website traffic as it happens with live visitor counts and real-time event tracking.
              </p>
              <div className="flex items-center space-x-2 text-emerald-600 font-medium bg-emerald-50 p-3 border border-emerald-200">
                <span className="text-2xl font-bold">24/7</span>
                <span className="text-sm">Live monitoring</span>
              </div>
            </div>

            <div className="group p-8 border border-slate-200 bg-white hover:shadow-lg hover:border-blue-200 transition-all duration-300">
              <div className="p-3 bg-blue-100 border border-blue-200 w-fit mb-6">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Privacy-First</h3>
              <p className="text-slate-600 mb-4">
                No cookies, no personal data collection. GDPR compliant by design with anonymous data aggregation.
              </p>
              <div className="flex items-center space-x-2 text-blue-600 font-medium bg-blue-50 p-3 border border-blue-200">
                <span className="text-2xl font-bold">100%</span>
                <span className="text-sm">GDPR compliant</span>
              </div>
            </div>

            <div className="group p-8 border border-slate-200 bg-white hover:shadow-lg hover:border-purple-200 transition-all duration-300">
              <div className="p-3 bg-purple-100 border border-purple-200 w-fit mb-6">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Lightning Fast</h3>
              <p className="text-slate-600 mb-4">
                Ultra-lightweight script that loads in under 50ms and won't impact your site's performance.
              </p>
              <div className="flex items-center space-x-2 text-purple-600 font-medium bg-purple-50 p-3 border border-purple-200">
                <span className="text-2xl font-bold">&lt;50ms</span>
                <span className="text-sm">Load time</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 shadow-sm border border-slate-200 mb-6">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-slate-700">Open Source & Forever Free</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Built by developers, for developers
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              statistic.live is completely open source and will always be free. 
              Host it yourself or use our managed service. Currently in beta with active development.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
              <Button size="lg" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold hover:border-emerald-400 transition-all duration-200">
                Read Documentation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <StatisticLiveLogo size="default" />
                <span className="inline-flex items-center bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 border border-orange-200">
                  BETA
                </span>
              </div>
              <p className="text-slate-600 max-w-md mb-6">
                Privacy-first web analytics that's free, open source, and built for the modern web. Currently in public beta.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2 border border-slate-200">
                  <Github className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2 border border-slate-200">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2 border border-slate-200">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">Features</a></li>
                <li><a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">Self-hosting</a></li>
                <li><a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">Beta Program</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">Documentation</a></li>
                <li><a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">API Reference</a></li>
                <li><a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">Community</a></li>
                <li><a href="#" className="text-slate-600 hover:text-emerald-600 transition-colors">Beta Feedback</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-sm text-slate-500">
                © {new Date().getFullYear()} statistic.live. Open source and free forever. Currently in beta.
              </p>
              <div className="mt-4 sm:mt-0 flex space-x-6">
                <a href="#" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">Privacy</a>
                <a href="#" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">Terms</a>
                <a href="#" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">Beta Terms</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}