import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';
import { IncomeTarget } from '@/hooks/useIncomeTargets';
import { Transaction } from '@/hooks/useSupabaseFinanceData';

interface IncomeTargetListProps {
    incomeTargets: IncomeTarget[];
    incomes: Transaction[];
    totalIncome: number;
}

export function IncomeTargetList({ incomeTargets, incomes, totalIncome }: IncomeTargetListProps) {
    // Filter targets that have an amount > 0
    const activeTargets = incomeTargets.filter(t => t.amount > 0);

    if (activeTargets.length === 0) {
        return null;
    }

    // Calculate actual income per category
    const incomeByCategory = incomes.reduce((acc, income) => {
        const category = income.subcategory; // In our model, Subcategory is the specific source
        acc[category] = (acc[category] || 0) + income.amount;
        return acc;
    }, {} as Record<string, number>);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Card className="glass-card h-full">
            <CardHeader>
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    Target Pemasukan
                </CardTitle>
                <CardDescription>
                    Progress pencapaian target bulan ini
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {activeTargets.map((target) => {
                    const currentAmount = incomeByCategory[target.category] || 0;
                    const progress = Math.min((currentAmount / target.amount) * 100, 100);
                    const isCompleted = currentAmount >= target.amount;

                    return (
                        <div key={target.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">{target.category}</span>
                                <span className="text-muted-foreground">
                                    {formatCurrency(currentAmount)} / {formatCurrency(target.amount)}
                                </span>
                            </div>
                            <Progress
                                value={progress}
                                className="h-2"
                                indicatorClassName={isCompleted ? "bg-success" : "bg-primary"}
                            />
                            <div className="flex justify-end">
                                <span className={`text-xs ${isCompleted ? 'text-success font-medium' : 'text-muted-foreground'}`}>
                                    {progress.toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
