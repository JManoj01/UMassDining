import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Sparkles, Settings, LogOut, User as UserIcon } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<Tab>("recommendations");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
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
      toast.success("Signed out successfully");
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
        <title>UMass Dining Recommendations | Personalized Meal Suggestions</title>
        <meta
          name="description"
          content="Get personalized meal recommendations from UMass Amherst dining halls based on your dietary preferences."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-maroon flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <span className="font-bold text-foreground">UMass</span>
                  <span className="font-bold text-primary"> Rec</span>
                </div>
              </div>

              {/* Tabs */}
              <nav className="hidden md:flex items-center gap-1 bg-secondary rounded-lg p-1">
                {[
                  { id: "recommendations", label: "For You" },
                  { id: "menus", label: "Browse Menus" },
                  { id: "preferences", label: "Preferences" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                {user ? (
                  <>
                    <span className="hidden sm:inline text-sm text-muted-foreground">
                      {user.email?.split("@")[0]}
                    </span>
                    <Button variant="ghost" size="icon" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("preferences")}
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Tabs */}
            <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
              {[
                { id: "recommendations", label: "For You" },
                { id: "menus", label: "Menus" },
                { id: "preferences", label: "Settings" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {activeTab === "recommendations" && (
            <RecommendationEngine user={user} />
          )}
          {activeTab === "menus" && <MenuBrowser />}
          {activeTab === "preferences" && (
            user ? (
              <PreferencesPanel user={user} />
            ) : (
              <AuthPage />
            )
          )}
        </main>
      </div>
    </>
  );
};

export default Index;
