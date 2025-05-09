'use client'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { error } from "console";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyClb83YmQ8EIWUE4DwIHqcHrfPyXLt0xYg",
  authDomain: "dionysusmeeting.firebaseapp.com",
  projectId: "dionysusmeeting",
  storageBucket: "dionysusmeeting.firebasestorage.app",
  messagingSenderId: "206503368966",
  appId: "1:206503368966:web:a4fe2abcd5a811457ca687",
  measurementId: "G-79R2GQV9QT"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)

export async function uploadFile(file:File,setProgress?:(progress:number)=>void){
    return new Promise((resolve,reject)=>{
        try {
            const storageRef = ref(storage,file.name)
            const uploadTask = uploadBytesResumable(storageRef,file)

            uploadTask.on('state_changed',snapshot=>{
                const progress = Math.round((snapshot.bytesTransferred/snapshot.totalBytes)*100)
                if(setProgress)setProgress(progress)

                    switch(snapshot.state){
                        case 'paused':
                            console.log('upload is paused');break;
                        case 'running':
                            console.log('upload is running');break;
                    }
            },error=>{
                reject(error)
            },()=>{
                getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl=>{
                    resolve(downloadUrl as string)
                })
            })
        } catch (error) {
            console.error(error)
            reject(error)
        }
    })
}
const analytics = getAnalytics(app);