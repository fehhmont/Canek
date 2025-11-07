// === SISTEMA DE NAVEGAÇÃO AVANÇADO ===

class NavigationSystem {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.mobileMenuToggle = document.querySelector('#mobile-menu-toggle');
        this.mobileMenu = document.querySelector('#mobile-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.lastScrollY = window.scrollY;
        
        this.init();
    }

    init() {
        this.setupScrollEffects();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.addActiveNavIndicator();
    }

    // Efeitos de scroll para a navbar
    setupScrollEffects() {
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Efeito de fundo opaco ao rolar
            if (currentScrollY > 50) {
                this.navbar.classList.add('navbar-scrolled');
            } else {
                this.navbar.classList.remove('navbar-scrolled');
            }

            // Esconder/mostrar navbar no scroll (opcional)
            if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
                this.navbar.classList.add('navbar-hidden');
            } else {
                this.navbar.classList.remove('navbar-hidden');
            }
            
            this.lastScrollY = currentScrollY;
        });
    }

    // Sistema de menu mobile
    setupMobileMenu() {
        if (this.mobileMenuToggle && this.mobileMenu) {
            this.mobileMenuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });

            // Fechar menu ao clicar em links
            this.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });

            // Fechar menu ao clicar fora
            document.addEventListener('click', (e) => {
                if (!this.navbar.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    toggleMobileMenu() {
        this.mobileMenu.classList.toggle('mobile-menu-open');
        this.mobileMenuToggle.classList.toggle('menu-toggle-active');
        
        // Prevenir scroll do body quando menu está aberto
        if (this.mobileMenu.classList.contains('mobile-menu-open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    closeMobileMenu() {
        this.mobileMenu.classList.remove('mobile-menu-open');
        this.mobileMenuToggle.classList.remove('menu-toggle-active');
        document.body.style.overflow = '';
    }

    // Scroll suave para âncoras
    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }

    // Indicador visual de seção ativa
    addActiveNavIndicator() {
        const sections = ['#home', '#personalize', '#sobre', '#contato'];
        
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY + 120;
            let activeSection = null;
            
            sections.forEach((sectionId) => {
                const section = document.querySelector(sectionId);
                if (section) {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;
                    
                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        activeSection = sectionId;
                    }
                }
            });
            
            if (activeSection) {
                this.setActiveNavLink(activeSection);
            }
        });
        
        // Definir estado inicial
        this.setActiveNavLink('#home');
    }

    setActiveNavLink(activeSectionId) {
        // Remove active class de todos os links (desktop e mobile)
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('nav-link-active');
        });
        
        // Adiciona active class aos links que apontam para a seção ativa
        document.querySelectorAll(`a.nav-link[href="${activeSectionId}"]`).forEach(link => {
            link.classList.add('nav-link-active');
        });
    }
}

// === SISTEMA DE ANIMAÇÕES ===

class AnimationSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
    }

    // Animações ao rolar a página
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observar elementos para animação
        document.querySelectorAll('.card-caneca, .section-title, .hero-content').forEach(el => {
            observer.observe(el);
        });
    }

    // Efeitos de hover aprimorados
    setupHoverEffects() {
        document.querySelectorAll('.card-caneca').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-12px) scale(1.05)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }
}

// === SISTEMA DE MODAL DE PRODUTOS ===

class ProductModalSystem {
    constructor() {
        this.currentProductIndex = 0;
        this.products = [];
        this.modal = null;
        
        this.init();
    }

    init() {
        this.createProductModal();
        this.setupProductData();
        // Ensure modal is in DOM before setting up events
        setTimeout(() => {
            this.setupProductEvents();
        }, 0);
    }

