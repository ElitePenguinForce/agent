# Agent

> Agent é um bot privado, desenvolvido com Nodejs e Discord.js, com o propósito de automatizar tarefas dentro de um servidor de Discord chamado ["Elite Penguin Force"](https://discord.gg/epf). O servidor reúne administradores, moderadores e desenvolvedores de grandes servidores brasileiros, juntos, formamos uma comunidade onde compartilhamos experiências de administração, ferramentas, metodologias, serviços e muito mais.

<p align='middle'>
  <img src="https://user-images.githubusercontent.com/32278696/200096419-aeb7c30a-f341-4f36-a7f7-b37aab27861e.png" width='25%'/>
</p>

<p align='middle'>
  <strong>Elite Penguin Force<strong>
</p>

## Testando localmente

Primeiramente, [Node.js](https://nodejs.org) precisa estar instalado na máquina.

Clone o projeto localmente

```bash
git clone https://github.com/ElitePenquinForce/agent && cd agent
```

Instale as dependências do projeto

```bash
npm install
```

Antes de iniciar o projeto, é importante criar um arquivo `.env` na raiz do diretório e definir as seguintes variáveis

```env
DISCORD_TOKEN=''
MONGOURL=''
OFFTOPIC_WEBHOOK=''
```

É importante também configurar o arquivo que está localizado no caminho `src/config.ts`, caso contrário sua aplicação irá crashar instantâneamente.

```js
export default {
  ids: {
    devs: ["...", "..."], // Id dos desenvolvedores do bot
    roles: {
      dev: "...", // Id do cargo de desenvolvedor
      master: "...", // Id do cargo de master
      guard: "...", // Id do cargo de guard
      mod: "...", // Id do cargo de mod
      admin: "...", // Id do cargo de admin
      owner: "...", // Id do cargo de owner
      guildsDiv: "...", // Id do cargo divisor entre cargos de servidor e os demais cargos
      guest: "...", // Id do cargo de guest
    },
    channels: {
      approve: "...", // Id do canal de aprovação
      serversList: "...", // Id do canal de lista de servidores
      suggestions: "...", // Id do canal de sugestões
      changeLog: "...", // Id do canal de logs
    },
    agent: "...", // Id do agent
    guild: "...", // Id do servidor
    tags: {
      pending: "...", // Id da tag de sugestões pendentes
    },
  },
  minMembersToCreateGuildRole: 5, // Quantidade mínima de membros minimos para criar o cargo de servidor
  forms: {
    dev: {
      channelId: "...", // Id do canal de formulário de desenvolvedor
      emoji: "...", // Emoji do formulário de desenvolvedor
      bannerURL: "...", // URL do banner do formulário de desenvolvedor
      color: 0xe18002, // Cor do formulário de desenvolvedor
    },
    guild: {
      channelId: "...", // Id do canal de formulário de servidor
      emoji: "...", // Emoji do formulário de servidor
      bannerURL: "...", // URL do banner do formulário de servidor
      color: 0x66f392, // Cor do formulário de servidor
    },
  },
};
```

Inicie o projeto com o comando abaixo

```bash
npm run dev
```

Qualquer contribuição para melhorar o nosso projeto será muito bem vindo :D
