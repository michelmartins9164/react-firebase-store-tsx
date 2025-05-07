import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Spinner,
  useToast
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "../firebase";

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  ativo: boolean;
};

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<{ [id: string]: string }>({});
  const [names, setNames] = useState<{ [id: string]: string }>({});
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Product))
        .filter((prod) => prod.ativo);
      setProducts(data);
      setLoading(false);
    };

    load();
  }, []);

  const getNextTicketNumber = async (): Promise<number> => {
    const q = query(collection(db, "orders"), orderBy("ticketNumber", "desc"), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return 0;
    const last = snapshot.docs[0].data();
    return last.ticketNumber + 1;
  };

  const handleOrder = async (product: Product) => {
    const quantity = parseInt(quantities[product.id] || "0");
    const name = names[product.id];

    if (!name || quantity <= 0) {
      toast({ title: "Preencha os dados corretamente.", status: "warning" });
      return;
    }

    const ticketNumber = await getNextTicketNumber();

    await addDoc(collection(db, "orders"), {
      productId: product.id,
      productName: product.name,
      userName: name,
      quantity,
      ticketNumber,
      createdAt: new Date()
    });

    toast({
      title: `Pedido realizado com sucesso!`,
      description: `Ticket #${ticketNumber}`,
      status: "success"
    });

    // Limpa campos
    setQuantities((prev) => ({ ...prev, [product.id]: "" }));
    setNames((prev) => ({ ...prev, [product.id]: "" }));
  };

  return (
    <Box p={4}>
      <Heading mb={4}>Produtos Disponíveis</Heading>

      {loading ? (
        <Spinner />
      ) : (
        <VStack align="start" spacing={6}>
          {products.map((product) => (
            <Box key={product.id} borderWidth="1px" p={4} borderRadius="md" w="100%">
              <HStack justify="space-between">
                <VStack align="start">
                  <Text fontWeight="bold">{product.name}</Text>
                  <Text>R$ {product.price.toFixed(2)}</Text>
                  <Text>Qtd disponível: {product.quantity}</Text>
                </VStack>
                <VStack spacing={2}>
                  <Input
                    placeholder="Seu nome"
                    value={names[product.id] || ""}
                    onChange={(e) =>
                      setNames((prev) => ({ ...prev, [product.id]: e.target.value }))
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Quantidade"
                    value={quantities[product.id] || ""}
                    onChange={(e) =>
                      setQuantities((prev) => ({
                        ...prev,
                        [product.id]: e.target.value
                      }))
                    }
                  />
                  <Button colorScheme="blue" onClick={() => handleOrder(product)}>
                    Adicionar Pedido
                  </Button>
                </VStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}
