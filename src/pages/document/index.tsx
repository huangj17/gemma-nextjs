import React, { useEffect } from "react";
import Layout from "../layout";
import {
  Button,
  Empty,
  Modal,
  Upload,
  UploadProps,
  message,
  notification,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudDownloadOutlined,
  DeleteOutlined,
  InboxOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { request } from "@/utils/request";
import { useSetState } from "ahooks";
import styles from "./index.module.scss";

const { Dragger } = Upload;
const { confirm } = Modal;

const accept = [".txt", ".docx", ".csv", ".pdf", ".pptx", ".json"];

const Document = () => {
  const [api, contextHolder] = notification.useNotification();

  const [state, setState] = useSetState({
    openModal: false,
    fileList: [] as any[],
  });

  const getFileList = () => {
    request({
      url: "/chatDocument",
    }).then((res) => {
      setState({ fileList: res });
    });
  };

  useEffect(() => {
    // console.log(123);
    getFileList();
  }, []);

  const onClickUpload = () => {
    setState({
      openModal: true,
    });
  };

  const onCancelModal = () => {
    setState({
      openModal: false,
    });
  };

  const onClickDeleteFile = (fileName: string) => {
    confirm({
      title: "温馨提示",
      content: "确定要删除该文件吗？",
      onOk() {
        // 删除本地知识库文件
        request({
          url: "/chatDocument",
          method: "DELETE",
          data: { fileName },
        }).then(() => {
          // 删除向量数据
          request({
            url: "/milvus",
            method: "DELETE",
            data: { fileName },
          }).then(() => {
            message.success("删除成功");
            getFileList();
          });
        });
      },
    });
  };

  const uploadProps: UploadProps = {
    name: "file",
    multiple: true,
    showUploadList: false,
    accept: accept.join(","),
    customRequest: async (options) => {
      const file: any = options.file;
      const suffix = file.name.substring(file.name.lastIndexOf("."));
      // console.log(file.name, suffix);
      if (!accept.includes(suffix)) {
        message.error(`文件格式不支持：${suffix}`);
        return;
      }
      const formData = new FormData();
      formData.append("file", options.file);

      // 文件上传到知识库
      request({
        url: "/uploadMilvus",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then((filePath) => {
        console.log("filePath", filePath);
        const msgKey = "uploadMilvusMsg";
        api.open({
          key: msgKey,
          message: "知识库消息提示",
          description: "文件上传成功，导入向量数据中，请稍后...",
          duration: 0,
          icon: <LoadingOutlined style={{ color: "#1890ff" }} />,
        });
        getFileList();
        onCancelModal();
        // message.success("上传成功");

        // 上传向量数据
        request({
          url: "/milvus",
          method: "POST",
          data: {
            filePath, // "/Users/xxx/Documents/code/gemma-nextjs/public/doc/xxx.docx"
          },
        })
          .then(() => {
            api.open({
              key: msgKey,
              message: "知识库消息提示",
              description: "向量数据导入成功",
              icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
            });
          })
          .catch(() => {
            api.open({
              key: msgKey,
              message: "知识库消息提示",
              description: "向量数据导入失败，请重试",
              icon: <CloseCircleOutlined style={{ color: "#f5222d" }} />,
            });
          });
      });
    },
  };

  const { openModal, fileList } = state;
  return (
    <Layout>
      {contextHolder}
      <div className={styles.buttonMain}>
        <Button type="primary" onClick={onClickUpload}>
          上传文件
        </Button>
      </div>

      <div className={styles.fileListMain}>
        <ul className={styles.fileListBox}>
          {fileList.map((item) => (
            <li key={item.id} className={styles.fileItem}>
              <div className={styles.iconBox}>
                <svg className={`icon ${styles.icon}`} aria-hidden="true">
                  <use xlinkHref="#icon-css"></use>
                </svg>
                <div className={styles.iconMask}>
                  <span>
                    <a href={`./doc/${item.name}`} target="_blank">
                      <CloudDownloadOutlined />
                    </a>
                  </span>
                  <span onClick={() => onClickDeleteFile(item.name)}>
                    <DeleteOutlined />
                  </span>
                </div>
              </div>
              <p>{item.name}</p>
            </li>
          ))}
        </ul>
        {fileList.length <= 0 && <Empty />}
      </div>

      <Modal
        open={openModal}
        title="上传文件到知识库"
        footer={null}
        onCancel={onCancelModal}
        maskClosable
      >
        <Dragger {...uploadProps}>
          <div>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">单击或拖动文件到此区域进行上传</p>
            <p className="ant-upload-hint">支持单个或批量上传</p>
            <p className="ant-upload-hint">支持格式：{accept.join(",")}</p>
          </div>
        </Dragger>
      </Modal>
    </Layout>
  );
};

export default Document;
