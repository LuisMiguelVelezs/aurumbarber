// Importa la función para inicializar la app de Firebase desde el CDN oficial.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

// Importa funciones de Firestore necesarias para trabajar con la base de datos:
// - getFirestore: Inicializa y obtiene la instancia de Firestore.
// - collection: Referencia a una colección dentro de la base de datos.
// - addDoc: Agrega un nuevo documento a una colección.
// - getDocs: Obtiene todos los documentos de una colección.
// - deleteDoc: Elimina un documento específico.
// - doc: Referencia a un documento específico dentro de una colección.
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configuración de tu proyecto de Firebase.
// Estos datos los obtienes desde la consola de Firebase, en la sección de configuración del proyecto.
const firebaseConfig = {
  apiKey: "AIzaSyDz-akSjaVyDPp_00JHv53aK0cjUH3Xx-M",           // Clave de API para autenticar peticiones
  authDomain: "aurumbarber-28c60.firebaseapp.com",             // Dominio de autenticación
  projectId: "aurumbarber-28c60",                              // ID único del proyecto en Firebase
  storageBucket: "aurumbarber-28c60.firebasestorage.app",      // Bucket para almacenamiento de archivos (no usado aquí)
  messagingSenderId: "12939152147",                            // ID para servicios de mensajería (no usado aquí)
  appId: "1:12939152147:web:4e62dfb2beee05253f28e6"            // ID único de la app
};

// Inicializa la app de Firebase con la configuración anterior.
const app = initializeApp(firebaseConfig);

// Obtiene la instancia de Firestore para poder interactuar con la base de datos.
const db = getFirestore(app);

// Exporta las funciones y objetos necesarios para interactuar con Firestore desde otros archivos:
// - db: Instancia de la base de datos Firestore.
// - collection: Para referenciar colecciones.
// - addDoc: Para agregar documentos a una colección.
// - getDocs: Para obtener todos los documentos de una colección.
// - deleteDoc: Para eliminar documentos.
// - doc: Para referenciar documentos específicos.
export { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where };