    // Criar estrutura do modal de produto
    createProductModal() {
        const modalHTML = `
            <div class="product-modal" id="product-modal">
                <div class="product-modal-overlay"></div>
                <div class="product-modal-content">
                    <button class="product-modal-close" id="product-modal-close">
                        <i class="ph-x"></i>
                    </button>
                    
                    <div class="product-modal-body">
                        <div class="product-image-section">
                            <div class="product-image-container">
                                <img id="product-modal-image" src="" alt="">
                                <button class="product-zoom-btn" id="product-zoom-btn">
                                    <i class="ph-magnifying-glass-plus"></i>
                                </button>
                            </div>
                            <div class="product-navigation">
                                <button class="product-nav-btn" id="product-prev">
                                    <i class="ph-caret-left"></i>
                                </button>
                                <span class="product-counter" id="product-counter">1 / 9</span>
                                <button class="product-nav-btn" id="product-next">
                                    <i class="ph-caret-right"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="product-info-section">
                            <div class="product-details">
                                <h2 class="product-modal-title" id="product-modal-title">Caneca Gamer</h2>
                                <p class="product-modal-price" id="product-modal-price">R$ 35,90</p>
                                <div class="product-description">
                                    <h3>Descrição</h3>
                                    <p id="product-modal-description">Caneca personalizada perfeita para gamers apaixonados.</p>
                                </div>
                                <div class="product-specs">
                                    <h3>Especificações</h3>
                                    <ul>
                                        <li><strong>Material:</strong> Cerâmica de alta qualidade</li>
                                        <li><strong>Capacidade:</strong> 325ml</li>
                                        <li><strong>Acabamento:</strong> Brilhante</li>
                                        <li><strong>Lavagem:</strong> Máquina de lavar louças</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="product-actions">
                                <button class="btn-secondary modal-share" id="modal-share">
                                    <i class="ph-share"></i> Compartilhar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('product-modal');
    }

    // Configurar dados dos produtos com descrições detalhadas
    setupProductData() {
        this.products = [
            {
                id: 'caneca-0',
                name: 'Caneca Gamer',
                price: 35.90,
                image: 'https://via.placeholder.com/400x400/dddbf1/000000?text=Gamer',
                bgColor: '#dddbf1',
                description: 'Para os verdadeiros gamers! Design inspirado no universo dos videogames com elementos únicos que representam sua paixão.',
                category: 'Gaming'
            },
            {
                id: 'caneca-1',
                name: 'Caneca Coração',
                price: 29.90,
                image: 'https://via.placeholder.com/400x400/fce1e4/000000?text=Coração',
                bgColor: '#fce1e4',
                description: 'Perfeita para declarações de amor! Ideal para presentes românticos e momentos especiais com quem você ama.',
                category: 'Romântico'
            },
            {
                id: 'caneca-2',
                name: 'Caneca Natureza',
                price: 32.90,
                image: 'https://via.placeholder.com/400x400/d9f2e6/000000?text=Natureza',
                bgColor: '#d9f2e6',
                description: 'Conecte-se com a natureza a cada gole! Design inspirado em elementos naturais para amantes do meio ambiente.',
                category: 'Natureza'
            },
            {
                id: 'caneca-3',
                name: 'Caneca Trabalho',
                price: 27.90,
                image: 'https://via.placeholder.com/400x400/fcf4dd/000000?text=Trabalho',
                bgColor: '#fcf4dd',
                description: 'Sua companheira no escritório! Design profissional para acompanhar você durante o dia de trabalho.',
                category: 'Profissional'
            },
            {
                id: 'caneca-4',
                name: 'Caneca Feliz',
                price: 31.90,
                image: 'https://via.placeholder.com/400x400/e4f1fe/000000?text=Feliz',
                bgColor: '#e4f1fe',
                description: 'Espalhe alegria por onde passar! Cores vibrantes e design que transmite positividade e boa energia.',
                category: 'Motivacional'
            },
            {
                id: 'caneca-5',
                name: 'Caneca Diamante',
                price: 34.90,
                image: 'https://via.placeholder.com/400x400/d7e5f0/000000?text=Diamante',
                bgColor: '#d7e5f0',
                description: 'Luxo e elegância em suas mãos! Design sofisticado inspirado na beleza dos diamantes.',
                category: 'Elegante'
            },
            {
                id: 'caneca-6',
                name: 'Caneca Troféu',
                price: 28.90,
                image: 'https://via.placeholder.com/400x400/fcf4dd/000000?text=Troféu',
                bgColor: '#fcf4dd',
                description: 'Celebre suas conquistas! Design especial para quem valoriza o sucesso e as vitórias da vida.',
                category: 'Conquista'
            },
            {
                id: 'caneca-7',
                name: 'Caneca LOVE',
                price: 33.90,
                image: 'https://via.placeholder.com/400x400/fde2e4/000000?text=LOVE',
                bgColor: '#fde2e4',
                description: 'Demonstre seu amor de forma especial! Design moderno e romântico para casais apaixonados.',
                category: 'Romântico'
            },
            {
                id: 'caneca-8',
                name: 'Caneca Paz',
                price: 30.90,
                image: 'https://via.placeholder.com/400x400/fcf4dd/000000?text=Paz',
                bgColor: '#fcf4dd',
                description: 'Encontre a serenidade a cada gole! Design zen que promove tranquilidade e harmonia interior.',
                category: 'Zen'
            }
        ];
    }

    // Configurar eventos dos produtos
    setupProductEvents() {
        try {
            // Clique nos cards de produto
            document.querySelectorAll('.card-caneca').forEach((card, index) => {
                card.addEventListener('click', (e) => {
                    // Evitar abrir modal quando clicar no botão adicionar (que não existe mais, mas é uma boa prática manter)
                    if (e.target.closest('.product-add-btn')) return;
                    
                    this.openProductModal(index);
                });
            });

            // Fechar modal
            const closeBtn = document.getElementById('product-modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeProductModal();
                });
            }

            const overlay = document.querySelector('.product-modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => {
                    this.closeProductModal();
                });
            }

            // Navegação entre produtos
            const prevBtn = document.getElementById('product-prev');
            const nextBtn = document.getElementById('product-next');
            
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    this.navigateProduct(-1);
                });
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    this.navigateProduct(1);
                });
            }

            // Zoom da imagem
            const zoomBtn = document.getElementById('product-zoom-btn');
            if (zoomBtn) {
                zoomBtn.addEventListener('click', () => {
                    this.toggleImageZoom();
                });
            }

            // Compartilhar
            const shareBtn = document.getElementById('modal-share');
            if (shareBtn) {
                shareBtn.addEventListener('click', () => {
                    this.shareProduct();
                });
            }

            // Navegação por teclado
            document.addEventListener('keydown', (e) => {
                if (this.modal && this.modal.classList.contains('product-modal-open')) {
                    if (e.key === 'Escape') this.closeProductModal();
                    if (e.key === 'ArrowLeft') this.navigateProduct(-1);
                    if (e.key === 'ArrowRight') this.navigateProduct(1);
                }
            });
        } catch (error) {
            console.error('Error setting up product modal events:', error);
        }
    }

    // Abrir modal do produto
    openProductModal(productIndex) {
        this.currentProductIndex = productIndex;
        this.renderProductModal();
        this.modal.classList.add('product-modal-open');
        document.body.style.overflow = 'hidden';
    }

    // Fechar modal do produto
    closeProductModal() {
        this.modal.classList.remove('product-modal-open');
        document.body.style.overflow = '';
        
        // Reset zoom se estiver ativo
        const image = document.getElementById('product-modal-image');
        image.style.transform = '';
        document.getElementById('product-zoom-btn').innerHTML = '<i class="ph-magnifying-glass-plus"></i>';
    }

    // Renderizar dados do produto no modal
    renderProductModal() {
        const product = this.products[this.currentProductIndex];
        
        document.getElementById('product-modal-image').src = product.image;
        document.getElementById('product-modal-title').textContent = product.name;
        document.getElementById('product-modal-price').textContent = `R$ ${product.price.toFixed(2).replace('.', ',')}`;
        document.getElementById('product-modal-description').textContent = product.description;
        document.getElementById('product-counter').textContent = `${this.currentProductIndex + 1} / ${this.products.length}`;
    }

    // Navegar entre produtos
    navigateProduct(direction) {
        this.currentProductIndex += direction;
        
        if (this.currentProductIndex < 0) {
            this.currentProductIndex = this.products.length - 1;
        } else if (this.currentProductIndex >= this.products.length) {
            this.currentProductIndex = 0;
        }
        
        this.renderProductModal();
    }
    
    // Toggle zoom da imagem
    toggleImageZoom() {
        const image = document.getElementById('product-modal-image');
        const zoomBtn = document.getElementById('product-zoom-btn');
        
        if (image.style.transform) {
            image.style.transform = '';
            zoomBtn.innerHTML = '<i class="ph-magnifying-glass-plus"></i>';
        } else {
            image.style.transform = 'scale(1.5)';
            zoomBtn.innerHTML = '<i class="ph-magnifying-glass-minus"></i>';
        }
    }

    // Compartilhar produto
    shareProduct() {
        const product = this.products[this.currentProductIndex];
        
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: `Confira esta ${product.name} na CaneK!`,
                url: window.location.href
            });
        } else {
            // Fallback: copiar link
            navigator.clipboard.writeText(window.location.href).then(() => {
                const button = document.getElementById('modal-share');
                const originalText = button.innerHTML;
                
                button.innerHTML = '<i class="ph-check"></i> Link Copiado!';
                setTimeout(() => {
                    button.innerHTML = originalText;
                }, 2000);
            });
        }
    }
}

// === SISTEMA DE PERSONALIZAÇÃO ===

class CustomizationSystem {
    constructor() {
        this.currentDesign = {
            text: 'SEU TEXTO',
            mugColor: '#ffffff',
            mugColorName: 'Branca',
            textColor: '#000000',
            textColorName: 'Preto',
            emoji: '☕',
            emojiName: '☕',
            style: 'normal',
            styleName: 'Normal'
        };
        
        this.basePrice = 45.90;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updatePreview();
    }
    
    setupEventListeners() {
        try {
            // Input de texto
            const textInput = document.getElementById('custom-text-input');
            if (textInput) {
                textInput.addEventListener('input', (e) => {
                    this.updateText(e.target.value);
                });
            }
            
            // Cores da caneca
            document.querySelectorAll('.color-option').forEach(button => {
                button.addEventListener('click', () => {
                    this.updateMugColor(
                        button.dataset.color,
                        button.dataset.name
                    );
                });
            });
            
            // Cores do texto
            document.querySelectorAll('.text-color-option').forEach(button => {
                button.addEventListener('click', () => {
                    this.updateTextColor(button.dataset.textColor, button.dataset.name);
                });
            });
            
            // Emojis
            document.querySelectorAll('.emoji-option').forEach(button => {
                button.addEventListener('click', () => {
                    this.updateEmoji(
                        button.dataset.emoji,
                        button.textContent
                    );
                });
            });
            
            // Estilos de texto
            document.querySelectorAll('.style-option').forEach(button => {
                button.addEventListener('click', () => {
                    this.updateStyle(
                        button.dataset.style,
                        button.textContent
                    );
                });
            });
            
        } catch (error) {
            console.error('Error setting up customization events:', error);
        }
    }
    
    updateText(text) {
        this.currentDesign.text = text || 'SEU TEXTO';
        this.updatePreview();
    }
    
    updateMugColor(color, name) {
        this.currentDesign.mugColor = color;
        this.currentDesign.mugColorName = name;
        
        // Update active state
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-color="${color}"]`).classList.add('active');
        
