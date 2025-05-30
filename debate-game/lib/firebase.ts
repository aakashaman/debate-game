// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
let app
let db

// Check if we're in the browser and Firebase hasn't been initialized
if (typeof window !== "undefined") {
  try {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
  } catch (error) {
    console.error("Firebase initialization error:", error)
  }
}

type DebateResult = {
  debater1: string
  debater2: string
  topic: string
  votes1: number
  votes2: number
  timestamp: Date
}

export async function saveDebateResults(result: DebateResult) {
  if (!db) return null

  try {
    const docRef = await addDoc(collection(db, "debateResults"), result)
    return docRef.id
  } catch (error) {
    console.error("Error adding document:", error)
    return null
  }
}

export { db }
