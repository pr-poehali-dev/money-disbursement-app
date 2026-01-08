import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

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

        <Card className="glass-card border-primary/20 animate-fade-in">
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
            <ScrollArea className="h-[400px] pr-4">
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
      </div>
    </div>
  );
};

export default Index;
