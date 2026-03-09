import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { triggerSyncStart, triggerSyncComplete, triggerSyncError } from '@/components/layout/SyncStatus';

export type DebtType = 'hutang' | 'piutang';
export type DebtStatus = 'belum_lunas' | 'lunas';

export interface Debt {
    id: string;
    user_id: string;
    type: DebtType;
    amount: number;
    person_name: string;
    description: string | null;
    due_date: string | null;
    status: DebtStatus;
    created_at: string;
    updated_at: string;
}

export function useDebts() {
    const { user, isAuthenticated } = useAuthContext();
    const [debts, setDebts] = useState<Debt[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDebts = useCallback(async () => {
        if (!user) return;

        // Using any for Supabase queries to untyped tables until we regenerate types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from('debts' as any)
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching debts:', error);
            return;
        }

        setDebts((data as unknown as Debt[]) || []);
    }, [user]);

    useEffect(() => {
        if (isAuthenticated && user) {
            setIsLoading(true);
            fetchDebts().finally(() => setIsLoading(false));
        } else {
            setDebts([]);
            setIsLoading(false);
        }
    }, [isAuthenticated, user, fetchDebts]);

    const addDebt = useCallback(async (debtData: {
        type: DebtType;
        amount: number;
        person_name: string;
        description?: string;
        due_date?: string;
    }) => {
        if (!user) return { error: new Error('Not authenticated') };
        triggerSyncStart();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from('debts' as any)
            .insert({
                user_id: user.id,
                type: debtData.type,
                amount: debtData.amount,
                person_name: debtData.person_name,
                description: debtData.description || null,
                due_date: debtData.due_date || null,
                status: 'belum_lunas',
            })
            .select()
            .single();

        if (error) {
            triggerSyncError();
            console.error('Error adding debt:', error);
            return { error };
        }

        triggerSyncComplete();
        setDebts((prev) => [data as unknown as Debt, ...prev]);
        return { data: data as unknown as Debt };
    }, [user]);

    const updateDebt = useCallback(async (id: string, updates: Partial<Pick<Debt, 'amount' | 'person_name' | 'description' | 'due_date' | 'status'>>) => {
        if (!user) return { error: new Error('Not authenticated') };
        triggerSyncStart();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from('debts' as any)
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            triggerSyncError();
            console.error('Error updating debt:', error);
            return { error };
        }

        triggerSyncComplete();
        setDebts((prev) => prev.map((d) => (d.id === id ? (data as unknown as Debt) : d)));
        return { data: data as unknown as Debt };
    }, [user]);

    const deleteDebt = useCallback(async (id: string) => {
        if (!user) return { error: new Error('Not authenticated') };
        triggerSyncStart();

        const { error } = await supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from('debts' as any)
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            triggerSyncError();
            console.error('Error deleting debt:', error);
            return { error };
        }

        triggerSyncComplete();
        setDebts((prev) => prev.filter((d) => d.id !== id));
        return { success: true };
    }, [user]);

    return {
        debts,
        isLoading,
        addDebt,
        updateDebt,
        deleteDebt,
        refetch: fetchDebts,
    };
}
