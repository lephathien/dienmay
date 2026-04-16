        // Cấu hình Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyA8cZqXANesejJnO8rZP5Tt1HlbEaT0i0s",
            authDomain: "demom-28bcc.firebaseapp.com",
            projectId: "demom-28bcc",
            storageBucket: "demom-28bcc.firebasestorage.app",
            messagingSenderId: "633937503336",
            appId: "1:633937503336:web:7e83cce05660dee57e87dd"
        };
        //Khởi tạo Firebase
        const app = firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized", app.name);

        // Khai báo Firestore
        const db = firebase.firestore();