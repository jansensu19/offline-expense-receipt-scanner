import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Camera, Image as ImageIcon, ArrowLeft, Check } from 'lucide-react-native';
import { COLORS } from './index';
import { ExpenseCategory } from '@/types/expense';
import { useExpenses } from "@/context/ExpenseContext";
import { recognizeReceiptFromBase64 } from '@/utils/parseReceipt';

interface ScannedReceipt {
    merchant: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
}

export default function ScannerScreen() {
    const cameraRef = useRef<CameraView>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [receiptUri, setReceiptUri] = useState<string | null>(null);
    const { addExpense } = useExpenses();
    const [scannedData, setScannedData] = useState<ScannedReceipt | null>(null);
    const [isScanning, setIsScanning] = useState<boolean>(false)

    const handleRecognizeReceipt = async (base64: string) => {
        try {
            setIsScanning(true);

            const parsed = await recognizeReceiptFromBase64(base64);

            setScannedData(parsed);
        } catch (error) {
            console.error('Receipt recognition failed:', error);
            setScannedData(null);
        } finally {
            setIsScanning(false);
        }
    };

    const handleSaveScannedReceipt = () => {
        if (!receiptUri || !scannedData || isScanning) return;

        addExpense({
            merchant: scannedData.merchant,
            amount: scannedData.amount,
            category: scannedData.category,
            date: scannedData.date,
            receiptUri,
        });
        setReceiptUri(null);
        setScannedData(null);
        router.push('/');
    };

    const handleTakePhoto = async () => {
        if (!cameraRef.current) return;
        try {
            setScannedData(null);

            const photo = await cameraRef.current.takePictureAsync({
                base64: true,
                quality: 0.5,
            });
            if (photo?.uri) {
                setReceiptUri(photo.uri);
            }

            if (photo?.base64) {
                await handleRecognizeReceipt(photo.base64);
            }
        } catch (error) {
            console.error('Camera capture failed:', error)
        }
    };

    const handlePickImage = async () => {
        if (isScanning) return;
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                base64: true,
                quality: 0.5,
            });
            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0]
                setReceiptUri(result.assets[0].uri);
                setScannedData(null);

                if (asset.base64) {
                    await handleRecognizeReceipt(asset.base64);
                }
            }
        } catch (error) {
            console.error('Image selection failed:', error)
        }
    };

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
                    <View style={styles.headerRow}>
                        <Pressable onPress={() => router.back()}>
                            <ArrowLeft color={COLORS.textPrimary} size={24} />
                        </Pressable>
                        <Text style={styles.headerTitle}>Receipt Scanner</Text>
                        <View style={{ width: 24 }}></View>
                    </View>


                    <View style={styles.previewContainer}>
                        {receiptUri ? (
                            <Image source={{ uri: receiptUri }} style={styles.cameraPreview} />
                        ) : permission?.granted ? (
                            <CameraView ref={cameraRef} style={styles.cameraPreview} />
                        ) : (
                            <View style={styles.permissionBox}>
                                <Text style={{ color: COLORS.textSecondary, marginBottom: 12 }}>Camera permission is needed to scan receipts</Text>
                                <Pressable style={styles.primaryBtn} onPress={requestPermission}>
                                    <Text style={styles.btnText}>Grant Camera Permission</Text>
                                </Pressable>
                            </View>
                        )}

                        <View pointerEvents='none' />

                        <View style={styles.cameraActions}>
                            <Pressable style={styles.actionBtn} onPress={handlePickImage}>
                                <ImageIcon color="#fff" size={20} />
                                <Text style={styles.btnText}>Upload</Text>
                            </Pressable>

                            {receiptUri ? (
                                <Pressable style={styles.actionBtn}
                                    onPress={() => {
                                        setReceiptUri(null);
                                        setScannedData(null);
                                    }}>
                                    <Text style={styles.btnText}>Retake</Text>
                                </Pressable>
                            ) : (
                                <Pressable style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]} onPress={handleTakePhoto}>
                                    <Camera color="#fff" size={20} />
                                    <Text style={styles.btnText}>Snap</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>

                    {receiptUri && (
                        <View style={styles.resultCard}>
                            {isScanning ? (
                                <View style={{
                                    alignItems: 'center',
                                    paddingVertical: 20,
                                }}>
                                    <ActivityIndicator
                                        size="large"
                                        color={COLORS.accentPurple}
                                    />
                                    <Text style={{
                                        color: COLORS.textSecondary,
                                        marginTop: 12,
                                    }}>
                                        Recognizing receipt...
                                    </Text>
                                </View>
                            ) : scannedData ? (
                                <>
                                    <View style={styles.resultInfo}>
                                        <View>
                                            <Text style={styles.resultLabel}>
                                                DETECTED RECEIPT
                                            </Text>

                                            <TextInput
                                                style={styles.merchantText}
                                                value={scannedData.merchant}
                                                onChangeText={(text) =>
                                                    setScannedData({ ...scannedData, merchant: text })
                                                }
                                            />

                                            <Text style={styles.metaText}>
                                                {scannedData.date} • {scannedData.category}
                                            </Text>
                                        </View>

                                        <TextInput
                                            style={styles.amountText}
                                            keyboardType="numeric"
                                            value={String(scannedData.amount)}
                                            onChangeText={(text) =>
                                                setScannedData({
                                                    ...scannedData,
                                                    amount: Number(text.replace(/[^0-9.]/g, '')) || 0,
                                                })
                                            }
                                        />
                                    </View>

                                    <Pressable
                                        style={styles.saveBtn}
                                        onPress={handleSaveScannedReceipt}
                                    >
                                        <Check color="#fff" size={18} />
                                        <Text style={styles.btnText}>
                                            Confirm & Add Expense
                                        </Text>
                                    </Pressable>
                                </>
                            ) : (
                                <Text style={{
                                    color: COLORS.textSecondary,
                                    textAlign: 'center',
                                }}>
                                    Unable to recognize receipt. Try another image.
                                </Text>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgDark,
        paddingHorizontal: 20,
        paddingTop: 26,
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        height: 48,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },

    previewContainer: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#111827',
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
        minHeight: 240,
    },
    cameraPreview: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },

    permissionBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: COLORS.cardBg,
    },

    cameraActions: {
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },

    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#374151',
        paddingVertical: 16,
        borderRadius: 14,
        gap: 8,
    },

    primaryBtn: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },

    btnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    resultCard: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 18,
        padding: 18,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    resultInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },

    resultLabel: {
        color: COLORS.accentPurple,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
    },

    merchantText: {
        color: COLORS.textPrimary,
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 6,
    },

    metaText: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },

    amountText: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
    },

    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: COLORS.accentPurple,
        paddingVertical: 16,
        borderRadius: 12,
    },
});
