import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore, doc, getDoc, getDocs, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyAmU_ge_XN7-BMcAiUicqGwBy64j-DKAe0",

    authDomain: "tappd-lukasolivier.firebaseapp.com",

    projectId: "tappd-lukasolivier",

    storageBucket: "tappd-lukasolivier.appspot.com",

    messagingSenderId: "75725276389",

    appId: "1:75725276389:web:c2bb56727dc770773d400c",

    measurementId: "G-VET75C3VQJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

async function addOrder(order) {
    try {
        const docRef = await addDoc(collection(db, "orders"), {
            order: order,
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

async function getOrders(){
    const orders = [];
    const querySnapshot = await getDocs(collection(db, "orders"));
    querySnapshot.forEach((doc) => {
        orders.push(doc.data());
    });
    return orders;
}
export { addOrder, getOrders };
