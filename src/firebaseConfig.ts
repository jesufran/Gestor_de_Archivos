import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// TODO: Reemplaza esto con la configuración de tu propio proyecto de Firebase.
// Ve a: Project settings > General > Your apps > SDK setup and configuration

const firebaseConfig = {
  apiKey: "AIzaSyBvakPCZmNW1ATbCPopImzlwn-G-t_Y0AU",
  authDomain: "gestorarchivosia.firebaseapp.com",
  projectId: "gestorarchivosia",
  storageBucket: "gestorarchivosia.appspot.com",
  messagingSenderId: "861117370758",
  appId: "1:861117370758:web:fb90075281b6f6c18a5c07"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
