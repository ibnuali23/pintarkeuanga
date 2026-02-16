import { useState, useEffect } from 'react';
import { useIncomeTargets } from '@/hooks/useIncomeTargets';
import { useProfileSettings } from '@/hooks/useProfileSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { INCOME_SUBCATEGORIES } from '@/types/finance';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface IncomeTargetSettingsProps {
    selectedMonth: Date;
}

export function IncomeTargetSettings({ selectedMonth }: IncomeTargetSettingsProps) {
    const { incomeTargets, upsertIncomeTarget, deleteIncomeTarget, isLoading } = useIncomeTargets();
    const { customCategories, addCustomCategory, deleteCustomCategory } = useProfileSettings();
    const { toast } = useToast();

    const [localTargets, setLocalTargets] = useState<Record<string, string>>({});
    const [savingItems, setSavingItems] = useState<Set<string>>(new Set());

    // Custom Category State
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    const monthKey = format(selectedMonth, 'yyyy-MM');

    // Get categories that have targets set for this month
    const existingTargetCategories = incomeTargets
        .filter(t => t.month === monthKey)
        .map(t => t.category);

    // Combine default, custom, and existing categories
    const allIncomeCategories = [
        ...INCOME_SUBCATEGORIES,
        ...customCategories
            .filter(c => c.type === 'income')
            .map(c => c.subcategory),
        ...existingTargetCategories
    ];

    // Remove duplicates
    const uniqueCategories = [...new Set(allIncomeCategories)];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const getTargetValue = (category: string) => {
        // If user is editing, show local state
        if (localTargets[category] !== undefined) {
            return localTargets[category];
        }
        // Otherwise show saved target for this month
        const target = incomeTargets.find(t => t.category === category && t.month === monthKey);
        return target ? formatCurrency(target.amount) : '';
    };

    const handleChange = (category: string, value: string) => {
        const numbers = value.replace(/\D/g, '');
        const formatted = numbers ? formatCurrency(parseInt(numbers)) : '';
        setLocalTargets(prev => ({ ...prev, [category]: formatted }));
    };

    const handleSave = async (category: string) => {
        const currentValue = localTargets[category] !== undefined
            ? localTargets[category]
            : getTargetValue(category);

        const numericValue = parseInt(currentValue.replace(/\D/g, '')) || 0;

        setSavingItems(prev => new Set(prev).add(category));

        const { error } = await upsertIncomeTarget(category, numericValue, monthKey);

        setSavingItems(prev => {
            const next = new Set(prev);
            next.delete(category);
            return next;
        });

        if (error) {
            toast({ variant: 'destructive', title: 'Gagal menyimpan target' });
        } else {
            toast({ title: 'Target berhasil disimpan' });
            setLocalTargets(prev => {
                const next = { ...prev };
                delete next[category];
                return next;
            });
        }
    };

    const handleDeleteTarget = async (categoryName: string) => {
        if (!confirm(`Apakah anda yakin ingin menghapus target/kategori "${categoryName}"?`)) return;

        // Check if it's a custom category
        const customCat = customCategories.find(c => c.subcategory === categoryName && c.type === 'income');

        if (customCat) {
            // Delete custom category (and implicitly its targets if cascaded, or user just wants category gone)
            const { error } = await deleteCustomCategory(customCat.id);
            if (error) {
                toast({ variant: 'destructive', title: 'Gagal menghapus kategori' });
            } else {
                toast({ title: 'Kategori berhasil dihapus' });
            }
        } else {
            // It's a standard/orphan category, just delete the target row
            const { error } = await deleteIncomeTarget(categoryName, monthKey);
            if (error) {
                toast({ variant: 'destructive', title: 'Gagal menghapus target' });
            } else {
                toast({ title: 'Target berhasil dihapus' });
                // Clean up local state
                setLocalTargets(prev => {
                    const next = { ...prev };
                    delete next[categoryName];
                    return next;
                });
            }
        }
    };

    const handleAddCustomCategory = async () => {
        if (!newCategoryName.trim()) return;

        setIsAddingCategory(true);
        // For income, main category is always 'Pemasukan'
        const { error } = await addCustomCategory('Pemasukan', newCategoryName, 'income');

        setIsAddingCategory(false);

        if (error) {
            toast({ variant: 'destructive', title: 'Gagal menambah kategori' });
        } else {
            toast({ title: 'Kategori berhasil ditambahkan' });
            setNewCategoryName('');
            setIsAddCategoryOpen(false);
        }
    };

    return (
        <Card className="glass-card mb-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="font-serif flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-success" />
                            Target Pemasukan
                        </CardTitle>
                        <CardDescription>
                            Atur target pemasukan bulanan per kategori
                        </CardDescription>
                    </div>
                    <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1">
                                <Plus className="h-4 w-4" />
                                Kategori Baru
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Kategori Pemasukan</DialogTitle>
                                <DialogDescription>
                                    Buat kategori pemasukan baru untuk menetapkan target spesifik.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Nama Kategori</Label>
                                    <Input
                                        placeholder="Contoh: Freelance, Dividen"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>Batal</Button>
                                <Button onClick={handleAddCustomCategory} disabled={isAddingCategory || !newCategoryName.trim()}>
                                    {isAddingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {uniqueCategories.map((category) => {
                        const key = category;
                        const isSaving = savingItems.has(key);
                        const hasLocalChange = localTargets[key] !== undefined;

                        return (
                            <div
                                key={category}
                                className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                            >
                                <span className="flex-1 text-sm font-medium truncate" title={category}>{category}</span>
                                <div className="relative w-32">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                        Rp
                                    </span>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={getTargetValue(category)}
                                        onChange={(e) => handleChange(category, e.target.value)}
                                        placeholder="0"
                                        className="pl-7 h-8 text-sm text-right"
                                    />
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        size="icon"
                                        variant={hasLocalChange ? "default" : "ghost"}
                                        onClick={() => handleSave(category)}
                                        disabled={isSaving}
                                        className="h-8 w-8"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <Save className="h-3 w-3" />
                                        )}
                                    </Button>

                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteTarget(category)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
