# Plano de Execução: GPU-23 - Front End

## Visão Geral
Este documento descreve o plano detalhado para executar todos os sub-issues relacionados a melhorias de UI/UX no dashboard do mentorado.

## Sub-Issues Mapeados

| ID | Título | Prioridade | Complexidade |
|----|--------|------------|--------------|
| GPU-24 | Mudar componente de seleção de abas | Alta | Média |
| GPU-25 | Trocar cores do modo claro (azul petróleo) | Alta | Baixa |
| GPU-26 | Remover card "Sistema Online" | Média | Baixa |
| GPU-27 | Trocar seleção de mentorado (Floating Dock) | Alta | Média |
| GPU-29 | Trocar cores do modo escuro (azul claro/dourado) | Alta | Baixa |

---

## GPU-26: Remover Card "Sistema Online" ⚡

### Descrição
Remover o indicador "Sistema Online" da página Meu Dashboard, que aparece na parte superior direita quando não está em mobile.

### Localização
Arquivo: `client/src/pages/MyDashboard.tsx`
Linhas: ~143-149 (dentro do componente `MyDashboard`)

### Códigos a remover
```tsx
{!isMobile && (
  <div className="flex items-center gap-2 text-sm text-gray-500 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
    Sistema Online
  </div>
)}
```

### Verificação
- [ ] Card de "Sistema Online" removido
- [ ] Layout permanece consistente em desktop
- [ ] Funcionalidade em mobile não afetada

---

## GPU-25: Trocar Cores do Modo Claro 🔵

### Descrição
Atualizar as cores de texto no modo claro para melhorar o contraste, usando azul petróleo como padrão do projeto.

### Localizações
Arquivo: `tailwind.config.ts` (definição de cores) ou estilos inline

### Cores a definir (azul petróleo)
```css
--neon-petroleo: #0f4c75;
--neon-petroleo-light: #3282b8;
--neon-petroleo-dark: #1b262c;
```

### Áreas afetadas
1. Títulos principais
2. Texto de parágrafos
3. Labels e descrições
4. Títulos de Cards

### Implementação
Adicionar ou atualizar as variáveis de cor no tema light:
```typescript
// client/tailwind.config.ts
theme: {
  extend: {
    colors: {
      foreground: "var(--foreground)",
      background: "var(--background)",
      // Adicionar cores neon
      neon: {
        petroleo: {
          DEFAULT: "#0f4c75",
          light: "#3282b8",
          dark: "#1b262c",
        },
        // ... outras cores existentes
      }
    }
  }
}
```

### Verificação
- [ ] Corresponde ao azul petróleo do projeto
- [ ] Contraste WCAG AA (mínimo 4.5:1) atendido
- [ ] Visual consistente em modo claro

---

## GPU-29: Trocar Cores do Modo Escuro 🌙

### Descrição
Atualizar as cores de texto no modo escuro para azul claro ou dourado, melhorando o contraste.

### Cores a definir
```css
/* Modo escuro - Azul claro */
--neon-blue-light: #64b5f6;
--neon-blue-highlight: #90caf9;

/* Modo escuro - Dourado (opcional/prioritário) */
--neon-gold: #ffd700;
--neon-gold-light: #ffecb3;
```

### Áreas afetadas (mesmas do GPU-25, mas apenas para dark mode)

### Implementação
Atualizar as classes `dark:` nos componentes para usar as novas cores:
```tsx
// Exemplo de como aplicar
<h2 className="text-white dark:text-neon-blue-light">Título</h2>
<p className="text-gray-400 dark:text-gray-300">Descrição</p>
```

### Verificação
- [ ] Texto legível no modo escuro
- [ ] Azul claro ou dourado aplicado
- [ ] Contraste WCAG AA atendido

---

## GPU-24: Melhorar Componente de Seleção de Abas 🎨

### Descrição
Substituir o `TabsList` do shadcn/ui atual por um componente mais bonito e estilizado que combine com o visual do projeto Neon.

### Localização
Arquivo: `client/src/pages/MyDashboard.tsx`
Linhas: ~157-173

### Abas atuais
1. Visão Geral
2. Diagnóstico
3. Evolução
4. Comparativo da Turma
5. Lançar Métricas
6. Playbook
7. Atividades

### Opções de componentes shadcn/ui
1. **Animated Tabs** (já existe em `client/src/components/ui/animated-tabs.tsx`)
2. **Radio Group** (para seleção de botões)
3. **Toggle Group** (botões de alternância)

### Implementação recomendada: Animated Tabs

1. Substituir a importação:
```tsx
// De
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Para
import { AnimatedTabs } from "@/components/ui/animated-tabs";
```

2. Substituir o componente:
```tsx
<AnimatedTabs
  tabs={[
    { value: "visao-geral", label: "Visão Geral", icon: LayoutDashboard },
    { value: "diagnostico", label: "Diagnóstico", icon: Clipboard },
    { value: "evolucao", label: "Evolução", icon: TrendingUp },
    { value: "comparativo", label: "Comparativo da Turma", icon: Users },
    { value: "lancar-metricas", label: "Lançar Métricas", icon: BarChart },
    { value: "jornada", label: "Playbook", icon: Book },
    { value: "atividades", label: "Atividades", icon: CheckSquare },
  ]}
  defaultValue="visao-geral"
  className="w-full"
/>
```

3. Verificar se o componente `animated-tabs.tsx` está implementado com:
   - Animações suaves de transição
   - Indicador de aba ativa visual
   - Suporte a ícones
   - Efeito de glow/hover

### Verificação
- [ ] Visual moderno e consistente com o tema Neon
- [ ] Animações funcionam corretamente
- [ ] Compatível com modo claro e escuro
- [ ] Responsivo em mobile

