declare namespace API {
  type PageProps = {
    chatModel: BaseChatModel<ChatOllamaCallOptions>;
    chain: Runnable;
  };
}
