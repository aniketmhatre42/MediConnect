import { storage, db } from './config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const uploadFaceDescriptor = async (userId, faceDescriptor) => {
  try {
    await setDoc(doc(db, 'faceDescriptors', userId), {
      descriptor: Array.from(faceDescriptor),
      timestamp: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error uploading face descriptor:', error);
    return false;
  }
};

export const getFaceDescriptor = async (userId) => {
  try {
    const docRef = doc(db, 'faceDescriptors', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return new Float32Array(data.descriptor);
    }
    return null;
  } catch (error) {
    console.error('Error getting face descriptor:', error);
    return null;
  }
};

export const uploadFaceImage = async (userId, imageBlob) => {
  try {
    const storageRef = ref(storage, `faceImages/${userId}`);
    await uploadBytes(storageRef, imageBlob);
    const imageUrl = await getDownloadURL(storageRef);
    return imageUrl;
  } catch (error) {
    console.error('Error uploading face image:', error);
    return null;
  }
};
