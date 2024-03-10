import React, { useState } from 'react';
import { Pressable, StyleSheet, View, ImageBackground } from 'react-native';
import {
    GluestackUIProvider,
    Heading,
    Box,
    Avatar,
    Input,
    Card,
    Text,
    InputField,
    Image,
    HStack, Switch
} from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/core';
import { launchImageLibrary } from 'react-native-image-picker';

export default function TabOneScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [userName, setUserName] = useState('Sethu Pavan');
    const [avatarUri, setAvatarUri] = useState(null);

    const pickImage = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                const source = { uri: response.assets[0].uri };
                setAvatarUri(source.uri);
            }
        });
    };

    const styles = StyleSheet.create({
        appContainer: {
            width: '100%',
            flex: 1,
            paddingTop: insets.top + 20,
            paddingHorizontal: 20,
            backgroundColor: '#F0F0F5', // Light background to ensure content stands out
        },
        cardStyle: {
            paddingVertical: 30,
            paddingHorizontal: 20,
            borderRadius: 20,
            alignItems: 'center',
            backgroundColor: '#FFFFFF', // Card with white background for contrast
        },
        inputStyle: {
            borderColor: '#D0D0D0', // Subtle border color for inputs
            borderWidth: 1,
            borderRadius: 10,
            padding: 10,
            marginTop: 20,
            marginBottom: 20,
            width: '100%',
        },
        buttonStyle: {
            width: '100%',
            backgroundColor: '#6947E2',
            paddingVertical: 12,
            paddingHorizontal: 25,
            borderRadius: 12,
        },
        buttonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
            textAlign: 'center',
        },
        headingStyle: {
            marginBottom: 20,
            color: '#333333',
            fontWeight: 'bold',
            fontSize: 24,
        },
    });

    return (
        <GluestackUIProvider config={config}>
            <View style={styles.appContainer}>
                <Text style={styles.headingStyle}>Echo</Text>
                <Card style={styles.cardStyle}>
                    <Pressable onPress={pickImage}>
                        <Image
                            source={avatarUri ? { uri: avatarUri } : require('../assets/images/seth-image.jpeg')}
                            size="xl"
                            borderRadius="$full"
                            alignSelf="center"
                            alt="Profile Picture"
                        />
                    </Pressable>
                    <Input variant="outline" size="md" margin={10} style={styles.inputStyle}>
                        <InputField
                            placeholder="Enter your name"
                            value={userName}
                            onChangeText={setUserName}
                        />
                    </Input>
                    <Pressable style={styles.buttonStyle} onPress={() => navigation.navigate('camera')}>
                        <Text style={styles.buttonText}>Start Live Simulator</Text>
                    </Pressable>
                </Card>
                <Card style={styles.cardStyle}>
                    <HStack space="md">
                        <Switch/>
                        <Text size="sm" >Allow notifications</Text>
                    </HStack>
                </Card>
            </View>
        </GluestackUIProvider>
    );
}