---

## GPU-27: Trocar Seleção de Mentorado (Floating Dock) 🚢

### Descrição
Substituir o componente `Select` atual por uma experiência estilo "Floating Dock" da Aceternity UI, inspirada no componente de link.

### Localização
Arquivo: `client/src/pages/MyDashboard.tsx`
Linhas: ~156-167

### Referência
[Aceternity UI - Floating Dock](https://ui.aceternity.com/components/floating-dock)

### Implementação

#### Passo 1: Instalar dependências (se necessário)
O componente pode depender de `framer-motion`, que já está instalado no projeto.

#### Passo 2: Criar o componente Floating Dock
Novo arquivo: `client/src/components/ui/floating-dock.tsx`

```tsx
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type Icon = React.ElementType;

export interface FloatingDockItem {
  icon: Icon;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

interface FloatingDockProps {
  items: FloatingDockItem[];
  className?: string;
}

export const FloatingDock = ({ items, className }: FloatingDockProps) => {
  const mouseX = useMotionValue(Infinity);

  // ... implementação completa do Floating Dock do Aceternity
  // Incluindo:
  // - Efeito de hover magnético
  // - Animação de entrada/saída
  // - Rótulos flutuantes
  // - Indicador de ativo
};
```

#### Passo 3: Integrar no MyDashboard.tsx

Substituir o Select atual:
```tsx
{/* Antigo
<Select value={selectedMentoradoId} onValueChange={setSelectedMentoradoId}>
  <SelectTrigger className="w-[280px] bg-black/40 border-white/10">
    <SelectValue placeholder="Selecione um mentorado" />
  </SelectTrigger>
  <SelectContent>
    {allMentorados?.map((m) => (
      <SelectItem key={m.id} value={m.id.toString()}>
        {m.nomeCompleto} ({m.turma})
      </SelectItem>
    ))}
  </SelectContent>
</Select>
*/}

{/* Novo - Floating Dock */}
<div className="relative">
  <FloatingDock
    items={
      allMentorados?.map(m => ({
        icon: () => (
          <Avatar className="h-10 w-10">
            <AvatarImage src={m.fotoUrl} />
            <AvatarFallback>{m.nomeCompleto[0]}</AvatarFallback>
          </Avatar>
        ),
        label: m.nomeCompleto,
        onClick: () => setSelectedMentoradoId(m.id.toString()),
        isActive: selectedMentoradoId === m.id.toString(),
      })) || []
    }
    className="bg-black/40 border-white/10"
  />
  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="icon" className="absolute -right-12 top-0">
        <Plus className="h-4 w-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent>
      <Select>
        {/* ... fallback para todos os mentorados se necessário */}
      </Select>
    </PopoverContent>
  </Popover>
</div>
```

### Desafios Considerados
- **Muitos mentorados**: Se houver muitos mentorados, o dock pode ficar muito largo.
- **Solução**: Implementar scroll horizontal ou popover para mostrar todos.
- **Seleção inicial**: O mentorado selecionado inicialmente precisa ter destaque visual.

### Verificação
- [ ] Visual elegante estilo dock do macOS
- [ ] Suporta hover com rótulos
- [ ] Indica mentorado ativo
- [ ] Funciona quando há muitos mentorados
- [ ] Responsivo

---

## Ordem de Execução Sugerida

1. **GPU-26** (Mais simples, remove código)
2. **GPU-25 + GPU-29** (Alterações de cores, podem ser feitas em conjunto)
3. **GPU-24** (Substituição de componente com teste visual)
4. **GPU-27** (Mais complexo, requires novo componente)

---

## Checklist Final

### GPU-26 - Remover "Sistema Online"
- [ ] Código removido do MyDashboard.tsx
- [ ] Testado em desktop e mobile

### GPU-25 - Modo Claro (Azul Petróleo)
- [ ] Cores definidas em tailwind.config.ts
- [ ] Aplicado em todas áreas relevantes
- [ ] Contraste validado

### GPU-29 - Modo Escuro (Azul/Dourado)
- [ ] Cores definidas
- [ ] Aplicado apenas em dark mode
- [ ] Contraste validado

### GPU-24 - Seleção de Abas
- [ ] Componente Animated Tabs implementado
- [ ] Substituído em MyDashboard.tsx
- [ ] Animações funcionando
- [ ] Visual harmonioso

### GPU-27 - Floating Dock Mentorado
- [ ] Componente Floating Dock criado
- [ ] Integrado no MyDashboard
- [ ] Funcionalidade de seleção mantida
- [ ] Visual polido

---

## Testes a Executar

### Testes Visuais
- [ ] Verificar modo claro (azul petróleo)
- [ ] Verificar modo escuro (azul/dourado)
- [ ] Testar navegação entre abas (animações)
- [ ] Testar seleção de mentorado (dock)
- [ ] Verify sistema online card removed

### Testes Funcionais
- [ ] Todas as funcionalidades existentes funcionam
- [ ] Nenhuma breaking change
- [ ] Performance não degradou

### Testes de Responsividade
- [ ] Menu de abas funciona em mobile
- [ ] Floating dock funciona em mobile
- [ ] Layout não quebra em diferentes tamanhos

---

## Comandos Úteis

```bash
# Executar servidor de desenvolvimento
bun dev

# Verificar tipos
bun run check

# Formatar código após alterações
bun run format

# Executar testes (se houver)
bun test
```

## Observações Importantes

1. **Sempre faça backup dos arquivos antes de modificar**
2. **Teste cada alteração individualmente antes de fazer o commit**
3. **Use as convenções de código do projeto (Clean Code, TypeScript strict)**
4. **Utilize componentes shadcn/ui existentes sempre que possível**
