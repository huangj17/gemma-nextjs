import { ArrowUpOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import {
  ChangeEventHandler,
  KeyboardEventHandler,
  memo,
  useEffect,
} from "react";
import styles from "./index.module.scss";
import { marked } from "marked";

interface Props {
  chatHistory?: any[];
  chatHistoryKey?: string;
  onPressEnter?: KeyboardEventHandler<HTMLTextAreaElement>;
  onChangeInput?: ChangeEventHandler<HTMLTextAreaElement>;
  messageVal?: string;
  loading: boolean;
}

const Chat = (props: Props) => {
  const {
    chatHistory,
    chatHistoryKey,
    onPressEnter,
    onChangeInput,
    messageVal,
    loading,
  } = props;

  useEffect(() => {
    // 获取包含滚动条的 div 元素
    const divElement = document.getElementById("MessageContent")!;
    if (divElement.scrollHeight > 0) {
      divElement.scrollTop = divElement.scrollHeight;
    }
  }, [chatHistory]);

  const onPressEnter2 = (e: any) => {
    if (!loading) {
      onPressEnter && onPressEnter(e);
    }
  };

  const onClearMsg = () => {
    if (chatHistoryKey) {
      localStorage.removeItem(chatHistoryKey);
      window.location.reload();
    }
  };

  const newChatHistory: any[] = JSON.parse(JSON.stringify(chatHistory));
  return (
    <div>
      {newChatHistory.length > 0 && (
        <div className={styles.clearMain}>
          <Button type="primary" onClick={onClearMsg}>
            清空对话
          </Button>
        </div>
      )}
      <div
        className={styles.chatContentMain}
        style={{
          height: newChatHistory.length > 0 ? "calc(100vh - 53px)" : "100vh",
        }}
      >
        <div className={styles.messageList} id="MessageContent">
          {newChatHistory.map((item, index) => (
            <div
              className={`${styles.messageContent} ${
                item.kwargs.name === "human" ? styles.humanBox : ""
              }`}
              key={index}
            >
              <div className={styles.avatarBox}>
                {item.kwargs.name === "human" && (
                  <>
                    <span className={styles.avatar1}>Y</span>
                    <span className={styles.name}>你</span>
                  </>
                )}
                {item.kwargs.name === "ai" && (
                  <>
                    <span
                      className={styles.avatar2}
                      style={{ backgroundImage: `url(/images/google.png)` }}
                    />
                    <span className={styles.name}>Gemma</span>
                  </>
                )}
              </div>
              <div
                className={styles.content}
                dangerouslySetInnerHTML={{
                  __html: marked.parse(item?.kwargs.content),
                }}
              />
            </div>
          ))}
        </div>
        <div className={styles.msgInputMain}>
          <div className={styles.inputBox}>
            <Input.TextArea
              className={styles.input}
              placeholder="发送消息给 Gemma…"
              autoSize
              onPressEnter={onPressEnter2}
              onChange={onChangeInput}
              value={messageVal}
            />
            <Button
              className={styles.button}
              type="primary"
              icon={<ArrowUpOutlined />}
              disabled={!!!messageVal}
              loading={loading}
              onClick={() =>
                onPressEnter2 &&
                onPressEnter2({ target: { value: messageVal } } as any)
              }
            />
          </div>
          <p className={styles.desc}>Gemma可能会犯错误。请考虑核实重要信息。</p>
        </div>
      </div>
    </div>
  );
};

export default memo(Chat);
