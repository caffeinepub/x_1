import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CreditCard,
  Loader2,
  PiggyBank,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Transaction } from "../backend.d";
import Sparkline from "../components/Sparkline";
import {
  useAddTransaction,
  useAllPeople,
  useTransactionsByPeriod,
} from "../hooks/useQueries";

type Period = "weekly" | "monthly";

const TRANSACTION_TYPES = [
  {
    value: "income",
    label: "Income",
    icon: TrendingUp,
    color: "text-positive",
    bg: "bg-positive/15",
  },
  {
    value: "expense",
    label: "Expense",
    icon: TrendingDown,
    color: "text-negative",
    bg: "bg-negative/15",
  },
  {
    value: "investment",
    label: "Investment",
    icon: PiggyBank,
    color: "text-info",
    bg: "bg-info/15",
  },
  {
    value: "debt",
    label: "Debt",
    icon: CreditCard,
    color: "text-warning",
    bg: "bg-warning/15",
  },
];

const CATEGORIES = [
  "Salary",
  "Freelance",
  "Food",
  "Transport",
  "Shopping",
  "Rent",
  "EMI",
  "SIP",
  "Stocks",
  "Loan",
  "Personal",
  "Other",
];

function calcSummary(txns: Transaction[]) {
  let income = 0;
  let expense = 0;
  let investment = 0;
  let debt = 0;
  for (const t of txns) {
    const amt = Number(t.amount);
    if (t.type === "income") income += amt;
    else if (t.type === "expense") expense += amt;
    else if (t.type === "investment") investment += amt;
    else if (t.type === "debt") debt += amt;
  }
  return {
    income,
    expense,
    investment,
    debt,
    net: income + investment - expense - debt,
  };
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function generateSparkData(txns: Transaction[], type: string): number[] {
  const filtered = txns.filter((t) => t.type === type);
  if (filtered.length === 0) return [0, 0, 0, 0, 0, 0, 0];
  const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
  const result: number[] = [];
  let cum = 0;
  for (const t of sorted) {
    cum += Number(t.amount);
    result.push(cum);
  }
  while (result.length < 7) result.unshift(result[0] ?? 0);
  return result.slice(-7);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

interface AddTransactionFormProps {
  onClose: () => void;
}

function AddTransactionForm({ onClose }: AddTransactionFormProps) {
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("Other");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const addTxn = useAddTransaction();

  const handleSubmit = async () => {
    if (!amount || Number.isNaN(Number(amount))) {
      toast.error("Enter a valid amount");
      return;
    }
    await addTxn.mutateAsync({
      type,
      amount: Number(amount),
      note,
      category,
      date,
      debtPerson: "",
    });
    toast.success("Transaction added!");
    onClose();
  };

  return (
    <div className="space-y-4">
      <div data-ocid="add_transaction.type.select">
        <Label className="text-sm text-muted-foreground mb-2 block">Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {TRANSACTION_TYPES.map((t) => (
            <button
              type="button"
              key={t.value}
              onClick={() => setType(t.value)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                type === t.value
                  ? `${t.bg} border-current ${t.color}`
                  : "border-border text-muted-foreground hover:border-border/80"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="amount" className="text-sm text-muted-foreground">
          Amount (₹)
        </Label>
        <Input
          id="amount"
          data-ocid="add_transaction.amount.input"
          type="number"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 bg-input border-border"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm text-muted-foreground">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger
              data-ocid="add_transaction.category.select"
              className="mt-1 bg-input border-border"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="date" className="text-sm text-muted-foreground">
            Date
          </Label>
          <Input
            id="date"
            data-ocid="add_transaction.date.input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 bg-input border-border"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="note" className="text-sm text-muted-foreground">
          Note (optional)
        </Label>
        <Textarea
          id="note"
          data-ocid="add_transaction.note.textarea"
          placeholder="e.g., Monthly salary, Rent payment..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 bg-input border-border resize-none"
          rows={2}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-border"
          onClick={onClose}
          data-ocid="add_transaction.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="flex-1 bg-primary text-primary-foreground"
          onClick={handleSubmit}
          disabled={addTxn.isPending}
          data-ocid="add_transaction.submit_button"
        >
          {addTxn.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Add Transaction
        </Button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [addOpen, setAddOpen] = useState(false);
  const { data: txns = [], isLoading } = useTransactionsByPeriod(period);
  const { data: allTxns = [] } = useTransactionsByPeriod("monthly");
  const { data: people = [] } = useAllPeople();

  const summary = calcSummary(txns);

  const recentTxns = [...allTxns]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const owesMe = people.filter((p) => Number(p.amount) > 0).slice(0, 3);
  const iOwe = people.filter((p) => Number(p.amount) < 0).slice(0, 3);

  const kpiCards = [
    {
      title: "Total Income",
      value: summary.income,
      color: "#33D17A",
      icon: TrendingUp,
      spark: generateSparkData(txns, "income"),
    },
    {
      title: "Total Expense",
      value: summary.expense,
      color: "#FF5C6C",
      icon: TrendingDown,
      spark: generateSparkData(txns, "expense"),
    },
    {
      title: "Investment",
      value: summary.investment,
      color: "#4DA3FF",
      icon: PiggyBank,
      spark: generateSparkData(txns, "investment"),
    },
    {
      title: "Debt",
      value: summary.debt,
      color: "#F5B64C",
      icon: CreditCard,
      spark: generateSparkData(txns, "debt"),
    },
  ];

  const getTxnTypeInfo = (type: string) =>
    TRANSACTION_TYPES.find((t) => t.value === type) ?? TRANSACTION_TYPES[0];

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      {/* Hero Row */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Good {getGreeting()}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Dashboard Overview —{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period Toggle */}
          <div
            data-ocid="dashboard.period.toggle"
            className="flex items-center bg-muted/60 rounded-xl p-1 border border-border"
          >
            {(["weekly", "monthly"] as Period[]).map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  period === p
                    ? "bg-accent text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "weekly" ? "Weekly" : "Monthly"}
              </button>
            ))}
          </div>
          {/* Add Transaction */}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="dashboard.add_transaction.open_modal_button"
                className="bg-primary text-primary-foreground gap-2"
              >
                <Plus className="w-4 h-4" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bg-popover border-border sm:max-w-md"
              data-ocid="add_transaction.dialog"
            >
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Add Transaction
                </DialogTitle>
              </DialogHeader>
              <AddTransactionForm onClose={() => setAddOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Net Balance Banner */}
      <div className="card-glass rounded-2xl px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/60 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Net Balance
            </p>
            <p
              className={`text-2xl font-bold ${summary.net >= 0 ? "text-positive" : "text-negative"}`}
            >
              {fmtCurrency(summary.net)}
            </p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Income + Investment − Expense − Debt ={" "}
          <span
            className={summary.net >= 0 ? "text-positive" : "text-negative"}
          >
            {fmtCurrency(summary.net)}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div
          data-ocid="dashboard.kpi.loading_state"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="card-glass rounded-2xl p-5 h-36 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              data-ocid={`dashboard.kpi.${card.title.toLowerCase().replace(/ /g, "_")}.card`}
              className="card-glass rounded-2xl p-5 flex flex-col justify-between min-h-32"
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${card.color}22` }}
                >
                  <card.icon
                    className="w-4 h-4"
                    style={{ color: card.color }}
                  />
                </div>
                <Sparkline
                  data={card.spark}
                  color={card.color}
                  width={70}
                  height={32}
                />
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground font-medium">
                  {card.title}
                </p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {fmtCurrency(card.value)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Bottom section: Recent Transactions + People */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 card-glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              Recent Transactions
            </h2>
            <span className="text-xs text-muted-foreground">
              {period === "weekly" ? "This Week" : "This Month"}
            </span>
          </div>
          {recentTxns.length === 0 ? (
            <div
              data-ocid="dashboard.transactions.empty_state"
              className="text-center py-8 text-muted-foreground text-sm"
            >
              No transactions yet. Add your first one!
            </div>
          ) : (
            <div className="space-y-2">
              {recentTxns.map((txn, i) => {
                const info = getTxnTypeInfo(txn.type);
                const isPositive =
                  txn.type === "income" || txn.type === "investment";
                return (
                  <div
                    key={String(txn.id)}
                    data-ocid={`dashboard.transactions.item.${i + 1}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/40 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg ${info.bg} flex items-center justify-center flex-shrink-0`}
                    >
                      <info.icon className={`w-4 h-4 ${info.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {txn.note || txn.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {txn.category} · {txn.date}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold flex-shrink-0 ${isPositive ? "text-positive" : "text-negative"}`}
                    >
                      {isPositive ? "+" : "-"}
                      {fmtCurrency(Math.abs(Number(txn.amount)))}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* People IOUs */}
        <div className="card-glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            People: IOUs & Debts
          </h2>
          {owesMe.length === 0 && iOwe.length === 0 ? (
            <div
              data-ocid="dashboard.people.empty_state"
              className="text-center py-6 text-muted-foreground text-xs"
            >
              No people added yet.
            </div>
          ) : (
            <div className="space-y-4">
              {owesMe.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Owes Me
                  </p>
                  <div className="space-y-2">
                    {owesMe.map((p, i) => (
                      <div
                        key={String(p.id)}
                        data-ocid={`dashboard.owes_me.item.${i + 1}`}
                        className="flex items-center gap-2"
                      >
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="bg-positive/15 text-positive text-xs">
                            {p.name[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 text-sm text-foreground truncate">
                          {p.name}
                        </span>
                        <span className="text-sm font-semibold text-positive">
                          +{fmtCurrency(Number(p.amount))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {iOwe.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    I Owe
                  </p>
                  <div className="space-y-2">
                    {iOwe.map((p, i) => (
                      <div
                        key={String(p.id)}
                        data-ocid={`dashboard.i_owe.item.${i + 1}`}
                        className="flex items-center gap-2"
                      >
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="bg-negative/15 text-negative text-xs">
                            {p.name[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 text-sm text-foreground truncate">
                          {p.name}
                        </span>
                        <span className="text-sm font-semibold text-negative">
                          {fmtCurrency(Number(p.amount))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
