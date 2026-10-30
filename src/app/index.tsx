import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { CATEGORY_CONFIG, Expense, EXPENSE_CATEGORIES, CURRENCY, ExpenseCategory } from '@/types/expense';
import { formatCurrency } from '../utils/formatCurrency';
import SpendingChart from '@/components/SpendingChart';
import { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { Trash2 } from 'lucide-react-native';

export const mockExpenses: Expense[] = [
  {
    id: '1',
    merchant: 'Starbucks',
    category: 'Food',
    amount: 54200,
    date: '2026-10-24',
  },
  {
    id: '2',
    merchant: 'Apple Store',
    category: 'Tech',
    amount: 129900,
    date: '2026-10-23',
  },
  {
    id: '3',
    merchant: 'Uber',
    category: 'Travel',
    amount: 18000,
    date: '2026-10-22',
  },
  {
    id: '4',
    merchant: 'Netflix',
    category: 'Other',
    amount: 15000,
    date: '2026-10-21',
  },
  {
    id: '5',
    merchant: 'Whole Foods',
    category: 'Food',
    amount: 65000,
    date: '2026-10-20',
  },
  {
    id: '6',
    merchant: 'Shell Gas Station',
    category: 'Travel',
    amount: 42000,
    date: '2026-10-19',
  },
  {
    id: '7',
    merchant: 'Amazon',
    category: 'Other',
    amount: 89000,
    date: '2026-10-18',
    receiptUri: 'file:///mock-receipts/amazon.jpg',
  },
  {
    id: '8',
    merchant: 'Local Cafe',
    category: 'Food',
    amount: 8000,
    date: '2026-10-17',
  },
  {
    id: '9',
    merchant: 'Electricity Bill',
    category: 'Other',
    amount: 120000,
    date: '2026-10-15',
  },
  {
    id: '10',
    merchant: 'Gym Membership',
    category: 'Other',
    amount: 35000,
    date: '2026-10-12',
  },
];

export default function HomeScreen() {
  const { expenses, deleteExpense } = useExpenses();
  const totalBalance = expenses.reduce((sum, item) => sum + item.amount, 0);
  const [chartType, setChartType] = useState<'pie' | 'line'>('pie');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const categoryTotals = expenses.reduce<Record<string, number>>(
    (totals, expense) => {
      totals[expense.category] =
        (totals[expense.category] ?? 0) + expense.amount;

      return totals;
    },
    {},
  );

  const filteredExpenses = selectedCategory
    ? expenses.filter((e) => e.category === selectedCategory)
    : expenses;

  const pieData = EXPENSE_CATEGORIES.map((category) => ({
    name: category,
    amount: categoryTotals[category] ?? 0,
    color: CATEGORY_CONFIG[category].color,
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' }]}>Expense Report</Text>
      </View>

      {/* Total Monthly balance box */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Monthly Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(totalBalance, CURRENCY)}</Text>
      </View>

      {/* Pie || line */}
      <View>
        <View style={styles.typeChartContainer}>
          <Text style={styles.typeChartTitle}>Type chart</Text>
          <View style={styles.chartSelection}>
            <Pressable onPress={() => setChartType('pie')}>
              <Text
                style={[
                  styles.subChartSelection,
                  chartType !== 'pie' && { backgroundColor: COLORS.cardBg, color: COLORS.textSecondary },
                ]}
              >
                Pie
              </Text>
            </Pressable>
            <Pressable onPress={() => setChartType('line')}>
              <Text
                style={[
                  styles.subChartSelection,
                  chartType !== 'line' && { backgroundColor: COLORS.cardBg, color: COLORS.textSecondary },
                ]}
              >
                Line
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <SpendingChart data={pieData} type={chartType} />
        </View>
        <View style={styles.legendContainer}>
          {EXPENSE_CATEGORIES.map((category) => {
            const config = CATEGORY_CONFIG[category];
            const Icon = config.icon;

            return (
              <Pressable onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
                key={category}
                style={[
                  styles.badge,
                  { backgroundColor: `${config.color}20` }, selectedCategory === category && { borderColor: config.color, borderWidth: 1.5}
                ]}
              >
                <Icon size={14} color={config.color} />
                <Text style={styles.categoryText}>{category}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* List of Expense */}
      <View>
        {filteredExpenses.map((expense) => {
          const config = CATEGORY_CONFIG[expense.category];
          const Icon = config.icon;

          return (
            <View style={[styles.cardBg, { backgroundColor: `${config.color}20` }]} key={expense.id}>
              <View style={styles.cardBadge}>
                <Icon size={24} color={config.color} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.cardMerchantText, { color: COLORS.textPrimary }]}>
                  {expense.merchant}
                </Text>
                <Text style={{ color: COLORS.textSecondary }}>
                  {expense.date}
                </Text>
              </View>

              <Text style={[styles.cardAmountText, { color: COLORS.textPrimary }]}>
                {formatCurrency(expense.amount, CURRENCY)}
              </Text>

              <View style={styles.cardDelete}>
                <Pressable onPress={() => deleteExpense(expense.id)}><Trash2 size={20} color={'#FF0000'} /></Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

export const COLORS = {
  bgDark: '#0b0e14',
  cardBg: '#161b26',
  accentPurple: '#6c5ce7',
  textPrimary: '#ffffff',
  textSecondary: '#8b95a5',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    padding: 20,
  },

  scrollContent: {
    paddingBottom: 50,
    paddingTop: 20,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    marginBottom: 5,
    margin: 'auto'
  },

  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 5,
  },

  balanceLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },

  balanceAmount: {
    color: COLORS.textPrimary,
    fontSize: 34,
    fontWeight: 'bold',
  },

  typeChartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  typeChartTitle: {
    color: COLORS.textPrimary,
  },

  chartSelection: {
    flexDirection: 'row',

  },

  subChartSelection: {
    color: COLORS.textPrimary,
    marginLeft: 5,
    marginRight: 5,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 5,
    backgroundColor: '#3B82F6',
    fontFamily: 'sans-serif'
  },

  legendContainer: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
    marginBottom: 5
  },

  badge: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 5,
  },

  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5
  },

  cardBg: {
    backgroundColor: COLORS.cardBg,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    padding: 10,
    borderRadius: 12,
  },

  cardBadge: {
    justifyContent: 'center',
    margin: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 8
  },

  cardMerchantText: {
    marginTop: 4,
    fontSize: 14
  },

  cardAmountText: {
    fontSize: 14,
    fontWeight: '600',
    paddingRight: 4,
  },

  cardDelete: {
    justifyContent: 'center',
    margin: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 5
  },

});