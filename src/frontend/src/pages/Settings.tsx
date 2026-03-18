import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Info, LogOut, Shield, User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Settings() {
  const { identity, clear } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString() ?? "Not connected";

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Account */}
      <div className="card-glass rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-info/15 flex items-center justify-center">
            <User className="w-4 h-4 text-info" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Account</h2>
        </div>
        <Separator className="bg-border" />
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Principal ID
            </p>
            <p className="text-sm text-foreground font-mono break-all mt-1">
              {principal}
            </p>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card-glass rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-positive/15 flex items-center justify-center">
            <Shield className="w-4 h-4 text-positive" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Security</h2>
        </div>
        <Separator className="bg-border" />
        <p className="text-sm text-muted-foreground">
          Your data is secured by Internet Identity on the Internet Computer. No
          passwords, no servers — just your cryptographic identity.
        </p>
        <Button
          data-ocid="settings.logout.button"
          variant="outline"
          className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={clear}
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      {/* About */}
      <div className="card-glass rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-warning/15 flex items-center justify-center">
            <Info className="w-4 h-4 text-warning" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            About X Finance
          </h2>
        </div>
        <Separator className="bg-border" />
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Track your <span className="text-positive">Income</span>,{" "}
            <span className="text-negative">Expenses</span>,{" "}
            <span className="text-info">Investments</span>, and{" "}
            <span className="text-warning">Debts</span> in one place.
          </p>
          <p>
            Use the <strong className="text-foreground">People</strong> section
            to track IOUs — who owes you and who you owe.
          </p>
          <p>
            Switch between <strong className="text-foreground">Weekly</strong>{" "}
            and <strong className="text-foreground">Monthly</strong> views on
            the Dashboard to track your progress.
          </p>
        </div>
      </div>
    </div>
  );
}
