node v16
npm i --legacy-peer-deps 安装依赖
【安装前】请先修改.npmrc 内的源为自己搭建的 nexus 地址，参见 web-components 项目 README.md

运行使用 npm run dev/qa 等，对应的接口逻辑转发在 next.config.js 的 rewrites 里

CHANGELOG.md 中记录每次同步更新内容，格式：

[YYYYMMDD_index]
1.new feat xxx
2.modify xxx
3.update xxx

保存所有历史更新说明，依时间顺序倒序放置
标题对应 commit log
