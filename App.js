import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, Platform, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export default function CopyPercentage() {
    const [fileUri, setFileUri] = useState('');
    const [percentage, setPercentage] = useState(0);

    const handleFilePick = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({ //使用者檔案選擇
                type: '*/*', //不限檔案格式
                copyToCacheDirectory: false, //快取儲存（這裡設定True會先被expo讀走,讓獲取選擇檔案的原始路徑變為快取路徑）
            });

            if (res.type === 'success') {
                setFileUri(res.uri);
                setPercentage(0); //選擇新的檔案時重置百分比
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // 使用者取消選擇檔案
            } else {
                Alert.alert('錯誤', '選擇檔案時發生錯誤');
            }
        }
    };

    const clearFile = () => { //清除檔案和將進度百分比歸零
        setFileUri('');
        setPercentage(0);
    };

    const copyFile = async () => {
        if (!fileUri) { // 如果fileUri是空的
            Alert.alert('錯誤', '請先選擇檔案');
            return;
        }

        const fileName = fileUri.split('/').pop();
        const destUri = `${FileSystem.documentDirectory}${fileName}`; //儲存路徑

        try {
            await FileSystem.copyAsync({ //檔案複製
                from: fileUri, //來源路徑
                to: destUr,   //儲存路徑
                progressCallback: (data) => { //更新複製進度precent
                    const newPercentage = Math.floor(
                        (data.totalBytesWritten / data.totalBytesExpectedToWrite) * 100
                    );
                    setPercentage(newPercentage);
                },
            });

            setPercentage(100);
            Alert.alert('成功', '檔案複製成功');

            if (Platform.OS === 'ios') {
                const path = `${FileSystem.documentDirectory}${fileName}`;  //儲存路徑
                const destination = `${FileSystem.cacheDirectory}${fileName}`; //快取儲存路徑

                await FileSystem.copyAsync({
                    from: path,
                    to: destination,
                });
            }
        } catch (error) {
            Alert.alert('錯誤', '複製檔案時發生錯誤');
        }
    };
    //元件
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select a file to copy:</Text>
            <TouchableOpacity style={styles.button} onPress={handleFilePick}>
                <Text style={styles.buttonText}>Select</Text>
            </TouchableOpacity>

            <Text style={[styles.filePath, fileUri !== '' && styles.selectedFilePath]}>
                {fileUri !== '' ? `Selected file: ${fileUri}` : 'No file selected'}
            </Text>

            <View style={styles.progressContainer}>
                <Text style={styles.percentage}>{percentage}%</Text>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressBarFill,
                            { width: percentage > 0 ? `${percentage}%` : '0%' },
                        ]}
                    />
                </View>
            </View>
            <TouchableOpacity style={styles.button} onPress={clearFile}>
                <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={copyFile}>
                <Text style={styles.buttonText}>Copy</Text>
            </TouchableOpacity>
            {/*   //按鈕：確認真實檔案傳送路徑和快取路徑
            <Button
                title="Print File Path of document"
                onPress={() => console.log(FileSystem.documentDirectory)}
            />
            <Button
                title="Print File Path of cache"
                onPress={() => console.log(FileSystem.cacheDirectory)}
            />
                 */}
        </View>
    );
}
//樣式
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    selectedFilePath: {
        fontSize: 16,
        color: 'black',
        marginTop: 10,
    },
    filePath: {
        marginBottom: 20,
        fontSize: 20,
    },
    button: {
        backgroundColor: '#3D3D4C',
        borderRadius: 30,
        padding: 10,
        width: '80%',
        alignItems: 'center',
        marginRight: '10%',
        marginLeft: '10%',
        marginBottom: 10,

    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    progressContainer: {
        width: '100%',
        marginBottom: 20,
    },
    percentage: {
        textAlign: 'center',
        marginBottom: 5,
    },
    progressBar: {
        height: 10,
        backgroundColor: '#ccc',
        borderRadius: 5,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: 'green',
        borderRadius: 5,
    },
});