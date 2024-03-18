import { useEffect, useState } from "react";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
// import { Document } from "@langchain/core/documents";

import ChatComponents from "@/pages/components/Chat";
import Layout from "./layout";

const Index = (props: API.PageProps) => {
  const [messageVal, setMessageVal] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  const onChangeInput = (e: any) => {
    const { value } = e.target;
    setMessageVal(value);
  };

  const onPressEnter = async (e: any) => {
    const { value } = e.target;
    console.log(value);
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

      // return;

      console.log("newChatHistory", newChatHistory);
      const stream: any = await props?.chain.stream({
        chat_history: newChatHistory,
        input: value,
      });
      console.log("stream", stream);

      let localStore = [];
      if (stream) {
        let text = "";
        for await (const chunk of stream) {
          // console.log('返回：', chunk, chunk?.content);
          text += chunk?.content;
          const newData = [
            ...newChatHistory,
            new AIMessage({ name: "ai", content: text }),
          ];
          localStore = newData;
          setChatHistory(newData);
        }
        console.log("完成返回", localStore);
        localStorage.setItem("localChatHistory", JSON.stringify(localStore));
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const localHostMsg: any[] = JSON.parse(
      localStorage.getItem("localChatHistory") || "[]"
    );
    const newList = localHostMsg.map(({ kwargs }) => {
      const par = { name: kwargs.name, content: kwargs.content };
      return kwargs.name === "ai" ? new AIMessage(par) : new HumanMessage(par);
    });
    setChatHistory(newList);
  }, []);

  const newChatHistory: any[] = JSON.parse(JSON.stringify(chatHistory));
  return (
    <Layout>
      <ChatComponents
        chatHistory={newChatHistory}
        chatHistoryKey="localChatHistory"
        messageVal={messageVal}
        loading={loading}
        onPressEnter={onPressEnter}
        onChangeInput={onChangeInput}
      />
    </Layout>
  );
};

export default Index;
