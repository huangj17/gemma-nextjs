/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // react严格模式
  transpilePackages: [
    "rc-util",
    "antd",
    "@ant-design",
    "rc-pagination",
    "rc-picker",
  ],

  // sassOptions: { quietDeps: true },

  // 打包输出为静态
  // output: "export",
  // distDir: "dist",

  // async rewrites() {
  //   return [
  //     {
  //       source: "/modelApi/:path*", // 匹配所有 /modelApi/* 的请求
  //       destination: "http://localhost:11434/:path*", // 将请求转发到实际的接口地址
  //     },
  //   ];
  // },

  // 开发模式接口重定向(代理)
  // async rewrites() {
  //   return {
  //     fallback: [
  //       {
  //         source: "/modelApi/:path*",
  //         destination: "http://localhost:11434/:path*",
  //       },
  //       // {
  //       //   source: "/:modelApi*",
  //       //   destination: "http://localhost:11434/:api*",
  //       // },
  //       // {
  //       //   source: "/modelApi/:path*",
  //       //   destination: "http://localhost:11434/:path*",
  //       // },
  //     ],
  //   };
  // },
};

export default nextConfig;
