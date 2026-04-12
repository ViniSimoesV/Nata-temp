/**
 * Sidebar única para todas as páginas em /pages/.
 * Rotas relativas à pasta pages/; dashboard aponta para ../index.html
 * Marque o item ativo com <body data-nav-active="projetos"> (ver chaves em aplicarItemAtivo).
 */
const SIDEBAR_HTML = `
<aside class="sidebar-flutuante">
    <div class="sidebar-logo">
        <h1 class="logo-text">Nata</h1>
    </div>

    <nav class="sidebar-nav">
        <ul class="nav-list">
            <li class="nav-item">
                <a href="../index.html" class="nav-link" data-nav="dashboard">
                    <div class="link-conteudo">
                        <i class="ph-fill ph-house-line"></i> Dashboard
                    </div>
                </a>
            </li>

            <li class="nav-item">
                <a href="#" class="nav-link">
                    <div class="link-conteudo">
                        <i class="ph-fill ph-handshake"></i> Acolhimento & Social
                    </div>
                    <i class="ph-thin ph-caret-down"></i>
                </a>
                <ul class="submenu">
                    <li>
                        <a href="#" class="submenu-link submenu-link-placeholder" title="Página em definição">
                            <i class="ph-fill ph-user"></i> Residentes
                        </a>
                    </li>
                    <li>
                        <a href="participantes.html" class="submenu-link" data-nav="participantes">
                            <i class="ph-fill ph-users-three"></i> Participantes
                        </a>
                    </li>
                    <li>
                        <a href="voluntarios.html" class="submenu-link" data-nav="voluntarios">
                            <i class="ph-fill ph-handshake"></i> Voluntários
                        </a>
                    </li>
                    <li>
                        <a href="projetos.html" class="submenu-link" data-nav="projetos">
                            <i class="ph-fill ph-folder"></i> Projetos Sociais
                        </a>
                    </li>
                    <li>
                        <a href="funcionarios.html" class="submenu-link" data-nav="projetos">
                            <i class="ph-fill ph-folder"></i> Funcionários
                        </a>
                    </li>
                </ul>
            </li>

            <li class="nav-item">
                <a href="#" class="nav-link">
                    <div class="link-conteudo">
                        <i class="ph-fill ph-heart"></i> Captação & Parcerias
                    </div>
                    <i class="ph-thin ph-caret-down"></i>
                </a>
                <ul class="submenu">
                    <li>
                        <a href="#" class="submenu-link submenu-link-placeholder">
                            <i class="ph-fill ph-file-text"></i> Comprovante de doação
                        </a>
                    </li>
                    <li>
                        <a href="parceiros.html" class="submenu-link" data-nav="parceiros">
                            <i class="ph-fill ph-handshake"></i> Parceiros
                        </a>
                    </li>
                </ul>
            </li>

            <li class="nav-item">
                <a href="#" class="nav-link">
                    <div class="link-conteudo">
                        <i class="ph-fill ph-truck"></i> Logística
                    </div>
                    <i class="ph-thin ph-caret-down"></i>
                </a>
                <ul class="submenu">
                    <li>
                        <a href="veiculos.html" class="submenu-link" data-nav="veiculos">
                            <i class="ph-fill ph-steering-wheel"></i> Frota
                        </a>
                    </li>
                    <li>
                        <a href="manutencao.html" class="submenu-link" data-nav="manutencao">
                            <i class="ph-fill ph-screwdriver"></i> Manutenção
                        </a>
                    </li>
                    <li>
                        <a href="motoristas.html" class="submenu-link" data-nav="motoristas">
                            <i class="ph-fill ph-identification-card"></i> Motorista
                        </a>
                    </li>
                    <li>
                        <a href="pontos.html" class="submenu-link" data-nav="pontos">
                            <i class="ph-fill ph-map-pin-area"></i> Pontos Coleta &amp; Entrega
                        </a>
                    </li>
                    <li>
                        <a href="rotas.html" class="submenu-link" data-nav="rotas">
                            <i class="ph-fill ph-path"></i> Rotas
                        </a>
                    </li>
                </ul>
            </li>

            <li class="nav-item">
                <a href="#" class="nav-link">
                    <div class="link-conteudo">
                        <i class="ph-fill ph-gear"></i> Administração
                    </div>
                    <i class="ph-thin ph-caret-down"></i>
                </a>
            </li>
        </ul>
    </nav>

    <div class="sidebar-footer">
        <a href="#" class="nav-link">
            <div class="link-conteudo">
                <i class="ph ph-sign-out"></i> Sair
            </div>
        </a>
    </div>
</aside>
`.trim();

function aplicarItemAtivo(container) {
    const active = document.body.dataset.navActive;
    if (!active) return;

    const el = container.querySelector(`[data-nav="${active}"]`);
    if (!el) return;

    el.classList.add("link-sub-ativo");

    const submenu = el.closest(".submenu");
    if (submenu) {
        const navItem = submenu.closest(".nav-item");
        if (navItem) navItem.classList.add("menu-aberto");
    }
}

function anexarComportamentoSubmenu(container) {
    const linksPrincipais = container.querySelectorAll(".sidebar-nav .nav-link");

    linksPrincipais.forEach((link) => {
        link.addEventListener("click", function (evento) {
            const submenu = this.nextElementSibling;

            if (submenu && submenu.classList.contains("submenu")) {
                evento.preventDefault();

                const itemPai = this.parentElement;
                itemPai.classList.toggle("menu-aberto");
            }
        });
    });

    container.querySelectorAll(".submenu-link-placeholder").forEach((a) => {
        a.addEventListener("click", (e) => e.preventDefault());
    });
}

function initSidebar() {
    const container = document.getElementById("sidebar-container");
    if (!container) return;

    container.innerHTML = SIDEBAR_HTML;
    aplicarItemAtivo(container);
    anexarComportamentoSubmenu(container);
}

document.addEventListener("DOMContentLoaded", initSidebar);
