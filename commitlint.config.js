/**
 *
 * 示例：
 * git commit -m "feat: 新增合约盛夏功能"
 *
 * 格式：
 * <type>: <subject>   英文冒号后面一定要有一个空格
 * type: 必选，本次提交的代码类型。
 * subject: 必选，对本次提交简短的描述。
 *
 * 跳过检测：
 * git commit --no-verify -m "代码规范强制提交测试"
 */

/**
 * type类型如下：
 *
 * feat：新功能
 * fix： 修补某功能的bug
 * update：更新某功能
 * refactor：代码重构
 * optimize: 优化构建工具或运行时性能
 * style：仅样式改动
 * docs：仅文档新增/改动
 * chore：构建过程或辅助工具的变动
 * test: 单元测试
 * revert: 恢复变更/回滚到上一个版本
 * try: 尝试
 */

module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2, // 表示必须输入的
      "always",
      ["feat", "update", "fix", "refactor", "optimize", "style", "docs", "chore", "test", "revert", "try"],
    ],
    "type-case": [0],
    "type-empty": [0],
    "scope-empty": [0],
    "scope-case": [0],
    "subject-full-stop": [0, "never"],
    "subject-case": [0, "never"],
    "header-max-length": [0, "always", 72],
  },
};
