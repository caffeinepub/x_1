import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Person, Transaction } from "../backend.d";
import { useActor } from "./useActor";

function getWeekRange(): [bigint, bigint] {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return [
    BigInt(monday.getTime()) * BigInt(1_000_000),
    BigInt(sunday.getTime()) * BigInt(1_000_000),
  ];
}

function getMonthRange(): [bigint, bigint] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  return [
    BigInt(start.getTime()) * BigInt(1_000_000),
    BigInt(end.getTime()) * BigInt(1_000_000),
  ];
}

export function useAllTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTransactionsByPeriod(period: "weekly" | "monthly") {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions", period],
    queryFn: async () => {
      if (!actor) return [];
      const [start, end] =
        period === "weekly" ? getWeekRange() : getMonthRange();
      return period === "weekly"
        ? actor.getTransactionsByWeek(start, end)
        : actor.getTransactionsByMonth(start, end);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllPeople() {
  const { actor, isFetching } = useActor();
  return useQuery<Person[]>({
    queryKey: ["people"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPeople();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      type: string;
      amount: number;
      note: string;
      category: string;
      date: string;
    }) =>
      actor!.addTransaction(
        vars.type,
        vars.amount,
        vars.note,
        vars.category,
        vars.date,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useEditTransaction() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      id: bigint;
      type: string;
      amount: number;
      note: string;
      category: string;
      date: string;
    }) =>
      actor!.editTransaction(
        vars.id,
        vars.type,
        vars.amount,
        vars.note,
        vars.category,
        vars.date,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteTransaction(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useAddPerson() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { name: string; amount: number; note: string }) =>
      actor!.addPerson(vars.name, vars.amount, vars.note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["people"] }),
  });
}

export function useEditPerson() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      id: bigint;
      name: string;
      amount: number;
      note: string;
    }) => actor!.editPerson(vars.id, vars.name, vars.amount, vars.note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["people"] }),
  });
}

export function useDeletePerson() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deletePerson(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["people"] }),
  });
}
