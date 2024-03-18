/** 上传至向量数据库 **/
import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import path from "path";
import fs from "fs";
import { ResponseData, responseCallback } from "./milvus";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const uploadFilePath = "public/doc";
export const filePath = path.join(process.cwd(), uploadFilePath);
export const accept_text = [".txt"];
export const accept_doc = [".docx"];
export const accept_xls = [".csv"];
export const accept_pdf = [".pdf"];
export const accept_ppt = [".pptx"];
export const accept_json = [".json"];
export const accept = [
  // ".jpg",
  // ".jpeg",
  // ".mp4",
  // ".png",
  // ".svg",
  ...accept_text,
  ...accept_doc,
  ...accept_xls,
  ...accept_pdf,
  ...accept_ppt,
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  switch (req.method) {
    case "GET":
      break;
    case "POST":
      // console.log("filePath", filePath);
      const formOptions: formidable.Options = {
        uploadDir: filePath, // 设置文件上传目录
        keepExtensions: true, // 保留文件扩展名
      };
      const form = formidable(formOptions);
      form.parse(req, async (err, fields, files) => {
        const fileArr = files?.file || [];
        for (let i = 0; i < fileArr.length; i++) {
          const file = fileArr[i];
          const newFilename = file.originalFilename;
          const suffix = path.extname(newFilename!);
          // console.log(suffix, accept.includes(suffix));
          if (!accept.includes(suffix)) {
            responseCallback(res, {
              code: 500,
              message: `文件上传失败：不支持的文件格式 '${suffix}'`,
            });
            return;
          }
        }
        if (err) {
          responseCallback(res, {
            code: 500,
            message: `文件上传失败：${err}`,
          });
          return;
        }
        let targetPath = "";
        files.file?.forEach((file) => {
          const newFilename = file.originalFilename; // 设置新的文件名
          targetPath = path.join(formOptions.uploadDir!, newFilename!);
          fs.renameSync(file.filepath, targetPath);
        });
        responseCallback(res, { result: targetPath, message: "文件上传成功" });
      });
      break;

    default:
      responseCallback(res, { code: 404 });
      break;
  }
}
