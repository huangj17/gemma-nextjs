/** 集合‘documents’的向量数据操作 **/
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Milvus } from "@langchain/community/vectorstores/milvus";
import { ClientConfig } from "@zilliz/milvus2-sdk-node";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  accept_doc,
  accept_json,
  accept_pdf,
  accept_ppt,
  accept_text,
  accept_xls,
} from "./uploadMilvus";
import path from "path";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { PPTXLoader } from "langchain/document_loaders/fs/pptx";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { embeddingsName } from "@/utils/global";

export type ResponseData = {
  result?: any;
  message?: string;
  code?: number;
};

const embeddings = new OllamaEmbeddings({
  model: embeddingsName,
});

// 创建 Milvus 客户端配置
const clientConfig: ClientConfig = {
  address: "localhost:19530",
  token: "root:Milvus",
  ssl: false,
};
// 默认集合名字 (逻辑有问题)
const collectionName = "file_docx";
// 所有知识库文件集合(待实现)
// const collectionNameArr = [
//   "file_text",
//   "file_csv",
//   "file_docx",
//   "file_pdf",
//   "file_ppt",
//   "file_json",
// ];

// 通用返回
export const responseCallback = (
  res: NextApiResponse,
  data: ResponseData,
  statusCode = 200
) => {
  const messageContent: any = { 404: "请求不存在" };
  res.status(statusCode).json({
    code: 200,
    message: data?.code ? messageContent[data.code] : "success",
    result: null,
    ...data,
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // 查询 documents集合 的 向量数据
  if (req.method === "GET") {
    const { query } = req;
    console.log("query", query);
    let response: any[] = [];
    const newCollectionName = ((query?.collectionName as string) || "").split(
      ","
    );
    console.log("newCollectionName", newCollectionName);
    for (let i = 0; i < newCollectionName.length; i++) {
      const colName = newCollectionName[i];
      const vectorStore = await Milvus.fromExistingCollection(embeddings, {
        collectionName: colName,
        clientConfig: clientConfig,
      });
      const response2 = await vectorStore.similaritySearch(
        query?.text as string,
        2
      );
      // console.log("response2", response2);
      response = response.concat(response2);
    }

    console.log("response", JSON.stringify(response));

    responseCallback(res, {
      result: {
        question: query?.text || "",
        answer: response,
      },
    });
  }
  // 添加 documents集合向量数据
  else if (req.method === "POST") {
    const { filePath } = req.body;
    if (!filePath) {
      responseCallback(res, { code: 400, result: "filePath 不能为空" });
      return;
    }
    // res.status(200).json({ result: "文档加载成功" });
    // 加载本地文件
    let docs;
    let fileSuffix2 = "";
    try {
      let loader;
      const fileName = (filePath as string).split("/").pop();
      const fileSuffix = path.extname(fileName!).toLocaleLowerCase();
      fileSuffix2 = fileName!.split(".").pop()!.toLocaleLowerCase();
      console.log("fileName", fileName, fileSuffix);
      if (accept_text.includes(fileSuffix)) {
        loader = new TextLoader(filePath);
      } else if (accept_doc.includes(fileSuffix)) {
        loader = new DocxLoader(filePath);
      } else if (accept_xls.includes(fileSuffix)) {
        loader = new CSVLoader(filePath);
      } else if (accept_pdf.includes(fileSuffix)) {
        loader = new PDFLoader(filePath);
      } else if (accept_ppt.includes(fileSuffix)) {
        loader = new PPTXLoader(filePath);
      } else if (accept_json.includes(fileSuffix)) {
        loader = new JSONLoader(filePath);
      }
      if (loader) {
        docs = await loader.load();
      }
    } catch (error) {
      console.log("error", error);
      responseCallback(res, { code: 500, result: error });
    }
    // responseCallback(res, { result: "文档加载成功" });
    if (docs) {
      // console.log(docs[0].pageContent);
      // console.log("docs.length", docs.length);
      // 文档切割 分词
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 700, // 最大块长度不超过700个字符
        chunkOverlap: 50, // 块之间有 50 个字符的重叠
      });
      const splitDocs = await splitter.splitDocuments(docs);
      // 将文档转换为向量存储，并指定数据库配置
      const vectorStore = await Milvus.fromDocuments(splitDocs, embeddings, {
        collectionName: `file_${fileSuffix2}`,
        clientConfig: clientConfig,
      });
      responseCallback(res, { result: "文档加载成功" });
    } else {
      responseCallback(res, { code: 500, result: "文档加载失败" });
    }
  }
  // 删除向量数据
  else if (req.method === "DELETE") {
    const { fileName } = req.query;
    if (!fileName) {
      res.status(200).json({ code: 400, result: "fileName 不能为空" });
      return;
    }

    const milvusClient = new Milvus(embeddings, {
      url: clientConfig.address,
      ssl: clientConfig.ssl,
      collectionName,
    });
    await milvusClient.delete({
      filter: `source in ['${fileName}'] `,
    });
    res.status(200).json({ result: "向量数据删除成功" });
  } else {
    res.status(404).json({ result: "404 method is not found" });
  }
}
