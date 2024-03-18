/* eslint-disable react-hooks/rules-of-hooks */
import { MessageOutlined } from "@ant-design/icons";
import React from "react";
import styles from "./index.module.scss";
import { Menu } from "antd";
import { useRouter } from "next/router";

const items: any[] = [
  { key: "1", label: "知识文件", href: "/document" },
  { key: "2", label: "知识图库问答", href: "/chatDocument" },
  { key: "3", label: "聊天", href: "/" },
];

const layout = ({ children }: any) => {
  const router = useRouter();
  // console.log("router", router);
  const { asPath } = router;
  const activeKey = items.find((v) => v.href === asPath)?.key;

  const onClickMenu = ({ key }: any) => {
    const item = items.find((v) => v.key === key);
    console.log(item);
    if (item?.href) {
      router.push(item.href);
    }
  };

  return (
    <div className={styles.homeMain}>
      <div className={styles.leftContent}>
        {/* <div className={styles.list}>知识库问答</div>
      <div className={styles.list}>聊天</div> */}
        <div className={styles.chatLabel}>
          <MessageOutlined />
          <span className={styles.label}>新聊天</span>
        </div>
        <Menu
          onClick={onClickMenu}
          // style={{ width: 256 }}
          defaultSelectedKeys={[activeKey]}
          // defaultOpenKeys={['sub1']}
          mode="inline"
          items={items}
        />
      </div>
      <div className={styles.rightContent}>{children}</div>
    </div>
  );
};

export default layout;
