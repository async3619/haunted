<h1 align="center">
  <br />
  👻
  <br />
  Haunted
  <sup>
    <br />
    <br />
  </sup>    
</h1>

<div align="center">
    <a href="https://github.com/async3619/haunted/blob/main/LICENSE">
        <img src="https://img.shields.io/github/license/async3619/haunted.svg?style=flat-square" alt="MIT License" />
    </a>
    <a href="https://codecov.io/gh/async3619/haunted">
        <img alt="Codecov" src="https://img.shields.io/codecov/c/github/async3619/haunted?style=flat-square&token=DF3uhBCl9j">
    </a>
    <a href="https://hub.docker.com/r/async3619/haunted">
        <img alt="Docker Image Version (tag latest semver)" src="https://img.shields.io/docker/v/async3619/haunted/latest?label=docker&style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@async3619/haunted">
        <img alt="npm" src="https://img.shields.io/npm/v/@async3619/haunted?style=flat-square" />
    </a>
    <br />
    <sup>music metadata retrieving server</sup>
    <br />
    <br />
</div>

## 📖 About

Haunted is music metadata retrieving server. this server retrieves metadata from several sources and serves it to client.

This server is mainly used for [Cruise](https://github.com/async3619/cruise). but you can use it for everything you want.

## 🚀 Getting Started

### 📦 Using Docker

```bash
docker run -d -p 3000:3000 async3619/haunted:latest
```

### 📦 Using Docker Compose

```yaml
version: "3.7"

services:
    haunted:
        image: async3619/haunted:latest
        ports:
            - "3000:3000"
        volumes:
            - ./config.json:/home/node/config.json:ro
```

## 📝 Usage

Before using this server in client side, you need to launch this server. see [Getting Started](#-getting-started) section.

### 📡 TRPC

you can use this server with [TRPC](https://trpc.io/). we provide a type-safe client for TRPC. we also provide 
server-side router types for client usage. all you need to do is to import `Router` type from `@async3619/haunted`.

now, you should install `@async3619/haunted` package in your client project to get type definitions.

```bash
npm install @async3619/haunted 

# or

yarn add @async3619/haunted

# or

pnpm add @async3619/haunted
```

now you can use this server with TRPC:

```ts
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { Router } from "@async3619/haunted";
//       ^^^^^^ this will make you comfy and type-safe with your IDE

// ...

const client = createTRPCProxyClient<Router>({
    links: [httpBatchLink({ url: "http://localhost:3000/trpc" })],
});

const result = await client.searchAlbums({ query: "독립음악", limit: 5, locale: "ko_KR" });
console.log(result); // [{ ... }]
```

### 📡 GraphQL

In addition to TRPC, you can use this server with GraphQL. we provide [schema definitions](./schema.graphqls) for 
GraphQL. you can use `./schema.graphql` file to generate your client-side code with your favorite GraphQL client 
generator such as `apollo-codegen` or `graphql-codegen`.

```ts
import { ApolloClient, InMemoryCache, gql } from "@apollo/client"; // or your favorite GraphQL client

const client = new ApolloClient({
    uri: "http://localhost:3000/graphql",
    cache: new InMemoryCache(),
});

const result = await client.query({
    query: gql`
        query SearchAlbums($input: SearchInput!) {
            searchAlbums(input: $input) {
                title
                artists
            }
        }
    `,
    variables: {
        query: "독립음악",
    },
});

console.log(result.data); // { searchAlbums: [{ ... }] }
```

## 🛠️ Configuration

This server uses `config.json` file from current working directory. we provide the configuration schema in
`config.schema.json` file. you can use this file to validate your configuration file in your IDE.

```json5
{
    servers: {
        trpc: {
            path: "/trpc",
        },
        graphql: {
            path: "/graphql",
        },
    },
    cacheTTL: 3600, // cache TTL in seconds
    resolvers: {
        // whatever resolvers you want to use
        spotify: {
            clientId: "<your spotify client id>",
            clientSecret: "<your spotify client secret>",
        },
    },
}
```

## 🎵 Resolvers

Currently, this server supports Spotify resolver only. but we are planning to add more resolvers in the future.

### Supported Resolvers

| Service       | Support? |
| ------------- | :------: |
| Spotify       |    ✅    |
| YouTube Music |    ❌    |
| Apple Music   |    ❌    |
| Deezer        |    ❌    |
