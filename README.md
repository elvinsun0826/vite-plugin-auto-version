# vite-plugin-auto-version

#### 介绍

在 vite 打包过程中自动生成项目版本，版本号每次以 0.0.1 递增，同时默认添加版本检测代码到 index.html 中，默认每 5 分钟请求 version 信息，如果 version 更新了就通过 alert 通知客户端刷新

插件会检索并存储在 outDir 配置的 (默认是 dist) 目录下的打包产物的文件名，然后根据新打包后的产物名称与旧名称对比是否一致，如果不一致则更新版本号

本插件是 vite 专属插件，使用了 Vite 特有的插件钩子，使用时需注意

#### 软件架构

node + pnpm + typescript

#### 安装教程

pnpm add -D vite-plugin-auto-version

#### 使用说明

在 vite.config.js/.ts 文件中引入插件，并在 plugins 中添加`AutoVersion()`

参数可不填，默认为`{ version: '1.0.0', insertCheck: true, refreshTime: 5 * 60 * 1000 }`

- version 指定一个版本号
- insertCheck 是否自动插入定时检测版本的代码
- refreshTime 定时刷新的时间

其中的 version 参数如果填写，则将不会自动生成新的版本号，且无视打包产物新旧是否有差异，都会使用你指定的版本号更新版本文件

尽量不要指定此参数，如果你忘记修改，那么每次打包后版本号将不会改变

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

执行打包命令：pnpm build 或 npm build

打包成功后，会在 publicDir (默认 public) 配置的目录 和 outDir 配置的 (默认是 dist) 目录中生成 version.json 文件

( 以上的 publicDir 和 outDir 都是 vite 中的配置，不是本插件的配置)

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request
