// =============================================
// SISTEMA ANTI-HACKER - HONEYPOT
// =============================================

(function() {
    'use strict';
    
    console.log('🛡️ Carregando sistema Anti-Hacker...');
    
    // =============================================
    // 1. DETECTAR PADRÕES MALICIOSOS
    // =============================================
    
    const attackPatterns = {
        xss: [
            /<script/i,
            /javascript:/i,
            /onerror/i,
            /onload/i,
            /onclick/i,
            /data:text\/html/i,
            /<img.*onerror/i,
            /<iframe/i,
            /<svg.*onload/i,
            /<a.*href=["']javascript:/i,
            /<body.*onload/i,
            /%3Cscript/i,
            /%3Cimg/i,
            /%3Ciframe/i
        ],
        sql: [
            /drop\s+table/i,
            /delete\s+from/i,
            /insert\s+into/i,
            /update\s+set/i,
            /union\s+select/i,
            /or\s+1\s*=\s*1/i,
            /--/,
            /;.*;/
        ],
        csrf: [
            /<form.*action/i,
            /<input.*name=["']csrf/i
        ]
    };
    
    // =============================================
    // 2. ANALISAR CONTEÚDO
    // =============================================
    
    function analyzeContent(text) {
        if (!text) return null;
        
        for (const [type, patterns] of Object.entries(attackPatterns)) {
            for (const pattern of patterns) {
                if (pattern.test(text)) {
                    return {
                        type: type,
                        pattern: pattern.source,
                        matched: text.match(pattern)?.[0] || text
                    };
                }
            }
        }
        return null;
    }
    
    // =============================================
    // 3. FUNÇÃO PARA LOGAR ATAQUE NO SUPABASE
    // =============================================
    
    async function logAttack(attackType, payload) {
        try {
            const supabase = window.supabaseClient;
            if (!supabase) {
                console.warn('⚠️ Supabase não disponível');
                return;
            }
            
            const { data, error } = await supabase
                .rpc('log_attack_simple', {
                    p_attack_type: attackType,
                    p_payload: payload
                });
            
            if (error) {
                console.warn('⚠️ Erro ao logar ataque:', error);
            } else {
                console.log('✅ Ataque registrado! ID:', data);
            }
        } catch (e) {
            console.warn('⚠️ Erro ao logar ataque:', e);
        }
    }
    
    // =============================================
    // 4. DETECTAR EM CAMPOS DE INPUT
    // =============================================
    
    function monitorInputs() {
        document.addEventListener('input', function(e) {
            const target = e.target;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                const value = target.value;
                const attack = analyzeContent(value);
                
                if (attack) {
                    console.warn('⚠️ ATAQUE DETECTADO:', attack);
                    triggerHoneypot(attack);
                }
            }
        });
    }
    
    // =============================================
    // 5. DETECTAR EM PASTAS/COPIAR
    // =============================================
    
    function monitorPaste() {
        document.addEventListener('paste', function(e) {
            const text = e.clipboardData?.getData('text');
            if (text) {
                const attack = analyzeContent(text);
                if (attack) {
                    console.warn('⚠️ ATAQUE DETECTADO (paste):', attack);
                    triggerHoneypot(attack);
                }
            }
        });
    }
    
    // =============================================
    // 6. DETECTAR CONSOLE LOGS SUSPEITOS
    // =============================================
    
    function monitorConsole() {
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;
        
        console.log = function(...args) {
            const text = args.join(' ');
            const attack = analyzeContent(text);
            if (attack) {
                console.warn('⚠️ ATAQUE DETECTADO (console.log):', attack);
                triggerHoneypot(attack);
            }
            originalLog.apply(console, args);
        };
        
        console.warn = function(...args) {
            const text = args.join(' ');
            const attack = analyzeContent(text);
            if (attack) {
                console.warn('⚠️ ATAQUE DETECTADO (console.warn):', attack);
                triggerHoneypot(attack);
            }
            originalWarn.apply(console, args);
        };
    }
    
    // =============================================
    // 7. DETECTAR REQUISIÇÕES SUSPEITAS (Fetch)
    // =============================================
    
    function monitorFetch() {
        const originalFetch = window.fetch;
        
        window.fetch = function(...args) {
            const url = args[0];
            const options = args[1] || {};
            
            const attack = analyzeContent(url.toString());
            if (attack) {
                console.warn('⚠️ ATAQUE DETECTADO (fetch):', attack);
                triggerHoneypot(attack);
                return Promise.reject(new Error('Requisição bloqueada'));
            }
            
            if (options.body) {
                const body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
                const bodyAttack = analyzeContent(body);
                if (bodyAttack) {
                    console.warn('⚠️ ATAQUE DETECTADO (fetch body):', bodyAttack);
                    triggerHoneypot(bodyAttack);
                    return Promise.reject(new Error('Requisição bloqueada'));
                }
            }
            
            return originalFetch.apply(this, args);
        };
    }
    
    // =============================================
    // 8. DETECTAR URL PARAMETERS
    // =============================================
    
    function monitorURL() {
        const url = window.location.href;
        const attack = analyzeContent(decodeURIComponent(url));
        if (attack) {
            console.warn('⚠️ ATAQUE DETECTADO (URL):', attack);
            triggerHoneypot(attack);
        }
    }
    
    // =============================================
    // 9. TRIGGER DO HONEYPOT
    // =============================================
    
    function triggerHoneypot(attack) {
        if (window._honeypotTriggered) return;
        window._honeypotTriggered = true;
        
        sessionStorage.setItem('attackType', attack.type.toUpperCase());
        sessionStorage.setItem('attackPayload', attack.matched);
        
        logAttack(attack.type, attack.matched);
        
        try {
            if (typeof showToast === 'function') {
                showToast('🚨 ATIVIDADE SUSPEITA DETECTADA! Redirecionando...', 'error', 1500);
            } else {
                console.warn('🚨 ATIVIDADE SUSPEITA DETECTADA!');
            }
        } catch(e) {}
        
        setTimeout(() => {
            window.location.href = '/hacker-trap.html';
        }, 1500);
    }
    
    // =============================================
    // 10. INICIAR MONITORAMENTO
    // =============================================
    
    function initHoneypot() {
        console.log('🛡️ Sistema Anti-Hacker ativado!');
        
        monitorInputs();
        monitorPaste();
        monitorConsole();
        monitorFetch();
        monitorURL();
        
        document.addEventListener('submit', function(e) {
            const form = e.target;
            const formData = new FormData(form);
            for (let [key, value] of formData.entries()) {
                const attack = analyzeContent(value);
                if (attack) {
                    e.preventDefault();
                    console.warn('⚠️ ATAQUE DETECTADO (form):', attack);
                    triggerHoneypot(attack);
                    break;
                }
            }
        });
        
        console.log('✅ Sistema Anti-Hacker pronto!');
    }
    
    // Iniciar automaticamente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHoneypot);
    } else {
        initHoneypot();
    }
    
    // =============================================
    // EXPORTA FUNÇÕES PARA USO EXTERNO (CONSOLE E OUTROS)
    // =============================================
    
    window.analyzeContent = analyzeContent;
    window.logAttack = logAttack;
    window.triggerHoneypot = triggerHoneypot;
    window.initHoneypot = initHoneypot;
    window.attackPatterns = attackPatterns;
    
    console.log('🔧 Funções exportadas: analyzeContent, logAttack, triggerHoneypot, initHoneypot');
    
})();