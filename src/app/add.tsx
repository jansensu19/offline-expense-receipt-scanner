import { useState } from "react";
import { Pressable, Text, TextInput, View, StyleSheet, Alert, Platform, ScrollView, KeyboardAvoidingView } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from "expo-router";
import { EXPENSE_CATEGORIES } from "@/types/expense";
import { useExpenses } from "@/context/ExpenseContext";
import { COLORS } from ".";

export default function add() {
    const { addExpense } = useExpenses();
    const [merchantName, setMerchantName] = useState<string>('');
    const [amount, setAmount] = useState<string>('0');
    const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
    const [date, setDate] = useState<Date>(new Date());
    const [showPicker, setShowPicker] = useState<boolean>(false);

    const saveExpense = () => {
        if (!merchantName.trim()) {
            Alert.alert('Please enter Merchant name');
            return;
        }

        addExpense({
            merchant: merchantName,
            amount: Number(amount),
            category,
            date: date.toISOString().split('T')[0],
        })
        Alert.alert('Success', 'Expense added!');
        setMerchantName('');
        setAmount('0');
        setDate(new Date());
        router.push('/');
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: COLORS.bgDark }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    <Text style={styles.label}>Merchant Name</Text>
                    <TextInput style={styles.input} placeholderTextColor="#8b95a5" placeholder="Starbucks" value={merchantName} onChangeText={setMerchantName}></TextInput>

                    <Text style={styles.label}>Amount</Text>
                    <TextInput style={styles.input} placeholderTextColor="#8b95a5" keyboardType="numeric" placeholder="0" value={amount} onChangeText={setAmount}></TextInput>

                    <View style={styles.categoryContainer}>
                        {EXPENSE_CATEGORIES.map((item) => (
                            <Pressable
                                key={item}
                                onPress={() => setCategory(item)}
                                style={[
                                    styles.categoryPill,
                                    category === item && styles.selectedPill,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.categoryText,
                                        category === item && styles.selectedText,
                                    ]}
                                >
                                    {item}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    <Text style={styles.label}>Date</Text>
                    <Pressable
                        style={styles.dateButton}
                        onPress={() => setShowPicker(true)}
                    >
                        <Text style={styles.dateText}>
                            {date.toLocaleDateString()}
                        </Text>
                        <Text style={styles.dateIcon}>📅</Text>
                    </Pressable>

                    {showPicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedDate) => {
                                setShowPicker(Platform.OS === 'ios');
                                if (selectedDate) setDate(selectedDate);
                            }}
                        />
                    )}

                    <Pressable style={styles.addButton} onPress={saveExpense}>
                        <Text style={styles.selectedText}>Save Expense</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgDark,
        padding: 20,
        paddingTop: 50,
    },

    screenTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 5,
    },

    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 30,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 10,
        marginTop: 15,
    },

    input: {
        backgroundColor: COLORS.cardBg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 15,
        color: COLORS.textPrimary,
        fontSize: 15,
        marginBottom: 10,
    },

    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        paddingHorizontal: 15,
    },

    currency: {
        color: COLORS.textSecondary,
        fontSize: 18,
        fontWeight: '600',
        marginRight: 10,
    },

    amountInput: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: 22,
        fontWeight: 'bold',
        paddingVertical: 15,
    },

    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },

    categoryPill: {
        backgroundColor: COLORS.cardBg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        paddingVertical: 11,
        paddingHorizontal: 18,
        borderRadius: 20,
    },

    selectedPill: {
        backgroundColor: COLORS.accentPurple,
        borderColor: COLORS.accentPurple,
    },

    categoryText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },

    selectedText: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
    },

    dateButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.cardBg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 15,
    },

    dateText: {
        color: COLORS.textPrimary,
        fontSize: 15,
    },

    dateIcon: {
        fontSize: 18,
    },

    addButton: {
        marginTop: 35,
        backgroundColor: COLORS.accentPurple,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },

    addButtonText: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});