# sanity-plugin-asset-source-bynder

> This is a **Sanity Studio v3** plugin.

## Installation

```sh
npm install sanity-plugin-asset-source-bynder
```

## Usage

Add it as a plugin in `sanity.config.ts` (or .js):

```ts
import {defineConfig} from 'sanity'
import {bynderImageAsset} from 'sanity-plugin-asset-source-bynder'

export default defineConfig({
  //...
  plugins: [
    bynderImageAsset({
      bynderDomain: 'https://<your-bynder-domain>',
      apiToken: '<your-api-token>',
      //optional parameters
      thumbnailTransformerName: 'DAT name',
      menuTitle: 'Bynder'
    })]
})
```

## License

[MIT](LICENSE) © Ivan Adutskevich

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.
