# [Next Output File Tracing](https://nextjs.org/blog/next-12#output-file-tracing) DEMO

> [原文](https://nextjs.org/blog/next-12#output-file-tracing)
>
> 在 Next.js 8 中，我们引入了 target 配置项。这使得我们可以在构建过程中使用 webpack 打包所有的依赖项，作为独立的 JavaScript 文件输出（不需要 node_modules）。我们很快意识到这并不理想，于是创建了@vercel/nft。@vercel/nft 已经在 Vercel 平台的所有部署中使用了2年多。
>
> 现在，我们将这些改进直接带入 Next.js 框架，默认启用，与 target 配置项相比，提供了一个明显改进的方法。
>
> Next.js 12 使用 @vercel/nft 自动追踪每个页面和 API 路由需要哪些文件，并将这些追踪结果输出到文件旁边。
>
> 这些变化也优化了，使用 Docker 部署 nextjs 应用。通过 @vercel/nft，我们将能够在使 Next.js 的输出独立化。运行应用程序将不需要安装任何依赖性，大量减少 Docker 镜像的大小。
>
> 将 @vercel/nft 引入 Next.js，取代了 target 配置项，使 target 在 Next.js 12 中被废弃。请 [查看文档](https://nextjs.org/docs/advanced-features/output-file-tracing) (下文) 以了解更多信息。
>



> [原文](https://nextjs.org/docs/advanced-features/output-file-tracing) 
>
> **输出文件追踪**
> 在构建过程中，Next.js 将自动跟踪每个页面及其依赖关系，以确定部署生产版本的应用程序所需的所有文件。
>
> 这项功能有助于大幅减少部署的规模。以前，在用 Docker 部署时，你需要安装好软件包依赖的所有文件才能运行下一次启动。从 Next.js 12 开始，你可以利用 .next/ 目录中的输出文件跟踪，只包括必要的文件。
>
> 此外，这还消除了对已废弃的 target: serverless  的需要，因为它可能会导致各种问题，也会造成不必要的重复。
>
> **它是如何工作的**
> 在接下来的构建过程中，Next.js 将使用 @vercel/nft 来静态分析 import、require 和 fs 的使用，以确定页面可能加载的所有文件。
>
> Next.js 的生产服务器也会追踪其需要的文件，并在.next/next-server.js.nft.json中输出，可在生产中加以利用。
>
> 要利用发送到 .next 输出目录的 .nft.json 文件，你可以读取每个跟踪中相对于 .nft.json 文件的文件列表，然后将它们复制到你的部署位置。
>
> **注意事项**
> 在某些情况下，Next.js 可能无法包含所需的文件，或者可能错误地包含未使用的文件。在这些情况下，你可以分别导出 page configs props `unstable_includeFiles` 和 `unstable_excludeFiles`。每个 prop 都接受一个相对于项目根部的 globs 数组，以便在跟踪中包含或排除。
>
> 目前，Next.js 不对发出的 .nft.json 文件做任何处理。这些文件必须由你的部署平台读取，例如 Vercel，以创建一个最小的部署。在未来的版本中，我们计划使用一个新的命令来利用这些 .nft.json 文件。

正如上面所说 `Next.js 不对发出的 .nft.json 文件做任何处理` 本项目主要是做了最小化的 demo 来演示这个特性应该如何使用



## 流程

因为使用了 nodejs esmodule 的一些特性，使用 nodejs 14+ 开发才不会有兼容问题

#### 编译

- next build
  - 在这个过程中会通过 @vercel/nft 生成 **.nft.json 文件
- script/docker.mjs
  - 读取所有的  **.nft.json 文件
  - 将其中记录的 files 文件复制到 `<root>/tmp` 下
  - 替换 `config-utils.js` 文件，因为该文件需要依赖 webpack 而我们并不需要

#### 运行

- script/server.mjs
  - 因为 nextjs 默认 [只留下了 next/dist/server/next-server 这一层](https://github.com/vercel/next.js/blob/95607130a080b2488e9ae12b0b88304506559c0c/packages/next/build/index.ts#L1207) 
  - 需要我们读取配置和启动 http 服务器
- Dockerfile
  - 本地 docker build
- Dockerfile.github
  - github action 使用的
  - 并且 .dockerignore 在 github action 会被覆盖

#### Github Action

- npm cache
- next build cache
- docker hub push

## 缺点

- 需要替换文件
  - 因为直接[复用了 nextjs 的读取配置](https://github.com/vercel/next.js/blob/95607130a0/packages/next/server/config.ts#L532)相应的代码其依赖的 webpack 需要对文件进行替换
- next/image 不能用
  - 因为把 [图像处理相关的代码](https://github.com/vercel/next.js/blob/95607130a080b2488e9ae12b0b88304506559c0c/packages/next/build/index.ts#L1213)给忽略了，所以不能用
