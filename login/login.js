document.addEventListener('DOMContentLoaded', () => {

    // 0. CAPTURA O CLIENTE DO SUPABASE (Configurado no supabase-cliente.js)
    const supabase = window.supabaseClient;

    // Função auxiliar para salvar a foto vinculada ao e-mail no histórico local
    function salvarFotoNoHistoricoLocal(email, avatarUrl) {
        try {
            const mapaHistorico = JSON.parse(localStorage.getItem('userAvatarsMap')) || {};
            mapaHistorico[email.toLowerCase()] = avatarUrl;
            localStorage.setItem('userAvatarsMap', JSON.stringify(mapaHistorico));
        } catch (e) {
            console.error('Erro ao salvar no histórico de avatares:', e);
        }
    }

    // Função auxiliar para buscar a foto vinculada ao e-mail no histórico local
    function buscarFotoNoHistoricoLocal(email) {
        try {
            const mapaHistorico = JSON.parse(localStorage.getItem('userAvatarsMap')) || {};
            return mapaHistorico[email.toLowerCase()] || null;
        } catch (e) {
            return null;
        }
    }

    // =============================================
    // FUNÇÃO DA TRANSIÇÃO DO CORAÇÃO (ESTILO TIKTOK)
    // =============================================
    function executarTransicaoCoracao(urlRedirecionamento) {
        const overlay = document.getElementById('heartTransition');
        const container = document.getElementById('particlesContainer');
        
        if (!overlay || !container) {
            // Caso o HTML da transição não esteja presente, redireciona direto
            window.location.href = urlRedirecionamento;
            return;
        }

        container.innerHTML = ''; // Limpa resíduos
        overlay.classList.add('active'); // Ativa a animação no CSS

        // Gera as faíscas brilhantes da explosão
        const numeroDeParticulas = 50;
        for (let i = 0; i < numeroDeParticulas; i++) {
            const particula = document.createElement('div');
            particula.classList.add('particle');
            
            // Ângulo e espalhamento aleatório da explosão
            const angulo = Math.random() * Math.PI * 2;
            const velocidade = 90 + Math.random() * 160; 
            const x = Math.cos(angulo) * velocidade + 'px';
            const y = Math.sin(angulo) * velocidade + 'px';
            
            particula.style.setProperty('--x', x);
            particula.style.setProperty('--y', y);
            
            // Paleta de cores neon
            const cores = ['#ffffff', '#ec4899', '#8b5cf6', '#a78bfa', '#f43f5e'];
            particula.style.background = cores[Math.floor(Math.random() * cores.length)];
            
            const tamanho = 4 + Math.random() * 6 + 'px';
            particula.style.width = tamanho;
            particula.style.height = tamanho;

            container.appendChild(particula);
        }

        // Aguarda a transição completa (Desenho + Explosão + Revelação da Logo) para mudar de tela
        setTimeout(() => {
            window.location.href = urlRedirecionamento;
        }, 5200);
    }

    // =============================================
    // ALTERNAR ENTRE CARDS (Login, Cadastro, Admin)
    // =============================================
    const loginCard = document.getElementById('loginCard');
    const registerCard = document.getElementById('registerCard');
    const adminCard = document.getElementById('adminCard');

    document.querySelectorAll('.toggle-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-show');
            
            [loginCard, registerCard, adminCard].forEach(card => {
                if (card) card.style.display = 'none';
            });
            
            const targetCard = document.getElementById(targetId);
            if (targetCard) {
                targetCard.style.display = 'block';
            }
        });
    });

    // =============================================
    // MOSTRAR/ESCONDER SENHA
    // =============================================
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', () => {
            const targetId = icon.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                icon.classList.toggle('fa-eye', isPassword);
                icon.classList.toggle('fa-eye-slash', !isPassword);
            }
        });
    });

    // =============================================
    // LOGIN REAL COM SUPABASE
    // =============================================
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            // Login rápido de teste para Admin comum
            if (email === 'admin@amorneurodivergente.com' && password === 'admin123') {
                showToast('Login como administrador! Preparando ambiente...', 'success');
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userName', 'Administrador');
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userRole', 'admin');
                
                executarTransicaoCoracao('/painel-admin/painel.html');
                return;
            }
            
            if (!email || !password) {
                showToast('Preencha todos os campos.', 'error');
                return;
            }

            showToast('Verificando credenciais...', 'info');

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                showToast('Erro ao entrar: ' + error.message, 'error');
            } else {
                showToast('Acesso autorizado!', 'success');
                
                const userMetadata = data.user.user_metadata;
                
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userName', userMetadata?.first_name || data.user.email.split('@')[0]);
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('userRole', 'user');
                
                const fotoDaNuvem = userMetadata?.avatar_url;
                const fotoDoHistoricoLocal = buscarFotoNoHistoricoLocal(data.user.email);
                const fotoFinal = fotoDaNuvem || fotoDoHistoricoLocal || '/img/avatar-padrao.png';

                localStorage.setItem('userAvatar', fotoFinal);
                salvarFotoNoHistoricoLocal(data.user.email, fotoFinal);
                
                // Dispara o efeito visual marcante antes de ir para o início
                executarTransicaoCoracao('/inicio.html');
            }
        });
    }

    // =============================================
    // CADASTRO REAL COM SUPABASE
    // =============================================
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const firstName = document.getElementById('regFirstName').value.trim();
            const lastName = document.getElementById('regLastName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            
            // Prevenção caso o elemento termsCheck não exista no HTML atual
            const termsCheckElement = document.getElementById('termsCheck');
            if (termsCheckElement && !termsCheckElement.checked) {
                showToast('Aceite os Termos de Uso.', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showToast('As senhas não coincidem.', 'error');
                return;
            }
            
            if (password.length < 6) {
                showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
                return;
            }
            
            if (firstName && email && password) {
                showToast('Criando sua conta com carinho...', 'info');

                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            first_name: firstName,
                            last_name: lastName,
                            avatar_url: '/img/avatar-padrao.png'
                        }
                    }
                });

                if (error) {
                    showToast('Erro ao cadastrar: ' + error.message, 'error');
                } else {
                    showToast('Conta criada com sucesso!', 'success');
                    
                    localStorage.setItem('userLoggedIn', 'true');
                    localStorage.setItem('userName', firstName);
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('userAvatar', '/img/avatar-padrao.png');
                    localStorage.setItem('userRole', 'user');
                    
                    salvarFotoNoHistoricoLocal(email, '/img/avatar-padrao.png');
                    
                    // Transição ativada no cadastro também para dar boas-vindas
                    executarTransicaoCoracao('/inicio.html');
                }
            } else {
                showToast('Preencha todos os campos obrigatórios.', 'error');
            }
        });
    }

    // =============================================
    // LOGIN ADMIN
    // =============================================
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('adminUser').value.trim();
            const password = document.getElementById('adminPassword').value;
            const token = document.getElementById('adminToken')?.value.trim() || '';
            
            if (!username || !password) {
                showToast('Preencha os campos obrigatórios.', 'error');
                return;
            }
            
            showToast('✅ Acesso administrativo liberado!', 'success');
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userName', username || 'Admin');
            localStorage.setItem('userEmail', 'admin@amorneurodivergente.com');
            localStorage.setItem('userRole', 'admin');
            if (token) localStorage.setItem('adminToken', token);
            
            executarTransicaoCoracao('/painel-admin/painel.html');
        });
    }

    // =============================================
    // TOAST SYSTEM
    // =============================================
    function showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast-message');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2d2a28'};
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    console.log('🔐 Transições imersivas e conexões prontas!');
});