/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import Layout from "../layout";
import ChatComponents from "@/pages/components/Chat";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { Spin } from "antd";
import { RunnableSequence } from "langchain/schema/runnable";
import { request } from "@/utils/request";
import { Document } from "@langchain/core/documents";

export async function getServerSideProps() {
  console.log("页面初始化");
  return { props: {} };
}

interface Props extends API.PageProps {
  docs: string;
}

const ChatDocument = (props: Props) => {
  const documentChain = useRef<RunnableSequence>();
  const [messageVal, setMessageVal] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  const onPressEnter = async (e: any) => {
    const { value } = e.target;
    if (value && !loading) {
      setLoading(true);
      const newChatHistory = [
        ...chatHistory,
        new HumanMessage({
          name: "human",
          content: value,
        }),
      ];
      setChatHistory(newChatHistory);
      setTimeout(() => {
        setMessageVal(undefined);
      }, 0);

      const { current } = documentChain;
      if (current) {
        request({
          url: "/milvus",
          data: { collectionName: "file_pdf,file_docx", text: value },
        })
          .then(async (res) => {
            const { answer } = res;
            console.log("res", answer);

            const chat_history = [...newChatHistory].splice(
              1,
              newChatHistory.length
            );
            console.log("current", current);
            const stream = await current.stream({
              chat_history,
              input: value,
              context: answer.map((item: any) => new Document({ ...item })),
            });
            console.log("stream", stream);

            let localStore = [];
            if (stream) {
              let text = "";
              for await (const chunk of stream) {
                // console.log("返回：", chunk);
                if (chunk) {
                  text += chunk;
                  const newData = [
                    ...newChatHistory,
                    new AIMessage({ name: "ai", content: text }),
                  ];
                  localStore = newData;
                  setChatHistory(newData);
                }
              }
              console.log("完成返回", localStore);
              localStorage.setItem(
                "localChatDocumentHistory",
                JSON.stringify(localStore)
              );
            }
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
      }
    }
  };

  const onChangeInput = (e: any) => {
    const { value } = e.target;
    setMessageVal(value);
  };

  useEffect(() => {
    const localHostMsg: any[] = JSON.parse(
      localStorage.getItem("localChatDocumentHistory") || "[]"
    );
    const newList = localHostMsg.map(({ kwargs }) => {
      const par = { name: kwargs.name, content: kwargs.content };
      return kwargs.name === "ai" ? new AIMessage(par) : new HumanMessage(par);
    });
    setChatHistory(newList);
    const init = async () => {
      // 模型角色定义
      const RESPONSE_SYSTEM_TEMPLATE = `您是一位经验丰富的研究人员，是根据所提供的资料解释和回答问题的专家，并且使用中文对话。 使用所提供的上下文，利用所提供的资源，尽最大努力回答用户的问题。
      仅根据提供的搜索结果（URL 和内容）生成给定问题的简明答案。 您只能使用所提供的搜索结果中的信息。 使用公正的新闻语气。 将搜索结果组合在一起形成一个连贯的答案。 不要重复文本。
      以下 \`context\` html 块之间的任何内容都是从知识库中检索的，而不是与用户对话的一部分。
      <context>
          {context}
      <context/>`;

      // 回复模板
      const responseChainPrompt = ChatPromptTemplate.fromMessages([
        ["system", RESPONSE_SYSTEM_TEMPLATE],
        new MessagesPlaceholder("chat_history"),
        ["user", `{input}`],
      ]);

      const documentChain2 = await createStuffDocumentsChain({
        llm: props.chatModel,
        prompt: responseChainPrompt,
      });

      documentChain.current = documentChain2;
    };
    init();
  }, []);

  return (
    <Layout>
      <Spin
        spinning={documentLoading}
        tip="知识库加载中..."
        style={{ height: "100%" }}
      >
        <ChatComponents
          chatHistory={chatHistory}
          chatHistoryKey="localChatDocumentHistory"
          messageVal={messageVal}
          loading={loading}
          onPressEnter={onPressEnter}
          onChangeInput={onChangeInput}
        />
      </Spin>
    </Layout>
  );
};

export default ChatDocument;
