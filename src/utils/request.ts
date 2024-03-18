import { message } from "antd";
import axios, { type AxiosRequestConfig } from "axios";

interface AxiosProps extends AxiosRequestConfig {
  url: string;
  method?: "POST" | "GET" | "PUT" | "DELETE";
  data?: any;
  options?: any;
  baseURL?: string;
  addToken?: boolean;
}
export interface AxiosResultProps {
  success: boolean;
  message: string;
  code: number;
  result: any;
  timestamp: number;
}

export const codeMessage: any = {
  401: "登录失效，请重新登录",
  404: "请求不存在",
  500: "服务器发生错误，请检查服务器",
};

// 创建一个独立的axios实例
const service = axios.create({
  // timeout: (1000 * 60) * 10,
  // baseURL: '',
  // // 定义统一的请求头部
  // headers: {
  //   'x-auth-token': token,
  // },
});

export const baseURL1 = "/api";
export const baseURL2 = "";
export const baseURL = baseURL1 + baseURL2;

export const requestHeaders = () => {
  const token = localStorage.getItem("token");
  const headers: any = {};
  if (token) headers["X-Access-Token"] = token;
  return headers;
};

/**
 * 接口请求
 * @param param0
 * @returns
 */
const request = ({
  url,
  method = "GET",
  data,
  baseURL,
  addToken = true,
  ...options
}: AxiosProps): Promise<any> => {
  return new Promise<AxiosResultProps>((resolve, reject) => {
    const params: AxiosRequestConfig = {
      url,
      method,
      baseURL: baseURL || baseURL1 + baseURL2,
      ...options,
    };
    if (method === "POST") {
      params.data = data;
    } else {
      params.params = data;
    }
    // console.log('请求参数：', params);
    try {
      service(params)
        .then((res) => {
          // console.log('返回参数: ', res)
          const { status } = res;
          if (status === 200) {
            const { data } = res;
            if (data?.result || data.code === 200) {
              resolve(data.result);
            } else {
              reject(data);
              message.error(data.message);
            }
          } else {
            message.error(codeMessage[status]);
          }
        })
        .catch((error) => {
          if (error?.response) {
            const { status } = error.response;
            console.log("返回失败: ", status, error);
            message.error(codeMessage[status] || error.message);
            reject(error);
          } else {
            reject(error);
          }
        });
    } catch (error) {
      console.log("异常信息: ", error);
      reject(error);
    }
  });
};

export { request };
