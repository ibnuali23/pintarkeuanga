import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { triggerSyncStart, triggerSyncComplete, triggerSyncError } from '@/components/layout/SyncStatus';

export interface IncomeTarget {
    id: string;
    user_id: string;
    category: string;
    amount: number;
    month: string; // YYYY-MM
    created_at: string;
    updated_at: string;
}

export function useIncomeTargets() {
    const { user } = useAuthContext();
    const [incomeTargets, setIncomeTargets] = useState<IncomeTarget[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchIncomeTargets = useCallback(async () => {
        if (!user) return;

        // Don't set global sync loading for initial fetch to avoid UI flicker
        const { data, error } = await supabase
            .from('income_targets')
            .select('*')
            .eq('user_id', user.id);

        if (error) {
            console.error('Error fetching income targets:', error);
            return;
        }

        setIncomeTargets(data || []);
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        fetchIncomeTargets();
    }, [fetchIncomeTargets]);

    const upsertIncomeTarget = useCallback(async (category: string, amount: number, month: string) => {
        if (!user) return { error: new Error('Not authenticated') };

        triggerSyncStart();

        const { data, error } = await supabase
            .from('income_targets')
            .upsert({
                user_id: user.id,
                category,
                amount,
                month,
            }, { onConflict: 'user_id,category,month' })
            .select()
            .single();

        if (error) {
            console.error('Error upserting income target:', error);
            triggerSyncError();
            return { error };
        }

        triggerSyncComplete();
        setIncomeTargets(prev => {
            const existing = prev.findIndex(t => t.category === category && t.month === month);
            if (existing >= 0) {
                const newTargets = [...prev];
                newTargets[existing] = data;
                return newTargets;
            }
            return [...prev, data];
        });

        return { data };
    }, [user]);

    const deleteIncomeTarget = useCallback(async (category: string, month: string) => {
        if (!user) return { error: new Error('Not authenticated') };

        triggerSyncStart();

        const { error } = await supabase
            .from('income_targets')
            .delete()
            .eq('user_id', user.id)
            .eq('category', category)
            .eq('month', month);

        if (error) {
            console.error('Error deleting income target:', error);
            triggerSyncError();
            return { error };
        }

        triggerSyncComplete();
        setIncomeTargets(prev => prev.filter(t => !(t.category === category && t.month === month)));
        return { success: true };
    }, [user]);

    return {
        incomeTargets,
        isLoading,
        upsertIncomeTarget,
        deleteIncomeTarget,
        refetch: fetchIncomeTargets,
    };
}
