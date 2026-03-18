import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Pencil,
  PiggyBank,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Transaction } from "../backend.d";
import {
  useAddTransaction,
  useAllTransactions,
  useDeleteTransaction,
  useEditTransaction,
} from "../hooks/useQueries";

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

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

interface TxnFormProps {
  initial?: Transaction;
  onClose: () => void;
}

function TxnForm({ initial, onClose }: TxnFormProps) {
  const [type, setType] = useState(initial?.type ?? "income");
  const [amount, setAmount] = useState(
    initial ? String(Math.abs(Number(initial.amount))) : "",
  );
  const [note, setNote] = useState(initial?.note ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Other");
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().slice(0, 10),
  );
  const addTxn = useAddTransaction();
  const editTxn = useEditTransaction();

  const isEdit = !!initial;

  const handleSubmit = async () => {
    if (!amount || Number.isNaN(Number(amount))) {
      toast.error("Enter a valid amount");
      return;
    }
    if (isEdit) {
      await editTxn.mutateAsync({
        id: initial!.id,
        type,
        amount: Number(amount),
        note,
        category,
        date,
      });
      toast.success("Transaction updated!");
    } else {
      await addTxn.mutateAsync({
        type,
        amount: Number(amount),
        note,
        category,
        date,
      });
      toast.success("Transaction added!");
    }
    onClose();
  };

  const isPending = addTxn.isPending || editTxn.isPending;

  return (
    <div className="space-y-4">
      <div>
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
        <Label htmlFor="txn-amount" className="text-sm text-muted-foreground">
          Amount (₹)
        </Label>
        <Input
          id="txn-amount"
          data-ocid="txn_form.amount.input"
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
              data-ocid="txn_form.category.select"
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
          <Label htmlFor="txn-date" className="text-sm text-muted-foreground">
            Date
          </Label>
          <Input
            id="txn-date"
            data-ocid="txn_form.date.input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 bg-input border-border"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="txn-note" className="text-sm text-muted-foreground">
          Note (optional)
        </Label>
        <Textarea
          id="txn-note"
          data-ocid="txn_form.note.textarea"
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
          data-ocid="txn_form.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="flex-1 bg-primary text-primary-foreground"
          onClick={handleSubmit}
          disabled={isPending}
          data-ocid="txn_form.submit_button"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {isEdit ? "Update" : "Add Transaction"}
        </Button>
      </div>
    </div>
  );
}

export default function Transactions() {
  const { data: txns = [], isLoading } = useAllTransactions();
  const deleteTxn = useDeleteTransaction();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editTxn, setEditTxn] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    let list = [...txns].sort((a, b) => b.date.localeCompare(a.date));
    if (filterType !== "all") list = list.filter((t) => t.type === filterType);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.note.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [txns, filterType, search]);

  const getTxnInfo = (type: string) =>
    TRANSACTION_TYPES.find((t) => t.value === type) ?? TRANSACTION_TYPES[0];

  const handleDelete = async (id: bigint) => {
    await deleteTxn.mutateAsync(id);
    toast.success("Transaction deleted");
  };

  return (
    <div className="space-y-6 max-w-screen-lg mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {txns.length} total records
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="transactions.add.open_modal_button"
              className="bg-primary text-primary-foreground gap-2"
            >
              <Plus className="w-4 h-4" /> Add Transaction
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
            <TxnForm onClose={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="card-glass rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="transactions.search.input"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-input border-border"
          />
        </div>
        <div
          data-ocid="transactions.filter.tab"
          className="flex items-center bg-muted/60 rounded-xl p-1 gap-1"
        >
          {["all", "income", "expense", "investment", "debt"].map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filterType === t
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "all" ? "All" : getTxnInfo(t).label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="card-glass rounded-2xl overflow-hidden">
        {isLoading ? (
          <div
            data-ocid="transactions.loading_state"
            className="p-8 text-center"
          >
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="transactions.empty_state"
            className="p-12 text-center text-muted-foreground"
          >
            <svg
              className="w-8 h-8 mx-auto mb-3 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <title>No transactions</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
              />
            </svg>
            <p className="text-sm">
              No transactions found. Start tracking your finances!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            <AnimatePresence>
              {filtered.map((txn, i) => {
                const info = getTxnInfo(txn.type);
                const isPositive =
                  txn.type === "income" || txn.type === "investment";
                return (
                  <motion.div
                    key={String(txn.id)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    data-ocid={`transactions.item.${i + 1}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/30 transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl ${info.bg} flex items-center justify-center flex-shrink-0`}
                    >
                      <info.icon className={`w-4 h-4 ${info.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {txn.note || txn.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {info.label} · {txn.category} · {fmtDate(txn.date)}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold flex-shrink-0 ${isPositive ? "text-positive" : "text-negative"}`}
                    >
                      {isPositive ? "+" : "-"}
                      {fmtCurrency(Math.abs(Number(txn.amount)))}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditTxn(txn)}
                        data-ocid={`transactions.edit_button.${i + 1}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-destructive"
                            data-ocid={`transactions.delete_button.${i + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent
                          className="bg-popover border-border"
                          data-ocid="delete_transaction.dialog"
                        >
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-foreground">
                              Delete Transaction?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                              This will permanently remove this transaction.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              data-ocid="delete_transaction.cancel_button"
                              className="border-border"
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              data-ocid="delete_transaction.confirm_button"
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(txn.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editTxn} onOpenChange={(o) => !o && setEditTxn(null)}>
        <DialogContent
          className="bg-popover border-border sm:max-w-md"
          data-ocid="edit_transaction.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Edit Transaction
            </DialogTitle>
          </DialogHeader>
          {editTxn && (
            <TxnForm initial={editTxn} onClose={() => setEditTxn(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
