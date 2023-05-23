# vite-plugin-auto-version

#### Description

The project version is automatically generated during the vite packaging process, with the version number increasing by 0.0.1 each time, and the version detection code is added to index.html by default. The version information is requested every 5 minutes by default, and the client is notified to refresh by alert if the version is updated

#### Software Architecture

node + pnpm + typescript

#### Installation

pnpm add -D vite-plugin-auto-version

#### Instructions

Import the plug-in into the vite.config.js/.ts file and add `AutoVersion()` to plugins

The default parameter is`{insertCheck: true, refreshTime: 5 _ 60 _ 1000}`

- version (Specify a version number)
- insertCheck (Whether to automatically insert a timed detection version of the code)
- refreshTime (Set the refresh time)

If version is specified, no new version number will be generated automatically, and the version file will be updated with the version number you specify, regardless of whether there is a difference between the old and the new package

Try not to specify this parameter. If you forget to change it, the version number will not change after each packaging

```javascript
// vite.config.js
import AutoVersion from "vite-plugin-auto-version";

export default defineConfig({
  plugins: [
    vue(),
    AutoVersion({ insertCheck: true, refreshTime: 10 * 60 * 1000 }),
  ],
});
```

Run the package command: pnpm build or npm build

After successful packaging, the version.json file is generated in the publicDir (default public) configured directory and the outDir (default dist) configured directory

(The above publicDir and outDir are vite configurations, not for this plug-in)

#### Contribution

1.  Fork the repository
2.  Create Feat_xxx branch
3.  Commit your code
4.  Create Pull Request
