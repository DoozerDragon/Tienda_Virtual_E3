const app = Vue.createApp({
    data() {
        return {
            // Datos compartidos
            cards: [], // Lista de productos
            filteredCards: [], // Productos filtrados
            categories: [], // Categorías disponibles
            searchQuery: "", // Búsqueda por nombre
            selectedCategory: "", // Categoría seleccionada
            selectedProduct: {}, // Producto seleccionado para detalles
            carrito: [], // Productos en el carrito
            cantidad: 1, // Cantidad en la página de detalles
            maxItems: 209, // Máximo de productos a mostrar
            producto: {} // Producto individual
        };
    },
    computed: {
        // Barra de progreso en el catálogo
        progressBarWidth() {
            return `${(this.filteredCards.length / this.cards.length) * 100}%`;
        }
    },
    methods: {
        // Fetch de productos desde la API
        async fetchCards() {
            try {
                // Verifica si los datos ya están en localStorage
                const storedCards = localStorage.getItem("digimonCards");
                if (storedCards) {
                    this.cards = JSON.parse(storedCards);
                } else {
                    const response = await axios.get("https://digimon-api.vercel.app/api/digimon");
                    const ids = new Set();
                    this.cards = response.data.map(card => {
                        let randomId;
                        do {
                            randomId = `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 99) + 1}`;
                        } while (ids.has(randomId));
                        ids.add(randomId);
    
                        return {
                            ...card,
                            img: card.img,
                            level: card.level || "Desconocido",
                            type: card.type || "Desconocido",
                            id: randomId,
                            price: card.price || this.assignPriceBasedOnCategory(card)
                        };
                    });
                    // Guarda los datos en localStorage
                    localStorage.setItem("digimonCards", JSON.stringify(this.cards));
                }
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
        // Redirigir a detalles
        redirectToDetails(card) {
            this.guardarCarrito();
            localStorage.setItem("selectedProduct", JSON.stringify(card));
            window.location.href = "detalles.html";
        },
        // Asignar precio basado en categoría
        assignPriceBasedOnCategory(card) {
            const rango = {
                Ultimate: [425, 1200],
                Mega: [250, 420],
                Champion: [200, 245],
                Armor: [135, 195],
                Rookie: [90, 130],
                "In Training": [50, 85],
                Fresh: [25, 45]
            }[card.level] || [10, 20];
            const [min, max] = rango;
            card.price = Math.floor(Math.random() * ((max - min) / 5 + 1)) * 5 + min;
        },
        // Ir al carrito
        irAlCarrito() {
            this.guardarCarrito();
            window.location.href = "carrito.html";
        },
        // Cargar carrito desde localStorage
        cargarCarrito() {
            const carritoGuardado = JSON.parse(localStorage.getItem("carrito") || "[]");
            this.carrito = Array.isArray(carritoGuardado) ? carritoGuardado : [];
        },
        // Guardar carrito en localStorage
        guardarCarrito() {
            localStorage.setItem("carrito", JSON.stringify(this.carrito));
        },
        // Agregar producto al carrito
        agregarAlCarrito(producto) {
            const productoExistente = this.carrito.find(item => item.id === producto.id);
            if (productoExistente) {
                productoExistente.cantidad++;
            } else {
                this.carrito.push({ ...producto, cantidad: 1 });
            }
            this.guardarCarrito();
        },
        // Obtener producto desde localStorage en detalles
        obtenerProductoDelStorage() {
            const productoAlmacenado = localStorage.getItem("selectedProduct");
            if (productoAlmacenado) {
                this.selectedProduct = JSON.parse(productoAlmacenado);
                if (!this.selectedProduct.type) {
                    this.selectedProduct.type = ["Agua", "Fuego", "Tierra", "Aire", "Luz", "Oscuridad"][Math.floor(Math.random() * 6)];
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
        // Inicialización según la página
        if (window.location.pathname.includes("detalles.html")) {
            this.obtenerProductoDelStorage();
        } else {
            this.fetchCards();
        }
        this.cargarCarrito();
    }
});

app.mount("#app");
