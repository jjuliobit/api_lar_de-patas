# Lar de Patas — API de adoção responsável de animais

API REST do sistema **Lar de Patas**, voltada à adoção responsável de animais. O back-end cadastra tutores, animais disponíveis, solicitações de adoção, registros de animais perdidos e estatísticas do painel do usuário autenticado.

O nome no código e no Swagger é **API Lar de Patas** (`api-lar-de-patas`). Repositório: [https://github.com/jjuliobit/lar_de-patas.git](https://github.com/jjuliobit/lar_de-patas.git).

---

## 1. Identificação do projeto

| Item | Valor |
| --- | --- |
| Nome | Lar de Patas |
| Pacote | `api-lar-de-patas` (versão `0.0.1`) |
| Tipo | API REST (NestJS) |
| Prefixo HTTP | `/api` |
| Objetivo | Apoiar o fluxo de cadastro, divulgação e adoção responsável de animais, além do registro de animais perdidos |

### Principais funcionalidades implementadas

- Cadastro de usuário com endereço e senha criptografada, com abertura automática de sessão em `POST /api/auth/register`.
- Login e logout por **sessão persistida no banco** e cookie `sessionId` (não é JWT).
- Consulta do perfil autenticado em `GET /api/auth/me`.
- CRUD de usuários (rotas protegidas).
- CRUD de pets, com listagem paginada pública e upload opcional de foto.
- Fluxo de adoção: solicitar, listar enviadas/recebidas, concluir (transfere o pet) e rejeitar.
- CRUD de animais perdidos, com upload opcional de foto.
- Dashboard com contagens do usuário autenticado.
- Servir arquivos enviados em `/uploads`.
- Documentação interativa via Swagger em `/docs`.

---

## 2. Tecnologias utilizadas

Tecnologias **confirmadas no código ou nos arquivos de configuração**:

| Tecnologia | Finalidade |
| --- | --- |
| **TypeScript** (`^5.7.3`, target `ES2023`) | Linguagem da API |
| **Node.js** | Runtime. O `package.json` não declara `engines`. O NestJS 11 exige Node.js 20 ou superior |
| **NestJS 11** (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`) | Framework HTTP e organização em módulos |
| **Express** | Adaptador HTTP do Nest (`NestExpressApplication`) |
| **PostgreSQL** | Banco de dados (`provider = "postgresql"`). O `.env.example` indica PostgreSQL >= 15 |
| **Prisma 5.22.0** (`prisma` + `@prisma/client`) | ORM, schema, migrations e Prisma Client |
| **bcrypt** | Hash da senha (`bcrypt.hash(..., 6)` no cadastro) |
| **cookie-parser** | Leitura do cookie `sessionId` |
| **class-validator** e **class-transformer** | Validação e transformação dos DTOs, via `ValidationPipe` global |
| **@nestjs/swagger** | Documentação interativa da API |
| **@nestjs/mapped-types** | `PartialType` / `PickType` nos DTOs de atualização |
| **helmet** | Cabeçalhos HTTP de segurança; `crossOriginResourcePolicy` em `cross-origin` para as fotos |
| **multer** (`memoryStorage`) | Upload de imagens de pets e animais perdidos |
| **Jest**, **ts-jest** e **supertest** | Ferramentas de teste configuradas no `package.json` |
| **Prettier** | Formatação (`pnpm run format`) |
| **ESLint** | Script `lint` no `package.json`. Arquivo de configuração ESLint **não encontrado** na raiz |
| **pnpm** | Gerenciador de pacotes (`pnpm-lock.yaml`, lockfileVersion 9) |

### Dependências listadas, mas sem uso no código-fonte (`src/`)

As bibliotecas abaixo estão no `package.json` e **não são importadas** em `src/`:

- `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt` — a autenticação real é por sessão + cookie.
- `dotenv` — não é importado; o Prisma lê `DATABASE_URL` do `.env` nas operações do CLI/Client.
- `@prisma/adapter-pg` — o `DatabaseService` instancia `PrismaClient` diretamente.
- `@nestjs/serve-static` — arquivos estáticos são servidos com `app.useStaticAssets`.
- `@neon/config` e `@neon/env` — há um `neon.mjs` com `defineConfig({})`, sem configuração adicional.

---

## 3. Pré-requisitos

| Ferramenta | Versão / observação |
| --- | --- |
| Node.js | Não pinada no projeto. NestJS 11 requer **Node.js 20+** |
| pnpm | Usado no repositório (`pnpm-lock.yaml`) |
| PostgreSQL | **>= 15**, conforme comentário do `.env.example` |
| Prisma CLI | `5.22.0` (devDependency) |
| Git | Para clonar o repositório |

Não há `.nvmrc`, `.node-version` nem campo `engines` no `package.json`.

---

## 4. Instalação e execução

Comandos abaixo são os scripts reais do `package.json` e os comandos oficiais do Prisma.

### 4.1. Clonar o projeto

```bash
git clone https://github.com/jjuliobit/lar_de-patas.git
cd lar_de-patas
```

### 4.2. Instalar dependências

```bash
pnpm install
```

O script `postinstall` executa `prisma generate` e gera o Prisma Client após a instalação.

### 4.3. Configurar variáveis de ambiente

Copie o exemplo e preencha com a conexão real do banco (valores fictícios no exemplo):

```bash
cp .env.example .env
```

Conteúdo atual do `.env.example`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

### 4.4. Banco de dados e Prisma Client

Com o PostgreSQL acessível e o `DATABASE_URL` definido:

```bash
npx prisma migrate deploy
npx prisma generate
```

Em desenvolvimento, para criar/aplicar migrations a partir do `schema.prisma`:

```bash
npx prisma migrate dev
```

O script `build` também roda `prisma generate` antes do `nest build`. Sem o Client gerado, o TypeScript não reconhece `user`, `pet`, `lostPet` nem os enums do Prisma.

### 4.5. Desenvolvimento

```bash
pnpm run start:dev
```

Equivalentes disponíveis:

```bash
pnpm run start
pnpm run start:debug
```

A API sobe em `http://localhost:3000/api` (ou na porta de `PORT`). O `main.ts` imprime também `/docs` e `/uploads`.

### 4.6. Produção

```bash
pnpm run build
pnpm run start:prod
```

`build` executa `prisma generate && nest build`. `start:prod` executa `node dist/main`.

### 4.7. Testes e qualidade

```bash
pnpm run test
pnpm run test:watch
pnpm run test:cov
pnpm run test:debug
pnpm run test:e2e
pnpm run lint
pnpm run format
```

Ver a [seção 12](#12-testes-e-qualidade) sobre o que de fato existe.

### 4.8. Outros scripts

| Script | Comando |
| --- | --- |
| `contract:emit` | `prisma contract emit` |

---

## 5. Variáveis de ambiente

Valores abaixo são **fictícios**. Não use credenciais reais.

| Variável | Onde aparece | Obrigatória | Finalidade | Exemplo |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | `prisma/schema.prisma`, `.env.example` | Sim | Conexão PostgreSQL do Prisma | `postgresql://usuario:senha@localhost:5432/lar_de_patas` |
| `PORT` | `src/main.ts` (`process.env.PORT \|\| 3000`) | Não | Porta HTTP. Padrão `3000` | `3000` |

`PORT` **não** está no `.env.example`. O pacote `dotenv` não é carregado no código da aplicação; em desenvolvimento o Prisma costuma popular `DATABASE_URL` a partir do `.env`. Para `PORT`, defina a variável no ambiente do sistema ou da plataforma de deploy.

Nenhuma outra variável de ambiente é lida em `src/`.

---

## 6. Arquitetura e organização das pastas

```text
lar_de-patas/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── main.ts                 # Bootstrap, prefixo /api, CORS, pipes, Swagger, uploads
│   ├── app.module.ts           # Módulos da aplicação
│   ├── auth/                   # Login, registro, logout, sessão, AuthGuard
│   ├── user/                   # CRUD de usuários
│   ├── pet/                    # CRUD de pets + paginação
│   ├── adoption/               # Solicitações e conclusão de adoção
│   ├── lost-pets/              # Animais perdidos
│   ├── dashboard/              # Estatísticas do usuário
│   ├── database/               # PrismaClient global (DatabaseService)
│   └── upload/                 # Configuração Multer e persistência de fotos
├── test/                       # Teste e2e de scaffold do Nest
├── uploads/                    # Fotos em runtime (ignorado pelo Git)
├── .env.example
├── package.json
└── nest-cli.json
```

### Responsabilidade dos módulos

| Módulo | Função |
| --- | --- |
| `DatabaseModule` | Global. Exporta `DatabaseService`, que estende `PrismaClient` e chama `$connect()` no `onModuleInit` |
| `AuthModule` | Autenticação por sessão. Exporta `AuthService` e `AuthGuard` |
| `UserModule` | Cadastro e manutenção de usuários |
| `PetModule` | Pets para adoção e upload de foto |
| `AdoptionModule` | Solicitações, conclusão e rejeição |
| `LostPetsModule` | Registros de animais perdidos (sem `AuthGuard`) |
| `DashboardModule` | Contagens do painel |

### DTOs, entities, guards e middlewares

- **DTOs**: validam o corpo/query com `class-validator`. Existem em `auth/dto`, `user/dto`, `pet/dto`, `adoption/dto` e `lost-pets/dto`.
- **Entities** (`user.entity.ts`, `pet.entity.ts`, `adoption.entity.ts`, `lost-pet.entity.ts`): classes vazias geradas pelo CLI do Nest. O modelo real está no Prisma.
- **Guards**: apenas `AuthGuard`, que lê `request.cookies.sessionId` e anexa `request.user`.
- **Decorators**: `CurrentUser` devolve `request.user`.
- **Middlewares globais** (em `main.ts`, não em classes Nest): `helmet`, `cookieParser`, CORS (`origin: true`, `credentials: true`), `trust proxy = 1`.
- **Pipe global**: `ValidationPipe` com `whitelist`, `forbidNonWhitelisted` e `transform`.
- **Upload**: `FileInterceptor('foto', imageUploadOptions)` em pets e lost-pets. Arquivos ficam em memória até o service gravar em disco.

`CompleteAdoptionDto` existe em `src/adoption/dto/complete-adoption.dto.ts`, mas **não é usado** pelo controller (a conclusão não recebe corpo).

### Fluxo de uma requisição

1. Express recebe a chamada (com prefixo `/api`, exceto `/docs` e `/uploads`).
2. Helmet, cookie-parser e CORS são aplicados.
3. O `ValidationPipe` valida DTOs e remove campos extras.
4. Se a rota tiver `@UseGuards(AuthGuard)`, o cookie `sessionId` é validado na tabela `Session`.
5. O controller chama o service.
6. O service usa `DatabaseService` (Prisma) e, quando houver foto, `saveUploadedImage` / `deleteUploadedPhoto`.
7. A resposta JSON segue o formato retornado pelo service. Exceções do Nest viram HTTP 4xx/5xx.

---

## 7. Banco de dados

- **SGBD:** PostgreSQL
- **ORM:** Prisma 5.22.0
- **Schema:** `prisma/schema.prisma`
- **Migration versionada:** `prisma/migrations/20261002225849_/migration.sql`

### Modelos e relacionamentos

```text
User 1 ── 1 Account
User 1 ── N Session
User 1 ── 1 Address
User 1 ── N Pet
User 1 ── N Adoption          (solicitante)
User 1 ── N LostPet
Pet  1 ── N Adoption
```

Todas as FKs usam `onDelete: Cascade`.

#### User

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | `String` UUID | PK |
| `nome`, `sobrenome` | `String` | Obrigatórios |
| `telefone` | `String?` | |
| `idade` | `Int` | |
| `email` | `String` | Único |
| `sexo` | `Sexo` | `Feminino` \| `Masculino` |
| `cpf` | `String` | Único |
| `foto` | `String?` | |
| `createdAt`, `updatedAt` | `DateTime` | |

#### Account

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | `String` UUID | PK |
| `userId` | `String` | Único, FK User |
| `passwordHash` | `String` | Senha com bcrypt |
| `createdAt`, `updatedAt` | `DateTime` | |

#### Session

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | `String` UUID | PK; valor gravado no cookie `sessionId` |
| `userId` | `String` | FK User, índice |
| `expiresAt` | `DateTime` | 15 minutos após o login/registro |
| `createdAt` | `DateTime` | |

#### Pet

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | `String` UUID | PK |
| `userId` | `String` | Dono atual, índice |
| `nome` | `String` | |
| `idade` | `Int` | |
| `sexo` | `SexoPet` | `Macho` \| `Femea` |
| `especie` | `Especie` | `Cachorro` \| `Gato` \| `Passaro` \| `Outro` |
| `raca`, `cor`, `foto`, `descricao`, `localizacao` | `String?` | |
| `status` | `StatusPet` | Padrão `Disponivel`. Também: `EmProcesso`, `Adotado`, `Indisponivel` |
| `createdAt`, `updatedAt` | `DateTime` | |

Índices em `userId`, `status` e `especie`.

#### Adoption

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | `String` UUID | PK |
| `petId` | `String` | FK Pet |
| `userId` | `String` | Solicitante, FK User |
| `status` | `StatusAdocao` | Padrão `Enviado`. Também: `Analisando`, `Aprovado`, `Rejeitado`, `Concluido` |
| `observacoes` | `String?` | |
| `createdAt`, `updatedAt` | `DateTime` | |

Único composto `@@unique([petId, userId])`.

#### LostPet

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | `String` UUID | PK |
| `userId` | `String` | Quem registrou |
| `nome` | `String` | |
| `especie` | `Especie` | |
| `sexo` | `SexoPetPerdido?` | `Macho` \| `Femea` |
| `raca`, `cor`, `descricao`, `foto` | `String?` | |
| `localizacao` | `String` | |
| `dataUltimaVez` | `DateTime` | |
| `encontrado` | `Boolean` | Padrão `false` |
| `nomeContato`, `telefoneContato`, `emailContato` | `String` | |
| `createdAt`, `updatedAt` | `DateTime` | |

#### Address

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | `String` UUID | PK |
| `userId` | `String` | Único, FK User |
| `cep`, `complemento`, `bairro` | `String?` | |
| `logradouro`, `numero`, `cidade`, `estado` | `String` | |
| `createdAt`, `updatedAt` | `DateTime` | |

### Gerenciar migrations

```bash
npx prisma migrate dev      # desenvolvimento (cria e aplica)
npx prisma migrate deploy   # ambientes já versionados (CI/deploy)
npx prisma generate         # gera o Client
npx prisma studio           # interface oficial do Prisma (CLI, sem script no package.json)
```

Não há scripts `prisma:*` no `package.json`.

---

## 8. Visão geral das rotas e endpoints

Prefixo global: **`/api`**. Autenticação, quando exigida, é o cookie HTTP-only `sessionId` — não um header Bearer.

Legenda de autenticação:

- **Público:** sem `AuthGuard`.
- **Protegido:** `@UseGuards(AuthGuard)`.

### 8.1. Autenticação (`/api/auth`)

| Método | Rota | Auth | Descrição | Corpo / params | Respostas principais |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Público | Cadastra usuário + endereço + conta e abre sessão | `CreateUserDto` | `201`, `409` (CPF/e-mail), `400` |
| `POST` | `/api/auth/login` | Público | Autentica e define cookie | `{ email, senha }` | `200`, `401` |
| `POST` | `/api/auth/logout` | Cookie presente | Remove sessão e limpa cookie | — | `200`, `401`, `404` |
| `GET` | `/api/auth/me` | Protegido | Perfil da sessão | — | `200`, `401` |

Logout exige cookie `sessionId`; não usa `AuthGuard`, mas lança `401` se o cookie não existir.

#### Exemplo — cadastro

```json
{
  "nome": "Ana",
  "sobrenome": "Silva",
  "telefone": "11999999999",
  "idade": 28,
  "email": "ana@example.com",
  "sexo": "Feminino",
  "cpf": "12345678901",
  "foto": "https://example.com/foto.jpg",
  "password": "senha123",
  "address": {
    "cep": "01310100",
    "logradouro": "Avenida Exemplo",
    "numero": "100",
    "complemento": "Apto 1",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP"
  }
}
```

Resposta de registro/login (campos confirmados no `AuthService`):

```json
{
  "user": {
    "id": "uuid",
    "nome": "Ana",
    "sobrenome": "Silva",
    "email": "ana@example.com"
  },
  "expiresAt": "2026-10-11T16:00:00.000Z"
}
```

O `sessionId` vai só no cookie, não no JSON.

#### Exemplo — login

```json
{
  "email": "ana@example.com",
  "senha": "senha123"
}
```

`GET /api/auth/me` devolve `{ "user": { ... } }` com `id`, `nome`, `sobrenome`, `email`, `telefone`, `idade`, `sexo`, `cpf`, `foto` e `createdAt`.

Logout:

```json
{
  "mensagem": "Logout realizado com sucesso"
}
```

### 8.2. Usuários (`/api/user`)

O controller inteiro usa `AuthGuard`.

| Método | Rota | Auth | Descrição | Params / corpo | Respostas |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/user` | Protegido | Cria usuário (não abre sessão) | `CreateUserDto` | `201`/`200`, `409`, `400` |
| `GET` | `/api/user` | Protegido | Lista todos | — | `200`, `404` se lista vazia |
| `GET` | `/api/user/:id` | Protegido | Busca por id | `id` | `200`, `404` |
| `PATCH` | `/api/user/:id` | Protegido | Atualiza `nome`, `sobrenome`, `idade`, `foto` | `id` + `UpdateUserDto` | `200` |
| `DELETE` | `/api/user/:id` | Protegido | Remove usuário (cascade no banco) | `id` | `200`, `404` |

Não há verificação de dono: qualquer sessão válida acessa qualquer id.

Respostas típicas confirmadas:

```json
{
  "user": { },
  "mensagem": "Usuario criado com sucesso"
}
```

```json
{
  "user": []
}
```

### 8.3. Pets (`/api/pet`)

| Método | Rota | Auth | Descrição | Params / corpo | Respostas |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/pet` | Protegido | Cadastra pet (`multipart/form-data`, foto opcional) | campos do `CreatePetDto` + arquivo `foto` | `201`/`200`, `400` |
| `GET` | `/api/pet` | Público | Lista paginada | query `page`, `limit` (1–100, padrão 10) | `200` |
| `GET` | `/api/pet/:id` | Público | Detalhe | `id` | `200`, `404` |
| `PATCH` | `/api/pet/:id` | Protegido | Atualiza campos do DTO | `id` + `UpdatePetDto` | `200`, `404` |
| `DELETE` | `/api/pet/:id` | Protegido | Remove pet e arquivo da foto | `id` | `200`, `404` |

`userId` no cadastro vem do **corpo**, não da sessão.

Campos do cadastro: `nome`, `idade`, `sexo`, `especie`, `raca?`, `cor?`, `descricao?`, `localizacao?`, `status?`, `userId`. Foto: JPEG, PNG, WebP ou GIF, até 5 MB.

Listagem:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 0,
    "totalPages": 0,
    "hasPreviousPage": false,
    "hasNextPage": false
  }
}
```

Detalhe usa a chave `pets` (não `pet`):

```json
{
  "pets": { }
}
```

### 8.4. Adoção (`/api/adoption`)

Todas as rotas protegidas. O solicitante/dono sai de `@CurrentUser()`.

| Método | Rota | Auth | Descrição | Params / corpo | Respostas |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/adoption` | Protegido | Cria solicitação | `{ petId, observacoes? }` | `201`, `400`, `404`, `409` |
| `GET` | `/api/adoption/received` | Protegido | Solicitações dos pets do usuário logado | — | `200` |
| `GET` | `/api/adoption/sent` | Protegido | Solicitações enviadas pelo usuário | — | `200` |
| `PATCH` | `/api/adoption/:id/complete` | Protegido | Conclui e transfere o pet | `id` UUID | `200`, `400`, `403`, `404`, `409` |
| `PATCH` | `/api/adoption/:id/reject` | Protegido | Rejeita solicitação | `id` UUID | `200`, `400`, `403`, `404` |

Corpo da solicitação:

```json
{
  "petId": "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  "observacoes": "Tenho quintal e tempo para o animal."
}
```

Conclusão (confirmado no service):

```json
{
  "message": "Adoção concluída e animal transferido com sucesso!",
  "adoption": { },
  "pet": { }
}
```

Rejeição:

```json
{
  "message": "Solicitação de adoção rejeitada",
  "adoption": { }
}
```

Não existe endpoint que altere o status para `Analisando` ou `Aprovado`, embora os valores existam no enum.

### 8.5. Animais perdidos (`/api/lost-pets`)

**Nenhuma rota deste módulo usa `AuthGuard`.** CRUD é público.

| Método | Rota | Auth | Descrição | Params / corpo | Respostas |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/lost-pets` | Público | Registra animal perdido (`multipart/form-data`) | `CreateLostPetDto` + `foto` opcional | `201`/`200`, `400` |
| `GET` | `/api/lost-pets` | Público | Lista todos (inclui dados do usuário) | — | `200` |
| `GET` | `/api/lost-pets/:id` | Público | Detalhe | `id` | `200`, `404` |
| `PATCH` | `/api/lost-pets/:id` | Público | Atualiza (ignora `userId` no service) | `id` + `UpdateLostPetDto` | `200` |
| `DELETE` | `/api/lost-pets/:id` | Público | Remove registro e foto | `id` | `200` |

Campos obrigatórios no cadastro: `nome`, `especie`, `localizacao`, `dataUltimaVez`, `nomeContato`, `telefoneContato`, `emailContato`, `userId`. Opcionais: `sexo`, `raca`, `cor`, `descricao`, `encontrado`, `foto`.

O `POST` devolve o registro criado (objeto Prisma, sem envelope). O `GET /` devolve um array.

### 8.6. Dashboard (`/api/dashboard`)

| Método | Rota | Auth | Descrição | Resposta |
| --- | --- | --- | --- | --- |
| `GET` | `/api/dashboard/stats` | Protegido | Contagens do usuário da sessão | `200`, `401` |

```json
{
  "totalAnimais": 0,
  "adocoesEmAndamento": 0,
  "adocoesConcluidas": 0,
  "animaisPerdidosRegistrados": 0
}
```

Significado no `DashboardService`:

- `totalAnimais`: pets com `userId` da sessão.
- `adocoesEmAndamento`: adoções `Enviado` ou `Analisando` de pets desse usuário.
- `adocoesConcluidas`: **todas** as adoções com status `Concluido` (sem filtro de usuário).
- `animaisPerdidosRegistrados`: `LostPet` do usuário com `encontrado = false`.

### 8.7. Arquivos estáticos e documentação

| Método | Rota | Auth | Descrição |
| --- | --- | --- | --- |
| `GET` | `/uploads/pets/...` | Público | Foto de pet |
| `GET` | `/uploads/lost-pets/...` | Público | Foto de animal perdido |
| `GET` | `/docs` | Público | Swagger UI |

Essas rotas **não** usam o prefixo `/api`.

Não há `AppController` nem rota `GET /` que devolva `"Hello World!"`.

---

## 9. Autenticação e autorização

A API **não utiliza JWT** no fluxo implementado. Login e registro gravam uma linha em `Session` e enviam o id no cookie `sessionId`.

### Sessão

- Duração: **15 minutos** (`expiresAt` e `maxAge` do cookie = `15 * 60 * 1000`).
- Cookie:
  - `httpOnly: true`
  - `secure: true` somente se a requisição for HTTPS (`x-forwarded-proto` ou `request.protocol`)
  - `sameSite: 'none'` em HTTPS e `'lax'` em HTTP
- CORS com `credentials: true` (necessário para o navegador enviar o cookie).
- `trust proxy` = 1, para detectar HTTPS atrás de proxy (ex.: Render).

### `AuthGuard`

1. Lê `request.cookies.sessionId`.
2. Sem cookie → `401` (`Acesso nao autorizado.`).
3. `AuthService.validateSession`:
   - sessão inexistente → `401` (`Sessão inválida`);
   - expirada → apaga a sessão e `401` (`Sessão expirada`).
4. Coloca o usuário em `request.user`.

### Autorização

Não há papéis (admin, tutor, etc.) nem guards de permissão. “Autorizado” significa “possui sessão válida”.

Regras pontuais no módulo de adoção:

- só o **dono atual do pet** conclui ou rejeita (`403` se não for);
- o dono não pode solicitar o próprio animal;
- o dono não pode concluir uma adoção em que ele é o solicitante.

Nos módulos `user`, `pet` (update/delete) e `lost-pets` **não há checagem de dono**.

O Swagger declara `addBearerAuth()`, mas as rotas protegidas não leem `Authorization: Bearer`. Para testar rotas protegidas no Swagger, o cookie precisa ser enviado pela sessão do navegador.

---

## 10. Regras de negócio

### Cadastro de usuários — implementado

- Obrigatórios: nome, sobrenome, idade (>= 0), e-mail válido, sexo (`Feminino`/`Masculino`), CPF, senha (mínimo 6 caracteres) e endereço (logradouro, número, cidade, estado).
- Telefone, foto (URL) e campos opcionais de endereço são facultativos.
- Senha gravada como hash bcrypt com custo `6` na tabela `Account`.
- E-mail e CPF únicos (`P2002` → `409`).
- `POST /api/auth/register` cria usuário e sessão. `POST /api/user` cria usuário **sem** sessão e exige autenticação.
- `PATCH /api/user/:id` só aceita `nome`, `sobrenome`, `idade` e `foto`.

### Cadastro de animais — implementado

- Obrigatórios: `nome`, `idade`, `sexo`, `especie`, `userId`.
- `status` padrão no banco: `Disponivel`.
- Foto opcional; em falha do insert, o arquivo é apagado.
- Listagem pública, mais recentes primeiro, paginada.
- Ao excluir o pet, a foto em disco também é removida.
- O `userId` do cadastro **não** é extraído da sessão.

### Adoção e transferência — implementado

1. Pet precisa existir.
2. Dono não solicita o próprio pet.
3. Pet com status `Adotado` não recebe nova solicitação.
4. Já existe solicitação `Enviado` ou `Analisando` do mesmo par pet+usuário → `409`.
5. Solicitação anterior `Rejeitado` é reaberta para `Enviado`.
6. Nova solicitação nasce como `Enviado`. Se o pet estava `Disponivel`, passa a `EmProcesso`.
7. **Concluir** (transação):
   - só o dono atual;
   - status da solicitação `Enviado` ou `Analisando`;
   - `updateMany` condicional transfere `userId` e marca o pet `Adotado`;
   - solicitação vai para `Concluido`;
   - demais pendentes do mesmo pet vão para `Rejeitado`;
   - concorrência: se `count !== 1` → `409`.
8. **Rejeitar**: só o dono; se não restar pendência e o pet estiver `EmProcesso`, volta para `Disponivel`.

### Animais perdidos — implementado (sem autenticação)

- Cadastro exige dados do animal, local, data da última vez, contato e `userId`.
- `encontrado` padrão `false`.
- Update descarta `userId` do DTO.
- Delete remove a foto do disco.

### Dashboard — implementado com ressalva

- Contagens descritas na [seção 8.6](#86-dashboard-apidashboard).
- `adocoesConcluidas` não filtra pelo usuário da sessão.

### Presente no schema, sem fluxo de API correspondente

| Item | Situação |
| --- | --- |
| `StatusAdocao.Analisando` e `Aprovado` | Existem no enum; nenhum endpoint atribui esses valores |
| `StatusPet.Indisponivel` | Pode ser enviado no DTO de pet; não há regra específica no service |
| `CompleteAdoptionDto` | Arquivo existe; controller não o utiliza |
| Classes `entities/` | Vazias; não representam o modelo persistido |
| JWT / Passport | Dependências instaladas; fluxo não implementado |
| Papéis e permissões | Não identificados no código-fonte |

---

## 11. Tratamento de erros

Não há `ExceptionFilter` customizado. Vale o filtro padrão do NestJS, as exceções lançadas nos services e o `ValidationPipe`.

### Validação

`ValidationPipe` global:

- remove propriedades que não estão no DTO (`whitelist`);
- rejeita propriedades extras (`forbidNonWhitelisted`) → **400**;
- transforma tipos (`transform: true`), inclusive `page`/`limit` e `idade` em multipart.

Uploads inválidos (MIME ou arquivo sem buffer) → **400**.

### Códigos HTTP observados no código

| Código | Quando |
| --- | --- |
| `200` | Sucesso padrão; login e logout usam `@HttpCode(200)` |
| `201` | `POST /api/auth/register` e `POST /api/adoption` |
| `400` | DTO inválido; dono tenta adotar o próprio pet; pet já adotado; solicitação já processada; imagem inválida |
| `401` | Sem cookie, sessão inválida/expirada, e-mail/senha errados, logout sem sessão |
| `403` | Usuário não é o responsável atual do pet (complete/reject) |
| `404` | Recurso inexistente; lista de usuários vazia; sessão não encontrada no logout |
| `409` | CPF/e-mail duplicados; solicitação pendente repetida; transferência concorrente |
| `500` | Exceção não tratada (por exemplo alguns `update`/`delete` do Prisma sem `P2025`) |

Erros Prisma tratados explicitamente:

- `P2002` (único) em cadastro de usuário/auth → `409`.
- `P2025` (registro inexistente) em update/delete de pet e delete de usuário → `404`.

`lost-pets.update` e `user.update` não tratam `P2025`.

Formato típico do Nest:

```json
{
  "message": "Email ou senha inválidos",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

## 12. Testes e qualidade

| Recurso | Situação |
| --- | --- |
| Testes unitários (`*.spec.ts` em `src/`) | **Não existem** |
| Teste e2e | `test/app.e2e-spec.ts` — scaffold do Nest que chama `GET /` e espera `200` + `"Hello World!"`. **Não há essa rota** na aplicação atual |
| Jest | Configurado em `package.json` (`rootDir: src`, `testRegex: .*\.spec\.ts$`) |
| e2e | `test/jest-e2e.json` + script `test:e2e` |
| ESLint | Script `lint` existe; arquivo de config **não identificado** na raiz |
| Prettier | `.prettierrc` com `singleQuote: true` e `trailingComma: "all"` |

Comandos: ver [seção 4.7](#47-testes-e-qualidade).

---

## 13. Documentação interativa

Swagger está configurado em `src/main.ts`:

```ts
SwaggerModule.setup('docs', app, document);
```

Acesso local (porta padrão):

```text
http://localhost:3000/docs
```

Se `PORT` estiver definida, troque a porta. O log de inicialização confirma essa URL.

A UI descreve os DTOs e os bodies `multipart` de pet e lost-pet. O botão Authorize (Bearer) **não corresponde** ao mecanismo real de autenticação (cookie `sessionId`).

---

## 14. Observações importantes

1. **Gere o Prisma Client no deploy.** O `postinstall` e o `build` já executam `prisma generate`. Sem isso, o TypeScript falha com `Property 'user' does not exist on type 'DatabaseService'` e enums ausentes em `@prisma/client`.
2. **`prisma` está em `devDependencies`.** Em install de produção que omite devDependencies, o `prisma generate` do `postinstall`/`build` pode falhar. Inclua o CLI nas dependências de produção ou instale as devDependencies no build.
3. **Sessão de 15 minutos.** Após esse prazo o cookie e o registro em `Session` deixam de valer.
4. **Cookie `Secure` / `SameSite`.** Em HTTP local o cookie é `lax` e sem `Secure`. Em HTTPS (incluindo proxy) vira `Secure` + `SameSite=None`, necessário para front em outra origem.
5. **CORS** aceita qualquer `Origin` (`origin: true`) com credenciais.
6. **Uploads** ficam em `uploads/` no disco da instância (`process.cwd()`). Em plataformas com filesystem efêmero os arquivos se perdem no redeploy. A pasta está no `.gitignore`.
7. **Fotos:** JPEG, PNG, WebP ou GIF; máximo 5 MB; extensão derivada do MIME, não do nome do arquivo.
8. **Módulo `lost-pets` é público** (criar, editar e apagar sem login).
9. **Sem controle de dono** em update/delete de user e pet: qualquer usuário autenticado pode alterar ou apagar o registro de outro.
10. **`POST /api/pet` e `POST /api/lost-pets` recebem `userId` no body**, não do usuário logado.
11. **Dashboard:** `adocoesConcluidas` é contagem global.
12. **Enums `Analisando` e `Aprovado`** não têm endpoint que os atribua.
13. **Não há JWT** no fluxo real, apesar das dependências e do `addBearerAuth()` do Swagger.
14. **`GET /api/user` vazio retorna 404** (`Usuario não encontrado`), não uma lista vazia.
15. **Não há filtro de exceção global** nem módulo `ConfigModule` do Nest.
16. O teste e2e atual **não reflete** as rotas da API.

---

## Licença

O `package.json` declara `"license": "UNLICENSED"` e `"private": true`.
