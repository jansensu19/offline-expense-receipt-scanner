import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Expense } from '@/types/expense';
import { mockExpenses } from '@/app/index';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@expenses_storage_v1';

type ExpenseContextType = {
    expenses: Expense[];
    addExpense: (newExpense: Omit<Expense, 'id'>) => void;
    deleteExpense: (id: string) => void;
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
    const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    const addExpense = (newExpense: Omit<Expense, 'id'>) => {
        const expenseWithId: Expense = {
            ...newExpense,
            id: Date.now().toString(),
        };
        setExpenses((prev) => [expenseWithId, ...prev]);
    };

    const deleteExpense = (id: string) => {
        setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    };

    useEffect(() => {
        const loadExpenses = async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored) {
                    setExpenses(JSON.parse(stored));
                }
            } catch (error) {
                console.error('Failed to load expenses:', error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadExpenses();
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)).catch((error) =>
            console.error('Failed to save expenses', error)
        )
    }, [expenses, isLoaded])

    return (
        <ExpenseContext.Provider value={{ expenses, addExpense, deleteExpense }}>
            {children}
        </ExpenseContext.Provider>
    );
}

export function useExpenses() {
    const context = useContext(ExpenseContext);
    if (!context) {
        throw new Error('useExpenses must be used within an ExpenseProvider');
    }
    return context;
}