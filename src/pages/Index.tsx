import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Sparkles, LogOut, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MenuBrowser } from "@/components/MenuBrowser";
import { RecommendationEngine } from "@/components/RecommendationEngine";
import { PreferencesPanel } from "@/components/PreferencesPanel";
import { AuthPage } from "@/components/AuthPage";

type Tab = "recommendations" | "menus" | "preferences";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("menus");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>UMass Dining | Today's Menu & Recommendations</title>
        <meta name="description" content="UMass Amherst dining hall menus and personalized meal recommendations." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Minimal Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-between h-12">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-gradient-maroon flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="font-semibold text-sm">UMass Dining</span>
              </div>

              {/* Tabs */}
              <nav className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
                {[
                  { id: "menus", label: "Menus" },
                  { id: "recommendations", label: "For You" },
                  { id: "preferences", label: "Settings" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* User */}
              <div className="flex items-center gap-2">
                {user ? (
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-7 text-xs">
                    <LogOut className="w-3 h-3 mr-1" />
                    Sign Out
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("preferences")} className="h-7 text-xs">
                    <UserIcon className="w-3 h-3 mr-1" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-5xl mx-auto px-4 py-6">
          {activeTab === "menus" && <MenuBrowser />}
          {activeTab === "recommendations" && <RecommendationEngine user={user} />}
          {activeTab === "preferences" && (user ? <PreferencesPanel user={user} /> : <AuthPage />)}
        </main>
      </div>
    </>
  );
};

export default Index;
