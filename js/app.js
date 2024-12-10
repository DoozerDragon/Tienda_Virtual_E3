const app = Vue.createApp({
    data() {
        return {
            cards: [],
            filteredCards: [],
            categories: [],
            searchQuery: "",
            selectedCategory: "",
            maxItems: 209 // Mostrar todos los productos inicialmente
        };
    },
    computed: {
        progressBarWidth() {
            return `${(this.filteredCards.length / this.cards.length) * 100}%`;
        }
    },
    methods: {
        async fetchCards() {
            try {
                // Solicita los datos de la API
                const response = await axios.get("https://digimon-api.vercel.app/api/digimon");
                // Mapea los datos para agregar la URL de la imagen si es necesario
                this.cards = response.data.map(card => {
                    return {
                        ...card,
                        img: card.img, // Usamos `img` como la propiedad correcta para las imágenes
                        level: card.level || 'Desconocido', // Nivel del Digimon
                        type: card.type || 'Desconocido',  // Tipo del Digimon (valor por defecto si no existe)
                        attribute: card.attribute || 'Desconocido',  // Atributo del Digimon
                    };
                });
                this.applyFilters();  // Aplicamos los filtros después de obtener las cartas
                this.generateCategories();  // Generamos las categorías
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },

        // Método para aplicar filtros de búsqueda y categoría
        applyFilters() {
            this.filteredCards = this.cards.filter(card => {
                const matchesSearch = card.name.toLowerCase().includes(this.searchQuery.toLowerCase());
                const matchesCategory = this.selectedCategory === "" || card.level == this.selectedCategory; // Filtramos por categoría
                return matchesSearch && matchesCategory;
            }).slice(0, this.maxItems); // Limitar a maxItems resultados
        },

        generateCategories() {
            const categoriesSet = new Set(this.cards.map(card => card.level)); // Generamos las categorías a partir de los niveles
            this.categories = [...categoriesSet].sort();
        },

        // Método para aplicar filtros de búsqueda y categoría
        filterCards() {
            this.applyFilters();  // Re-aplicamos el filtro después de un cambio
        }
    },
    mounted() {
        this.fetchCards(); // Llamamos a la función al montar la app
    }
});

app.mount("#app");
