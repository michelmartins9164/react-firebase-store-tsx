import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB3vZaQ41mSwiC8oG15WEj3T6KsGobZO9Q",
  authDomain: "meu-estoque-ab504.firebaseapp.com",
  projectId: "meu-estoque-ab504",
  storageBucket: "meu-estoque-ab504.firebasestorage.app",
  messagingSenderId: "446635912188",
  appId: "1:446635912188:web:e3fa531c22e52c2cea6079",
  measurementId: "G-K7WH7EWHQY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

// ⚙️ Função para rodar uma vez e popular produtos
export async function seedProducts() {
  const products = [
    { name: 'Camiseta', price: 59.9, quantity: 12 },
    { name: 'Tênis', price: 199.9, quantity: 8 },
    { name: 'Boné', price: 39.9, quantity: 15 },
    { name: 'Calça Jeans', price: 129.9, quantity: 10 }
  ];

  for (const product of products) {
    await addDoc(collection(db, 'products'), product);
  }

  console.log('Produtos criados com sucesso!');
}
