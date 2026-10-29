<p align="center">
  <img src="./assets/logo.svg" width="112" height="112" alt="QAUI Logo" />
</p>

<h1 align="center">QAUI — Surface Testing Plugin for Google Antigravity</h1>

<p align="center">
  <strong>Project-agnostic visual UI surface testing, live browser simulation with an animated mouse pointer, and automated runtime health audits.</strong><br/>
  Works out of the box across React, Next.js, Vue, Angular, PHP, .NET, Python, or any external URL — with <strong>zero dependencies</strong> added to your target project.
</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-00d68f.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/Antigravity-Plugin%20%2B%20Skill%20%2B%20MCP-ff2d55.svg" alt="Antigravity Plugin" />
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg" alt="Cross Platform" />
</p>

---

## 🇧🇷 Visão Geral (Português)

O **QAUI** é um plugin *open-source* (padrão ouro) para o **Google Antigravity** que permite realizar **testes de superfície (*smoke / surface testing*)** e **simulações visuais no navegador** em qualquer projeto ou site externo, sem poluir o `package.json` do sistema testado.

### Principais Recursos
- **Navegador Visível e Isolado Automático (`@playwright/mcp`):** abre uma janela limpa do Google Chrome diretamente na sua tela (fora do Terminal Sandbox e **sem** exigir `chrome://inspect` manual nem expor suas abas pessoais).
- **Ponteiro do Mouse Visível + HUD Ao Vivo:** cursor vetorial de alto contraste, halo luminoso, ondas visuais de clique (*ripple*), destaque nos elementos-alvo e banner em tempo real.
- **Controle de Velocidade (`slow` | `normal` | `fast` | `instant`):** assista em câmera lenta passo a passo (ótimo para homologação e demonstrações) ou execute validações rápidas de fumaça.
- **Auditoria Silenciosa Automática:** detecta exceções JS (`error` / `unhandledrejection`), falhas de rede (`HTTP 4xx/5xx`), imagens quebradas (`naturalWidth === 0`), estouro de layout horizontal responsivo, links mortos, controles sem acessibilidade e tempos de carregamento (`TTFB` / `FCP`).
- **100% Agnóstico de Projeto + Autodescoberta:** detecta automaticamente servidores locais ativos (`localhost:3000`, `5173`, `4200`, `8000`, `8080`, etc.) e pode exportar fluxos validados para suítes `@playwright/test`.

### Instalação Rápida (Global — funciona em todos os seus projetos)

** Pré-requisitos:** [Node.js 18+](https://nodejs.org/) e Google Chrome instalados.

**Windows (PowerShell):**
```powershell
git clone https://github.com/tiagosandrade/QAUI.git "$HOME\.gemini\config\plugins\qaui"
```

**macOS / Linux:**
```bash
git clone https://github.com/tiagosandrade/QAUI.git ~/.gemini/config/plugins/qaui
```

Depois de clonar, **reinicie o Antigravity** para carregar o plugin e o servidor MCP `surface-testing-playwright`.

### Como Usar (Exemplos de Prompts)
Em qualquer projeto aberto no Antigravity, basta pedir no chat:
- *"Faça um teste de superfície completo neste projeto com ponteiro visível e gere o relatório de saúde."*
- *"Simule lentamente (modo slow) com ponteiro do mouse visível o acesso a `https://exemplo.com`, preenchendo a busca e validando o primeiro resultado."*
- *"Repita o teste de superfície em velocidade rápida (`fast`) e exporte um spec do Playwright."*

---

## 🌎 Overview (English)

**QAUI** is an open-source **Google Antigravity** plugin for **project-agnostic visual surface/smoke testing** and **guided live browser simulations**.

### Why QAUI?
1. **Zero Manual Browser Setup:** Bundles `@playwright/mcp` in `--isolated` headed mode. The Language Server launches a fresh, visible Chrome window automatically — bypassing Windows Terminal Sandbox GUI isolation and requiring **no** `chrome://inspect/#remote-debugging` toggles on your personal profile.
2. **Built-in Visual Cursor & Speed Profiles:** Ships a reusable `cursor-overlay.js` (`slow`, `normal`, `fast`, `instant`) featuring smooth Bezier cursor glides, click ripples, target outlines, React/Vue-safe character-by-character typing, and a live status HUD.
3. **Deep Surface Health Telemetry:** Passively audits every visited route via `surface-audit.js` + DevTools MCP for uncaught JS exceptions, HTTP `4xx`/`5xx` responses, broken images, horizontal CSS overflow, dead links, missing ARIA/accessible names, and paint timings.
4. **Zero Footprint on Target Repos:** Lives globally in `~/.gemini/config/plugins/qaui` using Antigravity's Progressive Disclosure — consuming zero context tokens until you ask for a surface test.

### Quick Install (Global Scope)

**macOS / Linux:**
```bash
git clone https://github.com/tiagosandrade/QAUI.git ~/.gemini/config/plugins/qaui
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/tiagosandrade/QAUI.git "$HOME\.gemini\config\plugins\qaui"
```

Restart Antigravity after cloning so the plugin and its MCP server are discovered.

### Alternative: Team / Workspace Installation
To share QAUI inside a specific repository via Git:
```bash
git submodule add https://github.com/tiagosandrade/QAUI.git .agents/plugins/qaui
```

---

## Repository Structure

```text
QAUI/
├── plugin.json                                     # Official Antigravity Plugin manifest
├── mcp_config.json                                 # Isolated headed Playwright MCP server config
├── assets/
│   └── logo.svg                                    # Plugin icon
├── skills/
│   └── surface-testing/
│       ├── SKILL.md                                # On-demand agent workflow instructions
│       ├── resources/
│       │   ├── cursor-overlay.js                   # Visual pointer, ripple, HUD & speed profiles
│       │   └── surface-audit.js                    # Universal DOM, asset, layout & Vitals auditor
│       ├── scripts/
│       │   └── discover-local-target.mjs           # Zero-dependency localhost port & stack detector
│       └── references/
│           ├── surface-checklist.md                # Pass/Warn/Fail criteria & selector hierarchy
│           ├── report-template.md                  # Standardized Markdown report structure
│           └── playwright-regression-template.md   # CI/CD @playwright/test export template
├── LICENSE                                         # MIT License
└── README.md
```

## License

Released under the [MIT License](./LICENSE).