        this.updatePreview();
    }
    
    updateTextColor(color, name) {
        this.currentDesign.textColor = color;
        this.currentDesign.textColorName = name || 'Personalizado';
        
        // Update active state
        document.querySelectorAll('.text-color-option').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const button = document.querySelector(`[data-text-color="${color}"]`);
        if (button) {
            button.classList.add('active');
        }
        
        this.updatePreview();
    }
    
    updateEmoji(emoji, displayText) {
        this.currentDesign.emoji = emoji;
        this.currentDesign.emojiName = displayText === 'Nenhum' ? 'Nenhum' : emoji;
        
        // Update active state
        document.querySelectorAll('.emoji-option').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-emoji="${emoji}"]`).classList.add('active');
        
        this.updatePreview();
    }
    
    updateStyle(style, name) {
        this.currentDesign.style = style;
        this.currentDesign.styleName = name;
        
        // Update active state
        document.querySelectorAll('.style-option').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-style="${style}"]`).classList.add('active');
        
        this.updatePreview();
    }
    
    updatePreview() {
        try {
            // Update mug body color
            const mugBody = document.querySelector('.mug-body');
            const mugHandle = document.querySelector('.mug-handle');
            if (mugBody && mugHandle) {
                mugBody.style.background = this.currentDesign.mugColor;
                mugHandle.style.borderColor = this.currentDesign.mugColor;
            }
            
            // Update text
            const textElement = document.getElementById('preview-text');
            if (textElement) {
                textElement.textContent = this.currentDesign.text;
                textElement.style.color = this.currentDesign.textColor;
                
                // Apply text style
                switch (this.currentDesign.style) {
                    case 'bold':
                        textElement.style.fontWeight = '700';
                        textElement.style.fontStyle = 'normal';
                        textElement.style.textTransform = 'none';
                        break;
                    case 'italic':
                        textElement.style.fontWeight = '600';
                        textElement.style.fontStyle = 'italic';
                        textElement.style.textTransform = 'none';
                        break;
                    case 'uppercase':
                        textElement.style.fontWeight = '600';
                        textElement.style.fontStyle = 'normal';
                        textElement.style.textTransform = 'uppercase';
                        break;
                    default:
                        textElement.style.fontWeight = '600';
                        textElement.style.fontStyle = 'normal';
                        textElement.style.textTransform = 'none';
                }
            }
            
            // Update emoji
            const emojiElement = document.getElementById('preview-emoji');
            if (emojiElement) {
                emojiElement.textContent = this.currentDesign.emoji;
                emojiElement.style.display = this.currentDesign.emoji ? 'block' : 'none';
            }
            
            // Update mug name
            const mugName = document.getElementById('custom-mug-name');
            if (mugName) {
                const text = this.currentDesign.text;
                if (text && text !== 'SEU TEXTO') {
                    mugName.textContent = `Caneca "${text}"`;
                } else {
                    mugName.textContent = 'Caneca Personalizada';
                }
            }
            
        } catch (error) {
            console.error('Error updating preview:', error);
        }
    }
    
    // Escapar caracteres especiais para XML/SVG
    escapeXml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}

// === INICIALIZAÇÃO ===

document.addEventListener('DOMContentLoaded', () => {
    new NavigationSystem();
    new AnimationSystem();
    window.productModal = new ProductModalSystem();
    window.customizationSystem = new CustomizationSystem();
});

// === UTILITÁRIOS ===

// Função para detectar dispositivo móvel
function isMobile() {
    return window.innerWidth <= 768;
}

// Debounce para otimizar eventos de scroll
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
