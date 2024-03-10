import axios from "axios";
import {Platform} from "react-native";

const BASE_URL = 'https://bb2c-213-86-221-106.ngrok-free.app/';
export const axiosInstance = axios.create({ baseURL: BASE_URL });
/*
export const getCommentsForImage = async (imageBase64: string, audi) => {
    const config = {
        timeout: 30000,
        headers: {'Content-Type': 'application/json',}
    }

    const body = {
        image: imageBase64,
        text: ""
    }

try {
        const response = await axiosInstance.post('generate_comments', body, config);
        return response;
    } catch (e) {
        console.log(e);
        return null;
    }
}*/

export const getComments = async (uri: string, name: string, imageBase64: string) => {
    const config = {
        timeout: 30000,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    };

    const fileType = name.split('.').pop();
    // Adjusted for correct audio MIME type
    const mimeType = fileType === 'mp3' ? `audio/mpeg` : `audio/${fileType}`;

    const formData = new FormData();
    formData.append('title', name);
    formData.append('file', {
        name: name,
        type: mimeType,
        uri: uri.replace('file://', ''),
    });
    formData.append('image', imageBase64);

    try {
        const response = await axiosInstance.post('generate_comments', formData, config);
        return response;
    } catch (e) {
        console.log(e);
        return null;
    }
};
