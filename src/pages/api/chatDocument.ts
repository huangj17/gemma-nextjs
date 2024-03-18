import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { filePath, uploadFilePath } from "./uploadMilvus";
import { responseCallback } from "./milvus";

type ResponseData = {
  result?: any;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "GET") {
    // const directoryPath = path.join(process.cwd(), "myFolder"); // 指定文件夹路径

    try {
      // 读取指定文件夹下的文件列表
      const files = fs.readdirSync(filePath);
      const filterFiles = files.filter((v) => !v.includes(".DS_Store"));
      const newFile = filterFiles.map((v, i) => {
        return {
          id: i + 1,
          name: v,
          path: filePath,
          suffix: path.extname(v),
        };
      });
      // console.log("files", newFile);

      // 返回文件列表
      responseCallback(res, { result: newFile });
    } catch (error) {
      console.error("查询文件失败：", error);
      responseCallback(res, { code: 500, message: "查询文件失败" });
    }
  } else if (req.method === "DELETE") {
    const { fileName } = req.query;
    if (!fileName) {
      responseCallback(res, { code: 400, message: "fileName 不能为空" });
      return;
    }
    const filePath2 = `${filePath}/${fileName}`;
    if (fs.existsSync(filePath2)) {
      fs.unlinkSync(filePath2);
      responseCallback(res, { result: "删除成功" });
    } else {
      responseCallback(res, { code: 500, message: "文件不存在" });
    }
  } else {
    responseCallback(res, { code: 404 });
  }
}
