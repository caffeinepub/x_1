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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, Plus, Trash2, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Person } from "../backend.d";
import {
  useAddPerson,
  useAllPeople,
  useDeletePerson,
  useEditPerson,
} from "../hooks/useQueries";

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.abs(n));
}

interface PersonFormProps {
  initial?: Person;
  onClose: () => void;
}

function PersonForm({ initial, onClose }: PersonFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [amountStr, setAmountStr] = useState(
    initial ? String(Number(initial.amount)) : "",
  );
  const [note, setNote] = useState(initial?.note ?? "");
  const addPerson = useAddPerson();
  const editPerson = useEditPerson();
  const isEdit = !!initial;

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Enter a name");
      return;
    }
    if (!amountStr || Number.isNaN(Number(amountStr))) {
      toast.error("Enter a valid amount");
      return;
    }
    const amount = Number(amountStr);
    if (isEdit) {
      await editPerson.mutateAsync({ id: initial!.id, name, amount, note });
      toast.success("Updated!");
    } else {
      await addPerson.mutateAsync({ name, amount, note });
      toast.success("Person added!");
    }
    onClose();
  };

  const isPending = addPerson.isPending || editPerson.isPending;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="person-name" className="text-sm text-muted-foreground">
          Name
        </Label>
        <Input
          id="person-name"
          data-ocid="person_form.name.input"
          placeholder="e.g., Rahul, Priya..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 bg-input border-border"
        />
      </div>
      <div>
        <Label
          htmlFor="person-amount"
          className="text-sm text-muted-foreground"
        >
          Amount —{" "}
          <span className="text-positive">positive (+) = they owe me</span> ·{" "}
          <span className="text-negative">negative (−) = I owe them</span>
        </Label>
        <Input
          id="person-amount"
          data-ocid="person_form.amount.input"
          type="number"
          placeholder="e.g., 500 or -1200"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          className="mt-1 bg-input border-border"
        />
      </div>
      <div>
        <Label htmlFor="person-note" className="text-sm text-muted-foreground">
          Note (optional)
        </Label>
        <Textarea
          id="person-note"
          data-ocid="person_form.note.textarea"
          placeholder="What is this for?"
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
          data-ocid="person_form.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="flex-1 bg-primary text-primary-foreground"
          onClick={handleSubmit}
          disabled={isPending}
          data-ocid="person_form.submit_button"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {isEdit ? "Update" : "Add Person"}
        </Button>
      </div>
    </div>
  );
}

interface PersonCardProps {
  person: Person;
  index: number;
  onEdit: (p: Person) => void;
}

function PersonCard({ person, index, onEdit }: PersonCardProps) {
  const deletePerson = useDeletePerson();
  const amount = Number(person.amount);
  const isPositive = amount >= 0;

  const handleDelete = async () => {
    await deletePerson.mutateAsync(person.id);
    toast.success("Removed!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.05 }}
      data-ocid={`people.item.${index + 1}`}
      className="card-glass rounded-2xl p-4 flex items-center gap-4"
    >
      <Avatar className="w-11 h-11 flex-shrink-0">
        <AvatarFallback
          className={`text-sm font-bold ${isPositive ? "bg-positive/15 text-positive" : "bg-negative/15 text-negative"}`}
        >
          {person.name[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{person.name}</p>
        {person.note && (
          <p className="text-xs text-muted-foreground truncate">
            {person.note}
          </p>
        )}
        <p
          className={`text-xs font-medium mt-0.5 ${isPositive ? "text-positive" : "text-negative"}`}
        >
          {isPositive ? "Owes you" : "You owe"}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p
          className={`text-lg font-bold ${isPositive ? "text-positive" : "text-negative"}`}
        >
          {isPositive ? "+" : "-"}
          {fmtCurrency(amount)}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-muted-foreground hover:text-foreground"
          onClick={() => onEdit(person)}
          data-ocid={`people.edit_button.${index + 1}`}
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
              data-ocid={`people.delete_button.${index + 1}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            className="bg-popover border-border"
            data-ocid="delete_person.dialog"
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">
                Remove {person.name}?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This will permanently remove this person and their debt record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                data-ocid="delete_person.cancel_button"
                className="border-border"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                data-ocid="delete_person.confirm_button"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}

export default function People() {
  const { data: people = [], isLoading } = useAllPeople();
  const [addOpen, setAddOpen] = useState(false);
  const [editPerson, setEditPerson] = useState<Person | null>(null);

  const owesMe = people.filter((p) => Number(p.amount) > 0);
  const iOwe = people.filter((p) => Number(p.amount) < 0);
  const totalOwesMe = owesMe.reduce((s, p) => s + Number(p.amount), 0);
  const totalIOwe = iOwe.reduce((s, p) => s + Math.abs(Number(p.amount)), 0);

  return (
    <div className="space-y-6 max-w-screen-md mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">People</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track who owes you and who you owe — IOUs & Debts
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="people.add.open_modal_button"
              className="bg-primary text-primary-foreground gap-2"
            >
              <Plus className="w-4 h-4" /> Add Person
            </Button>
          </DialogTrigger>
          <DialogContent
            className="bg-popover border-border sm:max-w-md"
            data-ocid="add_person.dialog"
          >
            <DialogHeader>
              <DialogTitle className="text-foreground">Add Person</DialogTitle>
            </DialogHeader>
            <PersonForm onClose={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-glass rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Total Owes Me
          </p>
          <p className="text-2xl font-bold text-positive">
            +{fmtCurrency(totalOwesMe)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {owesMe.length} people
          </p>
        </div>
        <div className="card-glass rounded-2xl p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Total I Owe
          </p>
          <p className="text-2xl font-bold text-negative">
            -{fmtCurrency(totalIOwe)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {iOwe.length} people
          </p>
        </div>
      </div>

      {isLoading ? (
        <div data-ocid="people.loading_state" className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="card-glass rounded-2xl h-20 animate-pulse"
            />
          ))}
        </div>
      ) : people.length === 0 ? (
        <div
          data-ocid="people.empty_state"
          className="card-glass rounded-2xl p-12 text-center"
        >
          <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">No people added yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add a person to track who owes you money or who you owe.
          </p>
        </div>
      ) : (
        <>
          {owesMe.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Owes Me 💸
              </h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {owesMe.map((p, i) => (
                    <PersonCard
                      key={String(p.id)}
                      person={p}
                      index={i}
                      onEdit={setEditPerson}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
          {iOwe.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                I Owe 🫡
              </h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {iOwe.map((p, i) => (
                    <PersonCard
                      key={String(p.id)}
                      person={p}
                      index={owesMe.length + i}
                      onEdit={setEditPerson}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog
        open={!!editPerson}
        onOpenChange={(o) => !o && setEditPerson(null)}
      >
        <DialogContent
          className="bg-popover border-border sm:max-w-md"
          data-ocid="edit_person.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Person</DialogTitle>
          </DialogHeader>
          {editPerson && (
            <PersonForm
              initial={editPerson}
              onClose={() => setEditPerson(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
