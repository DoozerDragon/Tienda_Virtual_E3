const app = Vue.createApp({
    data() {
        return {
            // Datos compartidos entre catálogo y detalles
            cards: [], // Lista de productos
            filteredCards: [], // Productos filtrados
            categories: [], // Categorías disponibles
            searchQuery: "", // Búsqueda por nombre
            selectedCategory: "", // Categoría seleccionada
            selectedProduct: {}, // Producto seleccionado para detalles
            carrito: [], // Lista del carrito
            cantidad: 1, // Cantidad en página de detalles
            maxItems: 209, // Máximo de productos a mostrar
            producto: {}
        };
    },
    computed: {
        // Ancho de barra de progreso
        progressBarWidth() {
            return `${(this.filteredCards.length / this.cards.length) * 100}%`;
        }
    },
    methods: {
        // Fetch de productos desde la API
        async fetchCards() {
            try {
                const response = await axios.get("https://digimon-api.vercel.app/api/digimon");
                this.cards = response.data.map(card => {
                    const randomId = `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 99) + 1}`;
                    return {
                        ...card,
                        img: card.img, // Imagen del producto
                        level: card.level || "Desconocido", // Nivel del producto
                        type: card.type || "Desconocido", // Tipo del producto
                        id: randomId // ID generado
                    };
                });
                this.applyFilters();
                this.generateCategories();
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },
        // Aplicar filtros de búsqueda y categoría
        applyFilters() {
            this.filteredCards = this.cards.filter(card => {
                const matchesSearch = card.name.toLowerCase().includes(this.searchQuery.toLowerCase());
                const matchesCategory = this.selectedCategory === "" || card.level === this.selectedCategory;
                return matchesSearch && matchesCategory;
            }).slice(0, this.maxItems);
        },
        // Generar categorías a partir de niveles
        generateCategories() {
            const categoriesSet = new Set(this.cards.map(card => card.level));
            this.categories = [...categoriesSet].sort();
        },
        // Filtros dinámicos
        filterCards() {
            this.applyFilters();
        },
        // Ver detalles del producto en modal
        viewDetails(card) {
            if (!card.type || card.type === "Desconocido") {
                const types = ["Agua", "Fuego", "Tierra", "Aire", "Luz", "Oscuridad"];
                card.type = types[Math.floor(Math.random() * types.length)];
            }
            if (!card.price) {
                this.assignPriceBasedOnCategory(card);
            }
            this.selectedProduct = card;
            const productModal = new bootstrap.Modal(document.getElementById("productModal"));
            productModal.show();
        },
        // Redirigir a página de detalles
        redirectToDetails(card) {
            localStorage.setItem("selectedProduct", JSON.stringify(card));
            window.location.href = "detalles.html";
        },
        // Asignar precio basado en categoría
        assignPriceBasedOnCategory(card) {
            const rangos = {
                Ultimate: [425, 1200],
                Mega: [250, 420],
                Champion: [200, 245],
                Armor: [135, 195],
                Rookie: [90, 130],
                "In Training": [50, 85],
                Fresh: [25, 45],
                default: [10, 20]
            };
            const [min, max] = rangos[card.level] || rangos.default;
            card.price = (Math.floor(Math.random() * ((max - min) / 5 + 1)) * 5) + min;
        },
        // Cargar carrito desde localStorage
        cargarCarrito() {
            const carritoGuardado = localStorage.getItem("carrito");
            if (carritoGuardado) {
                this.carrito = JSON.parse(carritoGuardado);
            }
        },
        // Guardar carrito en localStorage
        guardarCarrito() {
            localStorage.setItem("carrito", JSON.stringify(this.carrito));
        },
        // Agregar producto al carrito
        agregarAlCarrito(producto) {
            const productoExistente = this.carrito.find(item => item.id === producto.id);
            if (productoExistente) {
                productoExistente.cantidad += this.cantidad;
            } else {
                this.carrito.push({ ...producto, cantidad: this.cantidad });
            }
        },
        // Obtener producto desde localStorage para detalles
        obtenerProductoDelStorage() {
            const productoAlmacenado = localStorage.getItem("selectedProduct");
            if (productoAlmacenado) {
                this.selectedProduct = JSON.parse(productoAlmacenado);
                if (!this.selectedProduct.type || this.selectedProduct.type === "Desconocido") {
                    const tipos = ["Agua", "Fuego", "Tierra", "Aire", "Luz", "Oscuridad"];
                    this.selectedProduct.type = tipos[Math.floor(Math.random() * tipos.length)];
                }
                if (!this.selectedProduct.price) {
                    this.assignPriceBasedOnCategory(this.selectedProduct);
                }
                localStorage.setItem("selectedProduct", JSON.stringify(this.selectedProduct));
            }
        },
        // Ajustar cantidad en detalles
        aumentarCantidad() {
            if (this.cantidad < 6) this.cantidad++;
        },
        disminuirCantidad() {
            if (this.cantidad > 1) this.cantidad--;
        }
    },
    mounted() {
        // Inicialización según página
        if (window.location.pathname.includes("detalles.html")) {
            this.obtenerProductoDelStorage();
        } else {
            this.fetchCards();
        }
        this.cargarCarrito();
    }
});

app.mount("#app");
