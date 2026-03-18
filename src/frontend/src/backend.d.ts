import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Person {
    id: bigint;
    name: string;
    note: string;
    amount: number;
}
export interface UserProfile {
    name: string;
}
export interface Transaction {
    id: bigint;
    date: string;
    note: string;
    createdAt: bigint;
    type: string;
    debtPerson: string;
    category: string;
    amount: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPerson(name: string, amount: number, note: string): Promise<bigint>;
    addTransaction(type: string, amount: number, note: string, category: string, date: string, debtPerson: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deletePerson(id: bigint): Promise<void>;
    deleteTransaction(id: bigint): Promise<void>;
    editPerson(id: bigint, name: string, amount: number, note: string): Promise<void>;
    editTransaction(id: bigint, type: string, amount: number, note: string, category: string, date: string, debtPerson: string): Promise<void>;
    getAllPeople(): Promise<Array<Person>>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTransactionsByMonth(startTimestamp: bigint, endTimestamp: bigint): Promise<Array<Transaction>>;
    getTransactionsByWeek(startTimestamp: bigint, endTimestamp: bigint): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
