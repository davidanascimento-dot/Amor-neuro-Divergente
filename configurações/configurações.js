/**
 * Configurações — Amor NeuroDivergente
 * Com Botão Voltar + Acessibilidade + Perfil + Abas + Integração Supabase
 */

document.addEventListener('DOMContentLoaded', async () => {

    const body = document.body;
    
    // 0. CAPTURA O CLIENTE DO SUPABASE
    const supabase = window.supabaseClient;

    // Caminho padrão correto baseado na sua estrutura local
    const AVATAR_PADRAO = '/img/avatar-padrao.png';

    // =============================================
    // VERIFICAÇÃO DE STORAGE (anti Tracking Prevention)
    // =============================================
    let storageAvailable = false;
    try {
        localStorage.setItem('__test__', '1');
        localStorage.removeItem('__test__');
        storageAvailable = true;
    } catch(e) {
        console.warn('⚠️ localStorage bloqueado. Usando memória.');
    }

    // =============================================
    // FUNÇÕES AUXILIARES DO BANCO DE DADOS
    // =============================================
    
    // Função para buscar perfil da tabela profiles
    async function fetchProfile(userId) {
        if (!supabase || !userId) return null;
        
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();
            
            if (error) {
                console.log('Erro ao buscar perfil:', error.message);
                return null;
            }
            
            return data;
        } catch (err) {
            console.error('Erro em fetchProfile:', err);
            return null;
        }
    }

    // Função para salvar/atualizar perfil na tabela profiles
    async function saveProfileToDB(profileData) {
        if (!supabase) return { error: 'Supabase não disponível' };
        
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError) return { error: userError.message };
            if (!user) return { error: 'Usuário não autenticado' };
            
            const { data, error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    ...profileData,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'id'
                })
                .select()
                .single();
            
            return { data, error };
        } catch (err) {
            console.error('Erro em saveProfileToDB:', err);
            return { error: err.message };
        }
    }

    // =============================================
    // 0. ESTADO DO USUÁRIO
    // =============================================
    let currentUser = {
        name: (storageAvailable && localStorage.getItem('userName')) || 'Visitante',
        email: (storageAvailable && localStorage.getItem('userEmail')) || 'carregando@email.com',
        avatar: (storageAvailable && localStorage.getItem('userAvatar')) || AVATAR_PADRAO,
        bio: (storageAvailable && localStorage.getItem('userBio')) || '',
        lang: (storageAvailable && localStorage.getItem('userLang')) || 'pt'
    };

    // Puxa os dados atualizados do banco ao carregar a página
    if (supabase) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const user = session.user;
                currentUser.email = user.email;
                
                const profile = await fetchProfile(user.id);
                
                if (profile) {
                    currentUser.name = profile.username || profile.full_name || user.user_metadata?.first_name || user.email.split('@')[0];
                    currentUser.bio = profile.bio || '';
                    currentUser.avatar = profile.avatar_url || user.user_metadata?.avatar_url || AVATAR_PADRAO;
                } else {
                    // Criar perfil se não existir
                    const defaultUsername = user.user_metadata?.first_name || user.email.split('@')[0];
                    const defaultAvatar = user.user_metadata?.avatar_url || AVATAR_PADRAO;
                    
                    const { error: createError } = await supabase
                        .from('profiles')
                        .insert({
                            id: user.id,
                            username: defaultUsername,
                            avatar_url: defaultAvatar,
                            bio: user.user_metadata?.bio || '',
                            is_active: true
                        });
                    
                    if (!createError) {
                        console.log('✅ Perfil criado automaticamente!');
                        currentUser.name = defaultUsername;
                        currentUser.avatar = defaultAvatar;
                    }
                }
                
                saveToLocalStorage();
            }
        } catch (err) {
            console.error("Erro ao buscar sessão do Supabase:", err);
        }
    }

    // =============================================
    // 1. BOTÃO VOLTAR (Navegação anterior)
    // =============================================
    const btnVoltar = document.getElementById('btnVoltar');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Tenta voltar para a página anterior no histórico
            if (document.referrer && document.referrer.length > 0) {
                window.history.back();
            } else {
                // Fallback: vai para a página inicial
                window.location.href = '/inicio.html';
            }
        });
    }

    // =============================================
    // 2. TOAST
    // =============================================
    function showToast(message, isError = false) {
        const existing = document.querySelector('.toast-message');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        toast.setAttribute('role', 'status');
        toast.style.cssText = `
            position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
            background:${isError ? '#ef4444' : '#10b981'};color:#fff;padding:12px 24px;border-radius:12px;
            font-size:14px;font-weight:500;z-index:9999;
            box-shadow:0 4px 20px rgba(0,0,0,0.15);animation:toastIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => { 
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300); 
        }, 3000);
    }

    // =============================================
    // 3. LOGOUT REAL COM SUPABASE
    // =============================================
    document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('Tem certeza que deseja sair?')) {
            if (supabase) await supabase.auth.signOut();
            if (storageAvailable) {
                localStorage.removeItem('userLoggedIn');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userAvatar');
                localStorage.removeItem('userBio');
            }
            window.location.href = '/login/login.html';
        }
    });

    // =============================================
    // 4. ACESSIBILIDADE (SEM SIDEBAR)
    // =============================================
    function gs(k, fb) { 
        if (!storageAvailable) return fb;
        return localStorage.getItem('a11y_' + k) || fb; 
    }
    function ss(k, v) { 
        if (storageAvailable) localStorage.setItem('a11y_' + k, v); 
    }
    function usl(id, active) { 
        const el = document.getElementById(id); 
        if (el) el.textContent = active ? 'Ligado' : 'Desligado'; 
    }

    function applySettings() {
        if (gs('darkMode') === 'true') body.classList.add('a11y-dark-mode');
        if (gs('highlightLinks') === 'true') body.classList.add('a11y-highlight-links');
        if (gs('dyslexiaFont') === 'true') body.classList.add('a11y-dyslexia');
        if (gs('reduceMotion') === 'true') body.classList.add('a11y-reduce-motion');
        usl('darkModeStatus', gs('darkMode') === 'true');
        usl('linksStatus', gs('highlightLinks') === 'true');
        usl('dyslexiaStatus', gs('dyslexiaFont') === 'true');
        usl('motionStatus', gs('reduceMotion') === 'true');
    }

    // Botões de acessibilidade (agora no header ou footer)
    document.querySelectorAll('.a11y-option, .a11y-reset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            const action = btn.getAttribute('data-a11y');
            switch (action) {
                case 'darkMode': 
                    const dm = gs('darkMode') === 'true'; 
                    ss('darkMode', dm ? 'false' : 'true'); 
                    if (dm) body.classList.remove('a11y-dark-mode'); 
                    else body.classList.add('a11y-dark-mode'); 
                    usl('darkModeStatus', !dm); 
                    break;
                case 'increaseText': 
                    body.classList.toggle('a11y-large-text');
                    break;
                case 'decreaseText': 
                    body.classList.toggle('a11y-small-text');
                    break;
                case 'highlightLinks': 
                    const hl = gs('highlightLinks') === 'true'; 
                    ss('highlightLinks', hl ? 'false' : 'true'); 
                    if (hl) body.classList.remove('a11y-highlight-links'); 
                    else body.classList.add('a11y-highlight-links'); 
                    usl('linksStatus', !hl); 
                    break;
                case 'dyslexiaFont': 
                    const df = gs('dyslexiaFont') === 'true'; 
                    ss('dyslexiaFont', df ? 'false' : 'true'); 
                    if (df) body.classList.remove('a11y-dyslexia'); 
                    else body.classList.add('a11y-dyslexia'); 
                    usl('dyslexiaStatus', !df); 
                    break;
                case 'reduceMotion': 
                    const rm = gs('reduceMotion') === 'true'; 
                    ss('reduceMotion', rm ? 'false' : 'true'); 
                    if (rm) body.classList.remove('a11y-reduce-motion'); 
                    else body.classList.add('a11y-reduce-motion'); 
                    usl('motionStatus', !rm); 
                    break;
                case 'reset': 
                    ['darkMode', 'highlightLinks', 'dyslexiaFont', 'reduceMotion', 'textSize'].forEach(k => 
                        localStorage.removeItem('a11y_' + k)
                    ); 
                    body.classList.remove(
                        'a11y-dark-mode', 
                        'a11y-highlight-links', 
                        'a11y-dyslexia', 
                        'a11y-reduce-motion',
                        'a11y-large-text',
                        'a11y-small-text'
                    ); 
                    usl('darkModeStatus', false);
                    usl('linksStatus', false);
                    usl('dyslexiaStatus', false);
                    usl('motionStatus', false); 
                    break;
            }
        });
    });

    applySettings();

    // =============================================
    // 5. ATUALIZAR INTERFACE
    // =============================================
    function updateGlobalUI() {
        // Avatar e nome do perfil (header ou área do usuário)
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        
        if (userAvatar) { 
            userAvatar.src = currentUser.avatar || AVATAR_PADRAO; 
            userAvatar.onerror = () => { 
                userAvatar.onerror = null; 
                userAvatar.src = AVATAR_PADRAO; 
            }; 
        }
        if (userName) userName.textContent = currentUser.name;
        if (userEmail) userEmail.textContent = currentUser.email;

        // Header
        const displayNameHeader = document.getElementById('displayNameHeader');
        const displayNameInfo = document.getElementById('displayNameInfo');
        const userEmailField = document.getElementById('userEmailField');
        if (displayNameHeader) displayNameHeader.innerText = currentUser.name;
        if (displayNameInfo) displayNameInfo.innerText = currentUser.name;
        if (userEmailField) userEmailField.innerText = currentUser.email;

        // Formulário de perfil
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profileAvatar = document.getElementById('profileAvatar');
        const profileBio = document.getElementById('profileBio');
        
        if (profileName) profileName.value = currentUser.name;
        if (profileEmail) profileEmail.value = currentUser.email;
        if (profileAvatar) { 
            profileAvatar.src = currentUser.avatar || AVATAR_PADRAO; 
            profileAvatar.onerror = () => { 
                profileAvatar.onerror = null; 
                profileAvatar.src = AVATAR_PADRAO; 
            }; 
        }
        if (profileBio) profileBio.value = currentUser.bio;
    }

    function saveToLocalStorage() {
        if (!storageAvailable) return;
        localStorage.setItem('userName', currentUser.name);
        localStorage.setItem('userEmail', currentUser.email);
        localStorage.setItem('userAvatar', currentUser.avatar);
        localStorage.setItem('userBio', currentUser.bio);
        localStorage.setItem('userLang', currentUser.lang);
        
        try {
            const mapaHistorico = JSON.parse(localStorage.getItem('userAvatarsMap')) || {};
            mapaHistorico[currentUser.email.toLowerCase()] = currentUser.avatar;
            localStorage.setItem('userAvatarsMap', JSON.stringify(mapaHistorico));
        } catch(e) {}
    }

    // =============================================
    // 6. IDIOMA
    // =============================================
    function setLanguage(lang) {
        currentUser.lang = lang;
        if (storageAvailable) localStorage.setItem('userLang', lang);
        document.documentElement.lang = lang === 'en' ? 'en' : lang === 'es' ? 'es' : 'pt-BR';
        document.querySelectorAll('[id^="check"]').forEach(el => el.innerText = '');
        if (lang === 'pt') document.getElementById('checkPt').innerText = '✔️';
        if (lang === 'en') document.getElementById('checkEn').innerText = '✔️';
        if (lang === 'es') document.getElementById('checkEs').innerText = '✔️';
        const texts = { 
            pt: { title: "Configurações" }, 
            en: { title: "Settings" }, 
            es: { title: "Ajustes" } 
        };
        const pageHeader = document.querySelector('.page-header h1');
        if (pageHeader) pageHeader.innerText = texts[lang]?.title || texts.pt.title;
    }

    // =============================================
    // 7. MODAL DE AUTENTICAÇÃO
    // =============================================
    let modalCallback = null;
    const modal = document.getElementById('modalOverlay');

    if (modal) {
        document.getElementById('modalConfirmBtn')?.addEventListener('click', () => {
            const pwd = document.getElementById('modalInput').value;
            if (pwd === "admin123") { 
                if (modalCallback) modalCallback(true); 
                showToast("Autenticação bem-sucedida!"); 
            } else { 
                showToast("Senha incorreta!", true); 
                if (modalCallback) modalCallback(false); 
            }
            modal.classList.remove('active');
        });
        document.getElementById('modalCancelBtn')?.addEventListener('click', () => { 
            modal.classList.remove('active'); 
            modalCallback = null; 
        });
    }

    // =============================================
    // 8. EVENTOS DE PERFIL (UPLOAD REAL PARA SUPABASE STORAGE + BANCO)
    // =============================================
    
    // Upload de Avatar
    document.getElementById('cameraUploadBtn')?.addEventListener('click', () => {
        if (!supabase) { 
            showToast("Erro: Cliente Supabase não carregado", true); 
            return; 
        }
        
        const input = document.createElement('input');
        input.type = 'file'; 
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            showToast("Subindo imagem para a nuvem...");

            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `profiles/${fileName}`;

                // Verificar se o bucket existe, se não criar
                const { data: buckets } = await supabase.storage.listBuckets();
                const bucketExists = buckets?.some(b => b.name === 'avatars');
                
                if (!bucketExists) {
                    showToast("Bucket 'avatars' não encontrado. Criando...", true);
                    // Criar bucket
                    await supabase.storage.createBucket('avatars', {
                        public: true,
                        file_size_limit: 5242880 // 5MB
                    });
                }

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error("Erro no upload:", uploadError);
                    showToast("Erro no upload: " + uploadError.message, true);
                    return;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                console.log('✅ Upload concluído:', publicUrl);

                // Salvar no perfil
                const { error: profileError } = await saveProfileToDB({
                    avatar_url: publicUrl,
                    avatar_storage_path: filePath
                });
                
                if (profileError) {
                    console.error("Erro ao salvar avatar no banco:", profileError);
                    showToast("Erro ao salvar avatar: " + profileError.message, true);
                    return;
                }

                // Atualizar metadados do usuário
                const { error: updateError } = await supabase.auth.updateUser({
                    data: { avatar_url: publicUrl }
                });

                if (updateError) {
                    console.warn("Aviso: metadados não atualizados:", updateError.message);
                }

                currentUser.avatar = publicUrl;
                saveToLocalStorage();
                updateGlobalUI();
                showToast('Foto de perfil salva com sucesso! 🌸');
                
            } catch (err) {
                console.error("Erro no upload:", err);
                showToast("Erro ao enviar imagem: " + err.message, true);
            }
        };
        input.click();
    });

    // Remover Avatar
    document.getElementById('removeAvatarBtn')?.addEventListener('click', async () => {
        try {
            if (supabase) {
                showToast("Restaurando avatar padrão...");
                
                const { error: profileError } = await saveProfileToDB({
                    avatar_url: AVATAR_PADRAO,
                    avatar_storage_path: null
                });
                
                if (profileError) {
                    console.error("Erro ao remover avatar:", profileError);
                    showToast("Erro ao remover avatar: " + profileError.message, true);
                    return;
                }
                
                await supabase.auth.updateUser({
                    data: { avatar_url: AVATAR_PADRAO }
                });
            }
            
            currentUser.avatar = AVATAR_PADRAO;
            saveToLocalStorage(); 
            updateGlobalUI(); 
            showToast('Avatar restaurado para o padrão!');
        } catch (err) {
            console.error("Erro ao remover avatar:", err);
            showToast("Erro ao remover avatar: " + err.message, true);
        }
    });

    // Salvar alterações de Texto
    document.getElementById('saveProfileBtn')?.addEventListener('click', async () => {
        const novoNome = document.getElementById('profileName')?.value.trim() || currentUser.name;
        const novaBio = document.getElementById('profileBio')?.value.trim() || '';

        let salvouBanco = false;
        
        if (supabase) {
            try {
                showToast("Salvando dados na nuvem...");
                
                const { error: profileError } = await saveProfileToDB({
                    username: novoNome,
                    bio: novaBio
                });
                
                if (profileError) {
                    console.error("Erro ao salvar no banco:", profileError);
                    showToast("Erro ao salvar: " + profileError.message, true);
                } else {
                    salvouBanco = true;
                }
                
                // Atualizar metadados do usuário
                await supabase.auth.updateUser({
                    data: { 
                        first_name: novoNome,
                        bio: novaBio,
                        username: novoNome
                    }
                });
            } catch (err) {
                console.error("Erro ao salvar:", err);
                showToast("Erro ao salvar: " + err.message, true);
            }
        }

        currentUser.name = novoNome;
        currentUser.bio = novaBio;
        saveToLocalStorage(); 
        updateGlobalUI(); 
        
        // Sincronizar com a comunidade (se aberta)
        if (window.syncProfile) {
            try {
                await window.syncProfile();
                console.log('✅ Perfil sincronizado com a comunidade!');
            } catch (err) {
                console.warn('Não foi possível sincronizar com a comunidade:', err);
            }
        }
        
        if (salvouBanco) {
            showToast('Perfil salvo com sucesso! ✅');
        } else if (!supabase) {
            showToast('Perfil atualizado localmente (offline)');
        }
    });

    // Idiomas
    document.getElementById('langPt')?.addEventListener('click', () => { 
        setLanguage('pt'); 
        showToast(`Idioma: Português`); 
    });
    document.getElementById('langEn')?.addEventListener('click', () => { 
        setLanguage('en'); 
        showToast(`Idioma: English`); 
    });
    document.getElementById('langEs')?.addEventListener('click', () => { 
        setLanguage('es'); 
        showToast(`Idioma: Español`); 
    });

    // Abas
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.settings-pane').forEach(p => p.classList.remove('active'));
            const target = document.getElementById(btn.getAttribute('data-target'));
            if (target) target.classList.add('active');
        });
    });

    

    // Sincronização Local entre Abas abertas
    window.addEventListener('storage', (event) => {
        if (!event.key || !event.key.startsWith('user')) return;
        if (event.key === 'userName') currentUser.name = event.newValue || currentUser.name;
        if (event.key === 'userEmail') currentUser.email = event.newValue || currentUser.email;
        if (event.key === 'userBio') currentUser.bio = event.newValue || currentUser.bio;
        if (event.key === 'userAvatar') currentUser.avatar = event.newValue || currentUser.avatar;
        if (event.key === 'userLang' && event.newValue) { 
            currentUser.lang = event.newValue; 
            setLanguage(event.newValue); 
        }
        updateGlobalUI();
    });

 const modalSenha = document.getElementById('modalSenha');
    const closeBtn = document.getElementById('closeModalBtn');
    const changeBtn = document.getElementById('changePasswordBtn');
    const registerBtn = document.getElementById('registerSecurityKeyBtn');
    
    console.log('Modal:', modalSenha);
    console.log('CloseBtn:', closeBtn);
    console.log('ChangeBtn:', changeBtn);
    console.log('RegisterBtn:', registerBtn);
    
    function abrirModal() {
        modalSenha.style.display = 'flex';
        modalSenha.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function fecharModal() {
       
        modalSenha.style.display = 'none';
        modalSenha.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    if (changeBtn) {
        changeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            abrirModal();
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            abrirModal();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            fecharModal();
        });
    }
    
    if (modalSenha) {
        window.addEventListener('click', function(e) {
            if (e.target === modalSenha) {
                fecharModal();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharModal();
        }
    });
    // =============================================
    // 9. INICIALIZAÇÃO
    // =============================================
    updateGlobalUI();
    setLanguage(currentUser.lang || 'pt');
    console.log('⚙️ Configurações prontas, integradas ao banco de dados!');
    console.log('📦 Tabela profiles sincronizada com sucesso!');
    
});