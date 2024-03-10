import React, {useRef, useState, useEffect, useCallback} from 'react';
import {View, StyleSheet, Text, Pressable, Animated, Button} from 'react-native';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import IonIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFS from 'react-native-fs';
import {getComments} from "@/services/api";
import {useNavigation} from "@react-navigation/core";
import {Image} from "@gluestack-ui/themed";
import { Audio } from 'expo-av';
import {additionalComments} from "@/constants/additionalComments";
import {userInfo} from "@/constants/userInfo";

export default function CameraScreen() {
    const username = "seth.photography";
    const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('front');
    const [flash, setFlash] = useState<'off' | 'on'>('off');
    const [enableHdr, setEnableHdr] = useState(false);
    const [enableNightMode, setEnableNightMode] = useState(false);
    const navigation = useNavigation();
    const camera = useRef(null);
    const [commentsQueue, setCommentsQueue] = useState([]);
    const [displayedComments, setDisplayedComments] = useState([]);


    // Recording
    const [recording, setRecording] = useState();
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [isRecording, setIsRecording] = useState(false);
    const [recordingUri, setRecordingUri] = useState(null);

    useEffect(() => {
        // This function will start and stop recording every 10 seconds
        const intervalId = setInterval(() => {
            if (!isRecording) {
                console.log('Starting recording..');
                startRecording().catch(console.error);
            } else {
                console.log('Stopping recording..');
                stopRecording(recording, isRecording).catch(console.error);
            }
        }, 8000); // 5 seconds interval

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, []); // Effect depends on isRecording state

    async function startRecording() {
        let isRecording = false; // Assuming you have this state defined elsewhere
        let recording = undefined; // Assuming you have this state defined elsewhere

        try {
            // Requesting permission to access the microphone
            const permissionResponse = await Audio.requestPermissionsAsync();

            if (permissionResponse.status !== 'granted') {
                console.log('Permission not granted:', permissionResponse);
                return; // Exit if permission not granted
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log('Starting recording..');
            const recordingResult = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            recording = recordingResult.recording;
            isRecording = true; // Update recording status
            console.log('Recording started');

            // Automatically stop recording after 5 seconds
            setTimeout(() => {
                if (isRecording) {
                    stopRecording(recording, isRecording).catch(console.error);
                }
            }, 6000); // Stop recording after 10 seconds
        } catch (err) {
            console.error('Failed to start recording:', err);
            isRecording = false; // Ensure the recording status is updated in case of error
        }
    }

    async function stopRecording(recording, isRecording) {
        try {
            console.log('Stopping recording..');
            await recording.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: false,
            });

            const uri = recording.getURI();
            console.log('Recording stopped and stored at:', uri);
            await capturePhoto(uri); // TODO: Uncomment this line
        } catch (err) {
            console.error('Failed to stop recording:', err);
        }
    }


    let device = useCameraDevice(cameraPosition);
    const supportsFlash = device?.hasFlash ?? false;
    const supportsHdr = device?.supportsLowLightBoost ?? false;
    const canToggleNightMode = device?.supportsLowLightBoost ?? false;

    const onFlipCameraPressed = useCallback(() => {
        setCameraPosition((p) => (p === 'back' ? 'front' : 'back'))
    }, []);

    const onFlashPressed = useCallback(() => {
        setFlash((f) => (f === 'off' ? 'on' : 'off'))
    }, []);

    const onBackButtonPressed = () => {
        navigation.goBack();
    };

    const capturePhoto = useCallback(async (updatedRecordingUri: string) => {
        if (device != null && camera.current != null) {
            try {
                const photo = await camera.current.takePhoto({
                    flash: flash,
                    qualityPrioritization: 'speed',
                    enableAutoStabilization: true,
                    enableShutterSound: false,
                });
                const imagePath = photo.path;
                const base64String = await RNFS.readFile(imagePath, 'base64');
                const response = await getComments(updatedRecordingUri !== null ? updatedRecordingUri : "file://///var/mobile/Containers/Data/Application/D6325B46-663F-443A-A1D4-2AF…E6740E/Library/Caches/AV/recording-9EC8AECF-2735-445F-8EF4-9FD2DFF4CDCB.m4a", "audio", base64String);

                if (response) {
                    const newComments = JSON.parse(JSON.stringify(response.data)).comments.map((comment) => comment.replace(/[^a-zA-Z0-9_'" ]/g, ""));
                    setCommentsQueue((prevQueue) => [...prevQueue, ...newComments]);
                } else {
                    console.log("No data received from server");
                }
            } catch (error) {
                console.error('Failed to capture photo:', error);
            }
        }
    }, [device, flash]);


    useEffect(() => {
        const updateInterval = setInterval(() => {
            setDisplayedComments((currentDisplayed) => {
                if (commentsQueue.length > 0) {
                    const nextComment = commentsQueue.shift();
                    setCommentsQueue([...commentsQueue]);
                    const newDisplayed = [...currentDisplayed, nextComment].slice(-3);
                    return newDisplayed;
                } else {
                    // get three random comments from the additionalComments array
                    const temp_comments = [];
                    for (let i = 0; i < 3; i++) {
                        const randomIndex = Math.floor(Math.random() * additionalComments.length);
                        temp_comments.push(additionalComments[randomIndex]);
                    }
                    const newDisplayed = [...currentDisplayed, ...temp_comments].slice(-2);
                    return newDisplayed;


                }
                return currentDisplayed;
            });
        }, 1500); // Adjust the timing as needed

        return () => clearInterval(updateInterval);
    }, [commentsQueue]);

    const getRandomUserProfile = () => {
        const randomIndex = Math.floor(Math.random() * userInfo.length);
        return userInfo[randomIndex];
    };

    if (device == null) return <View style={styles.container}><Text>Loading...</Text></View>;

    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                ref={camera}
                photo={true}
                video={true}
                audio={true}
                exposure={0}
                orientation="portrait"
            />
            <View style={styles.userInfo}>
                <Image
                    style={styles.userPhoto}
                    source={require('../assets/images/seth-image.jpeg')}
                    alt="Profile Picture"
                />
                <Text style={styles.userName}>{username}</Text>
                <View style={styles.liveLabel}>
                    <Text style={styles.liveText}>LIVE</Text>
                </View>
                <View style={styles.viewerCountContainer}>
                    <Text style={styles.viewerCountText}>22.5k</Text>
                </View>
            </View>

            <View style={styles.rightButtonRow}>
                <Pressable style={styles.button} onPress={onBackButtonPressed}>
                    <IonIcon name="close-outline" color="white" size={24}/>
                </Pressable>
                <Pressable style={styles.button} onPress={onFlipCameraPressed}>
                    <IonIcon name="camera-reverse" color="white" size={24}/>
                </Pressable>
                {supportsFlash && (<Pressable style={styles.button} onPress={onFlashPressed}>
                    <IonIcon name={flash === 'on' ? 'flash' : 'flash-off'} color="white" size={24}/>
                </Pressable>)}
                {supportsHdr && (<Pressable style={styles.button} onPress={() => setEnableHdr((h) => !h)}>
                    <MaterialIcon name={enableHdr ? 'hdr' : 'hdr-off'} color="white" size={24}/>
                </Pressable>)}
                {canToggleNightMode && (
                    <Pressable style={styles.button} onPress={() => setEnableNightMode(!enableNightMode)}>
                        <IonIcon name={enableNightMode ? 'moon' : 'moon-outline'} color="white" size={24}/>
                    </Pressable>)}
            </View>

            <View style={styles.commentsContainer}>
                {displayedComments.map((comment, index) => {
                    // Assign a random user profile for each comment
                    const { image, name } = getRandomUserProfile();
                    return (
                        <Animated.View key={index} style={[styles.commentContainer]}>
                            <Image
                                style={styles.userPhoto} // Make sure this style makes the image small and round
                                source={image}
                                alt="Profile Picture"
                            />
                            <Text style={styles.userName}>{name}</Text>
                            <Text style={styles.text}>{comment}</Text>
                        </Animated.View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: 'black',
    }, button: {
        marginBottom: 15,
        width: 40,
        height: 40,
        borderRadius: 40 / 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Lighter background for better visibility
        shadowColor: '#000', // Adding shadow for depth
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }, rightButtonRow: {
        position: 'absolute', right: 20, top: 60,
    }, text: {
        color: 'white', fontSize: 12, textAlign: 'left',
    }, userInfo: {
        position: 'absolute', flexDirection: 'row', top: 60, left: 20, alignItems: 'center',
    }, userPhoto: {
        width: 32, height: 32, borderRadius: 25, marginRight: 10,
    }, userName: {
        color: 'white', marginTop: 5, fontSize: 14, fontWeight: 'bold', marginRight: 10,
    }, commentContainer: {
        backgroundColor: 'transparent', padding: 4, textAlign: 'left', justifyContent: 'flex-start',
    },
    commentsContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for better readability
        borderRadius: 30, // Rounded corners for the comment section
        padding: 10, // Padding around comments for a cleaner look
        width: '90%',
        position: 'absolute',
        bottom: 100,
        left: 20,
        paddingHorizontal: 10,
        paddingTop: 10,
        flexDirection: 'column',
    },
    transcribedText: {
        marginTop: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        width: '100%',
    },
    liveContainer: {
        position: 'absolute',
        top: 10, // Adjust as needed
        right: 10, // Adjust as needed
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },

    liveLabel: {
        backgroundColor: '#F2120E', // Instagram uses a red background for 'live'
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },

    liveText: {
        color: '#ffffff', // White text
        fontWeight: 'bold',
        fontSize: 13,
    },

    viewerCountContainer: {
        marginLeft: 5, // Space between the live label and viewer count
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Slightly transparent black background
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },

    viewerCountText: {
        color: '#ffffff',
        fontSize: 12,
    },

});
