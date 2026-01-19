# Migração para Clerk Authentication

## Passos da Migração

### 1. Instalação
```bash
pnpm add @clerk/clerk-react
```

### 2. Variáveis de Ambiente
Adicionar ao `.env`:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### 3. Configuração do ClerkProvider
Substituir tRPC provider por ClerkProvider em `client/src/main.tsx`

### 4. Hooks do Clerk
- `useUser()` - Acesso ao usuário atual
- `useAuth()` - Estado de autenticação
- `useClerk()` - Métodos de autenticação

### 5. Componentes do Clerk
- `<SignedIn>` - Conteúdo para usuários autenticados
- `<SignedOut>` - Conteúdo para usuários não autenticados
- `<UserButton />` - Botão de perfil do usuário
- `<SignInButton />` - Botão de login

### 6. Remoção do Sistema Manus OAuth
- Remover `server/_core/oauth.ts`
- Remover `server/_core/context.ts` (lógica de sessão)
- Atualizar `server/routers.ts` para usar Clerk no backend
- Remover cookie-based authentication

### 7. Backend com Clerk
Usar `@clerk/clerk-sdk-node` para validar tokens no backend:
```typescript
import { clerkClient } from '@clerk/clerk-sdk-node';
```

## Benefícios
- Login independente para cada aluno
- Suporte a múltiplos provedores OAuth (Google, GitHub, etc.)
- UI de autenticação customizável
- Gerenciamento de usuários via dashboard Clerk
