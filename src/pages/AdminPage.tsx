import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Input,
  Badge,
  useDisclosure,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Spinner,
  Divider
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase";

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  ativo: boolean;
};

type Order = {
  id: string;
  productId: string;
  productName: string;
  userName: string;
  quantity: number;
  ticketNumber: number;
  createdAt: any;
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const loadProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    setProducts(items);
  };

  const loadOrders = async () => {
    const q = query(collection(db, "orders"), orderBy("ticketNumber", "asc"));
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
    setOrders(items);
    setLoadingOrders(false);
  };

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const handleSubmit = async () => {
    if (!name || !price || !quantity) return;

    if (editId) {
      await updateDoc(doc(db, "products", editId), {
        name,
        price: parseFloat(price),
        quantity: parseInt(quantity)
      });
      toast({ title: "Produto atualizado", status: "success" });
    } else {
      await addDoc(collection(db, "products"), {
        name,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        ativo: true
      });
      toast({ title: "Produto criado", status: "success" });
    }

    setName("");
    setPrice("");
    setQuantity("");
    setEditId(null);
    onClose();
    loadProducts();
  };

  const handleEdit = (product: Product) => {
    setName(product.name);
    setPrice(product.price.toString());
    setQuantity(product.quantity.toString());
    setEditId(product.id);
    onOpen();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
    toast({ title: "Produto deletado", status: "info" });
    loadProducts();
  };

  const toggleAtivo = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "products", id), {
      ativo: !currentStatus
    });
    toast({ title: "Status alterado", status: "info" });
    loadProducts();
  };

  return (
    <Box bg="gray.50" minH="100vh" py={10}>
      <Container maxW="6xl">
        <Heading fontSize="3xl" mb={6} fontWeight="semibold" color="gray.800">
          Painel Administrativo
        </Heading>

        <Tabs variant="soft-rounded" colorScheme="blue" isFitted bg="white" rounded="lg" p={4} boxShadow="md">
          <TabList mb={4}>
            <Tab>Produtos</Tab>
            <Tab>Pedidos</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Button colorScheme="blue" onClick={onOpen} mb={6}>
                Novo Produto
              </Button>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {products.map((product) => (
                  <Box key={product.id} borderWidth="1px" borderRadius="xl" p={5} bg="white" boxShadow="sm">
                    <Heading fontSize="lg" mb={2}>
                      {product.name}
                    </Heading>
                    <Text color="gray.600">Preço: R$ {product.price.toFixed(2)}</Text>
                    <Text color="gray.600">Estoque: {product.quantity}</Text>
                    <Badge mt={2} colorScheme={product.ativo ? "green" : "red"}>
                      {product.ativo ? "Ativo" : "Inativo"}
                    </Badge>

                    <HStack mt={4} spacing={3}>
                      <Button size="sm" onClick={() => toggleAtivo(product.id, product.ativo)}>
                        {product.ativo ? "Inativar" : "Ativar"}
                      </Button>
                      <Button size="sm" colorScheme="blue" onClick={() => handleEdit(product)}>
                        Editar
                      </Button>
                      <Button size="sm" colorScheme="red" onClick={() => handleDelete(product.id)}>
                        Excluir
                      </Button>
                    </HStack>
                  </Box>
                ))}
              </SimpleGrid>
            </TabPanel>

            <TabPanel>
              {loadingOrders ? (
                <Spinner />
              ) : (
                <VStack spacing={5} align="stretch">
                  {orders.map((order) => (
                    <Box key={order.id} borderWidth="1px" borderRadius="xl" p={4} bg="white" boxShadow="sm">
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="bold" fontSize="lg">
                          🎟️ Ticket #{order.ticketNumber}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {new Date(order.createdAt?.seconds * 1000).toLocaleString()}
                        </Text>
                      </HStack>
                      <Divider mb={3} />
                      <Text><strong>Cliente:</strong> {order.userName}</Text>
                      <Text><strong>Produto:</strong> {order.productName}</Text>
                      <Text><strong>Quantidade:</strong> {order.quantity}</Text>
                    </Box>
                  ))}
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      {/* Modal Produto */}
      <Modal isOpen={isOpen} onClose={() => { setEditId(null); onClose(); }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editId ? "Editar Produto" : "Novo Produto"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3}>
              <Input
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Preço"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <Input
                placeholder="Quantidade"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
              Salvar
            </Button>
            <Button variant="ghost" onClick={() => { setEditId(null); onClose(); }}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
