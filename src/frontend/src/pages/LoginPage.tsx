import { Button } from "@/components/ui/button";
import { Loader2, Shield, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-glass rounded-2xl p-10 text-center"
        >
          {/* Brand */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">X</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to X
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Your personal finance tracker — Income, Expense, Investment & Debt,
            all in one place.
          </p>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              {
                icon: TrendingUp,
                label: "Track Finances",
                color: "text-positive",
              },
              { icon: Shield, label: "Secure & Private", color: "text-info" },
              { icon: Zap, label: "Real-time Updates", color: "text-warning" },
            ].map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/40"
              >
                <Icon className={`w-5 h-5 ${color}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          <Button
            data-ocid="login.primary_button"
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...
              </>
            ) : (
              "Login to Continue"
            )}
          </Button>

          <p className="text-xs text-muted-foreground mt-6">
            Secured by Internet Identity — your data stays with you.
          </p>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
