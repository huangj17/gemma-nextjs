import Head from "next/head";
import { useEffect } from "react";
import type { AppProps } from "next/app";
import { ConfigProvider } from "antd";
import { rem } from "@/utils/rem";
import zhCN from "antd/locale/zh_CN";
// import "@/styles/globals.css";
import "antd/dist/reset.css";
import "@/styles/globals.scss";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import Script from "next/script";
import { modelName, modelUrl } from "@/utils/global";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { pull } from "langchain/hub";
import { ExaSearchResults } from "@langchain/exa";
import Exa from "exa-js";

const chatModel = new ChatOllama({
  baseUrl: modelUrl, // Default value
  model: modelName,
  // temperature: 0, // temperature 的值越高，生成文本的多样性就越大；而 temperature 的值越低，生成文本的多样性就越小，更趋于确定性。
});
const prompt2 = ChatPromptTemplate.fromMessages([
  new MessagesPlaceholder("chat_history"),
  ["system", "我将帮助用户解决各种各样的问题。"],
  ["user", "{input}"],
]);
let chain = prompt2.pipe(chatModel);
// chatModel.invoke("what is LangSmith?").then((res) => {
//   console.log(res);
// });

// const chatModel = "";
// const chain = "";
console.log("gemma 初始化");

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    console.log("app 初始化");
    rem();
  }, []);
  return (
    <>
      <Head>
        <title>AI知识图库</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Script src="/iconfont/iconfont.js" />
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            // colorPrimary: '#00b96b',
            // borderRadius: 3,
          },
        }}
      >
        <Component {...pageProps} chatModel={chatModel} chain={chain} />
      </ConfigProvider>
    </>
  );
}
