import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: 'card' | 'wallet' | 'savings';
  icon: string;
  gradient: string;
}

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  icon: string;
}

interface CategoryLimit {
  category: string;
  limit: number;
  icon: string;
}

const Index = () => {
  const [accounts] = useState<Account[]>([
    {
      id: '1',
      name: 'Основная карта',
      balance: 125340,
      currency: '₽',
      type: 'card',
      icon: 'CreditCard',
      gradient: 'gradient-purple-pink',
    },
    {
      id: '2',
      name: 'Накопительный счёт',
      balance: 450000,
      currency: '₽',
      type: 'savings',
      icon: 'PiggyBank',
      gradient: 'gradient-blue',
    },
    {
      id: '3',
      name: 'Криптокошелёк',
      balance: 89200,
      currency: '₽',
      type: 'wallet',
      icon: 'Wallet',
      gradient: 'gradient-purple-pink',
    },
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      title: 'Поступление зарплаты',
      amount: 85000,
      type: 'income',
      category: 'Доход',
      date: '2026-01-08',
      icon: 'TrendingUp',
    },
    {
      id: '2',
      title: 'Супермаркет',
      amount: -3420,
      type: 'expense',
      category: 'Продукты',
      date: '2026-01-08',
      icon: 'ShoppingCart',
    },
    {
      id: '3',
      title: 'Перевод другу',
      amount: -5000,
      type: 'expense',
      category: 'Переводы',
      date: '2026-01-07',
      icon: 'Send',
    },
    {
      id: '4',
      title: 'Кэшбэк',
      amount: 1200,
      type: 'income',
      category: 'Возврат',
      date: '2026-01-06',
      icon: 'Gift',
    },
    {
      id: '5',
      title: 'Оплата интернета',
      amount: -890,
      type: 'expense',
      category: 'Услуги',
      date: '2026-01-05',
      icon: 'Wifi',
    },
  ]);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('1');
  const [categoryLimits, setCategoryLimits] = useState<CategoryLimit[]>([
    { category: 'Продукты', limit: 15000, icon: 'ShoppingCart' },
    { category: 'Переводы', limit: 10000, icon: 'Send' },
    { category: 'Услуги', limit: 5000, icon: 'Wifi' },
  ]);
  const [editingLimit, setEditingLimit] = useState<CategoryLimit | null>(null);
  const [newLimitValue, setNewLimitValue] = useState<string>('');

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const analytics = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    const totalExpenses = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    
    const categoryTotals = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);
    
    const categoryData = Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: (amount / totalExpenses) * 100,
        icon: expenses.find(t => t.category === name)?.icon || 'DollarSign'
      }))
      .sort((a, b) => b.amount - a.amount);
    
    return {
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses,
      categoryData,
      categoryTotals
    };
  }, [transactions]);

  const limitsWithProgress = useMemo(() => {
    return categoryLimits.map(limit => {
      const spent = analytics.categoryTotals[limit.category] || 0;
      const percentage = (spent / limit.limit) * 100;
      const isExceeded = percentage > 100;
      const isWarning = percentage > 80 && percentage <= 100;
      
      return {
        ...limit,
        spent,
        percentage: Math.min(percentage, 100),
        isExceeded,
        isWarning,
        remaining: limit.limit - spent
      };
    });
  }, [categoryLimits, analytics.categoryTotals]);

  useEffect(() => {
    limitsWithProgress.forEach(limit => {
      if (limit.isExceeded) {
        toast({
          title: '⚠️ Превышен лимит!',
          description: `Категория "${limit.category}": потрачено ${limit.spent.toLocaleString('ru-RU')} ₽ из ${limit.limit.toLocaleString('ru-RU')} ₽`,
          variant: 'destructive',
        });
      }
    });
  }, [limitsWithProgress]);

  const handleUpdateLimit = () => {
    if (editingLimit && newLimitValue) {
      setCategoryLimits(prev =>
        prev.map(l =>
          l.category === editingLimit.category
            ? { ...l, limit: Number(newLimitValue) }
            : l
        )
      );
      setEditingLimit(null);
      setNewLimitValue('');
      toast({
        title: '✓ Лимит обновлён',
        description: `Установлен новый лимит для категории "${editingLimit.category}"`,
      });
    }
  };

  const handleWithdraw = () => {
    if (withdrawAmount && Number(withdrawAmount) > 0) {
      alert(`Выдано ${withdrawAmount} ₽ из счёта ${accounts.find(a => a.id === selectedAccount)?.name}`);
      setWithdrawAmount('');
    }
  };

  const quickAmounts = [500, 1000, 5000, 10000];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              MoneyFlow
            </h1>
            <p className="text-muted-foreground mt-1">Ваши финансы под контролем</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Icon name="Bell" size={24} />
          </Button>
        </header>

        <Card className="glass-card border-primary/20 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-lg text-muted-foreground">Общий баланс</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">
              {totalBalance.toLocaleString('ru-RU')} ₽
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {accounts.map((account, index) => (
            <Card
              key={account.id}
              className={`glass-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105 cursor-pointer ${
                selectedAccount === account.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedAccount(account.id)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${account.gradient}`}>
                    <Icon name={account.icon} size={24} className="text-white" />
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {account.type === 'card' ? 'Карта' : account.type === 'wallet' ? 'Кошелёк' : 'Счёт'}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-2">{account.name}</h3>
                <p className="text-3xl font-bold">
                  {account.balance.toLocaleString('ru-RU')} {account.currency}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-card border-primary/20 animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Banknote" size={24} className="text-primary" />
              Выдача средств
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Сумма выдачи
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="text-2xl h-16 pr-12 bg-card/50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">
                  ₽
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  onClick={() => setWithdrawAmount(amount.toString())}
                  className="hover:bg-primary/20"
                >
                  {amount.toLocaleString('ru-RU')}
                </Button>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full gradient-purple-pink text-white font-semibold h-14 text-lg hover:opacity-90 transition-opacity"
              onClick={handleWithdraw}
              disabled={!withdrawAmount || Number(withdrawAmount) <= 0}
            >
              <Icon name="ArrowDownToLine" size={24} className="mr-2" />
              Выдать средства
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="analytics" className="animate-fade-in">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Icon name="PieChart" size={18} />
              Аналитика
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Icon name="History" size={18} />
              История
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-card border-accent/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-accent/20">
                      <Icon name="TrendingUp" size={20} className="text-accent" />
                    </div>
                    <p className="text-sm text-muted-foreground">Доходы</p>
                  </div>
                  <p className="text-3xl font-bold text-accent">
                    +{analytics.totalIncome.toLocaleString('ru-RU')} ₽
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-destructive/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-destructive/20">
                      <Icon name="TrendingDown" size={20} className="text-destructive" />
                    </div>
                    <p className="text-sm text-muted-foreground">Расходы</p>
                  </div>
                  <p className="text-3xl font-bold text-destructive">
                    -{analytics.totalExpenses.toLocaleString('ru-RU')} ₽
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Icon name="Wallet" size={20} className="text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Баланс</p>
                  </div>
                  <p className={`text-3xl font-bold ${analytics.balance >= 0 ? 'text-accent' : 'text-destructive'}`}>
                    {analytics.balance >= 0 ? '+' : ''}{analytics.balance.toLocaleString('ru-RU')} ₽
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="BarChart3" size={24} className="text-primary" />
                  Расходы по категориям
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.categoryData.map((category, index) => (
                  <div key={category.name} className="space-y-2" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg glass-card">
                          <Icon name={category.icon} size={18} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">{category.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {category.percentage.toFixed(1)}% от всех расходов
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-lg">
                        {category.amount.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                    <Progress 
                      value={category.percentage} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon name="Target" size={24} className="text-primary" />
                    Лимиты расходов
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {limitsWithProgress.filter(l => l.isExceeded).length} превышено
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {limitsWithProgress.map((limit, index) => (
                  <div key={limit.category} className="space-y-2" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          limit.isExceeded ? 'bg-destructive/20' : limit.isWarning ? 'bg-yellow-500/20' : 'glass-card'
                        }`}>
                          <Icon 
                            name={limit.icon} 
                            size={18} 
                            className={
                              limit.isExceeded ? 'text-destructive' : 
                              limit.isWarning ? 'text-yellow-500' : 
                              'text-muted-foreground'
                            } 
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{limit.category}</p>
                            {limit.isExceeded && (
                              <Badge variant="destructive" className="text-xs">Превышен</Badge>
                            )}
                            {limit.isWarning && !limit.isExceeded && (
                              <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-500">80%+</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Потрачено {limit.spent.toLocaleString('ru-RU')} ₽ из {limit.limit.toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingLimit(limit);
                              setNewLimitValue(limit.limit.toString());
                            }}
                          >
                            <Icon name="Settings" size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card border-primary/20">
                          <DialogHeader>
                            <DialogTitle>Изменить лимит</DialogTitle>
                            <DialogDescription>
                              Установите новый лимит для категории "{limit.category}"
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Новый лимит (₽)</label>
                              <Input
                                type="number"
                                value={newLimitValue}
                                onChange={(e) => setNewLimitValue(e.target.value)}
                                placeholder="Введите сумму"
                                className="h-12 text-lg"
                              />
                            </div>
                            <Button 
                              className="w-full gradient-purple-pink text-white"
                              onClick={handleUpdateLimit}
                            >
                              Сохранить
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={limit.percentage} 
                        className={`h-3 ${
                          limit.isExceeded ? '[&>div]:bg-destructive' : 
                          limit.isWarning ? '[&>div]:bg-yellow-500' : 
                          ''
                        }`}
                      />
                      {limit.isExceeded && (
                        <div 
                          className="absolute top-0 left-0 h-full bg-destructive/30 rounded-full"
                          style={{ width: '100%' }}
                        />
                      )}
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {limit.percentage.toFixed(0)}% использовано
                      </span>
                      <span className={limit.remaining >= 0 ? 'text-accent' : 'text-destructive'}>
                        {limit.remaining >= 0 ? 'Осталось' : 'Превышено на'} {Math.abs(limit.remaining).toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="TrendingUp" size={24} className="text-primary" />
                  Динамика
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-end justify-between gap-2">
                  {[65, 85, 45, 90, 75, 95, 80].map((height, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full gradient-purple-pink rounded-t-lg transition-all duration-500 hover:opacity-80"
                        style={{ 
                          height: `${height}%`,
                          animationDelay: `${index * 0.1}s`
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        {index + 3} янв
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon name="History" size={24} className="text-primary" />
                    История операций
                  </span>
                  <Button variant="ghost" size="sm">
                    <Icon name="Filter" size={18} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {transactions.map((transaction, index) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 rounded-xl glass-card hover:bg-primary/5 transition-colors"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-xl ${
                              transaction.type === 'income' ? 'bg-accent/20' : 'bg-muted'
                            }`}
                          >
                            <Icon
                              name={transaction.icon}
                              size={20}
                              className={transaction.type === 'income' ? 'text-accent' : 'text-muted-foreground'}
                            />
                          </div>
                          <div>
                            <p className="font-semibold">{transaction.title}</p>
                            <p className="text-sm text-muted-foreground">{transaction.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold text-lg ${
                              transaction.type === 'income' ? 'text-accent' : 'text-foreground'
                            }`}
                          >
                            {transaction.type === 'income' ? '+' : ''}
                            {transaction.amount.toLocaleString('ru-RU')} ₽
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;