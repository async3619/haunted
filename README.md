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
    <br />
    <sup>Music metadata retrieving server for <a href="https://github.com/async3619/cruise">Cruise</a></sup>
    <br />
    <br />
</div>

## 📖 About

Haunted is music metadata retrieving server. this server retrieves metadata from several sources and serves it to client.

This server is mainly used for [Cruise](https://github.com/async3619/cruise). but you can use it for everything you want.

## 🚀 Getting Started

### 📦 Using Docker

```bash
docker run -d -p 3000:3000 async3619/haunted
```

### 📦 Using Docker Compose

```yaml
version: "3.7"

services:
    haunted:
        image: async3619/haunted
        ports:
            - "3000:3000"
        volumes:
            - ./config.json:/home/node/config.json:ro
```

## 🛠️ Configuration

This server uses `config.json` file from current working directory. we provide the configuration schema in 
`config.schema.json` file. you can use this file to validate your configuration file in your IDE.

```json5
{
    "cacheTTL": 3600, // cache TTL in seconds
    "resolvers": {
        // whatever resolvers you want to use
        "spotify": {
            "clientId": "<your spotify client id>",
            "clientSecret": "<your spotify client secret>"
        },
    }
}
```
## 🎵 Resolvers

Currently, this server supports Spotify resolver only. but we are planning to add more resolvers in the future.

### Supported Resolvers

| Service       | Support? |
|---------------|:--------:|
| Spotify       |    ✅     |
| YouTube Music |    ❌     |
| Apple Music   |    ❌     |
| Deezer        |    ❌     |
