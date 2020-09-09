# 运营管理平台项目结构

---

## 0. 概要

整个系统从内容上来理解分为几个**内容级别**：

-   **项目级**：整个运营管理平台是一个大系统，由多个子系统组成
-   **应用级**：每个子系统都是一个应用，由多个页面组成
-   **页面级**：每个子系统的页面，由多个组件组成
-   **组件级**：组件，组织代码
-   **代码级**：基础代码

这几个级别之间的关系：从顶到底，除了**跨系统级**之外，是一种涵盖关系。 **跨系统级**是一种被依赖的关系，可以理解为第三方组件库。

## 1. 主依赖：第三方组件库

[ant-design](https://ant.design/index-cn) [ant-design-pro](https://pro.ant.design/docs/getting-started-cn)

## 2. 微微自己的组件/工具库

-   [ ] vv-frontend-components // 平台支撑的私库，逐步完善中

-   [ ] 应用于多个项目的通用组件库系统 vv-design(暂定这个名字) // 逐步完善和

## 3. 运营管理平台目录结构

    .
    |-- config/                              // 配置文件夹
    |   |-- config.ts
    |
    |-- src/                                 // 源码文件夹
    |   |-- assets/
    |   |-- components/                      // 应用级通用组件
    |   |-- e2e/                             // 端到端测试文件夹
    |   |-- layouts/                         // 应用级通用组件 - 布局
    |   |   |-- BasicLayout.tsx
    |   |   |-- BlankLayout.tsx
    |   |   |-- SecurityLayout.tsx
    |   |   |-- UserLayout.tsx
    |   |
    |   |-- pages/
    |   |   |./sysName                       // 子系统模块
    |   |   |-- components/                  // 页面级别的通用组件
    |   |   |   |-- locales/                 // 页面级别的通用国际化
    |   |   |   |-- utils/                   // 页面级别的通用函数工具
    |   |   |   |
    |   |   |   |-- pageA/                   // 子系统的页面
    |   |   |   |   |-- components/          // 组件级的通用组件
    |   |   |   |   |   |-- ComponentNameA
    |   |   |   |   |   |   |-- index.tsx
    |   |   |   |   |   |   |-- index.less
    |   |   |   |   |
    |   |   |   |   |-- locales/             // 组件级的国际化
    |   |   |   |   |-- utils/               // 组件级的通用函数工具
    |   |   |   |   |-- index.tsx            // 页面主入口
    |   |   |   |   |-- model.ts             // 页面的数据模型层
    |   |   |   |   |-- data.d.ts            // 页面的ts类定义
    |   |   |   |   |-- service.ts           // 页面级的api sdk集
    |   |   |   |   |-- style.less           // 页面的样式
    |   |   |   |   |-- _mock.ts             // 页面的mock数据
    |   |   |   |
    |   |   |   |-- pageB/
    |   |   |   |   |-- ...
    |   |   |   |
    |   |   |   |-- pageC/
    |   |   |   |   |-- ...
    |   |
    |   |-- services/
    |
    |-- tests/                               // 单元测试文件夹(采用jest)
    |-- mock/                                // 模拟数据
    |-- dist/ or build/                      // 存放打包结果的文件夹
    |
    |-- .editorconfig                        // 编辑器统一格式配置文件
    |-- .eslintignore                        // eslint忽略文件的配置文件
    |-- .eslintrc.js                         // JS代码风格配置文件
    |-- .gitignore                           // Git忽略文件的配置文件
    |-- .prettierignore                      // prettier忽略文件的配置文件
    |-- .prettierrc.js                       // 代码美化规则配置文件
    |-- .stylelintrc.js                      // 样式代码风格配置文件
    |
    |-- jsconfig.json                        // javascript配置文件
    |-- tsconfig.json                        // TypeScript编译配置文件
    |-- package.json                         // 软件包相关信息的配置文件
    |
    |-- README.md                            // 文档说明
    |-- docs                                 // 详细的文档说明

## 4. 基础规范

### 4.1 风格统一

1. JS 和 JSX 采用 Airbnb 创建的 eslint-config-airbnb 规范，在此基础上定制符合团队的开发规范 [Airbnb Github](https://github.com/airbnb/javascript)
2. 代码规范自动化
    - 可以通过运行`yarn prettier`命令进行代码格式化处理
    - 在运行`git commit`之前，将进行代码审查，不符合规范将无法提交，可根据提示处理规范化
    - 配置 vscode 插件的自动校验和修正功能，参照：4.6 统一插件工具和配置

### 4.2 命名规范

#### 4.2.1 驼峰命名法

**小驼峰命名**：smallCamelCase

**大驼峰命名**：BigCamelCase

#### 4.2.2 javascript 命名规范

1. js 的变量、函数，采用**小驼峰命名**
2. js 的常量必须采用**全大写**，单词间用\_分割：`const CONST_NAME = 'value'`
3. 组件目录，采用**大驼峰命名**
4. 组件目录的名称必须与组件名对应
5. 组件文件，采用**大驼峰命名**
6. 组件文件的名称必须与组件名对应
7. 类文件，采用**大驼峰命名**
8. 类文件的名称必须与类名对用
9. 其他 js 文件采用**小驼峰命名**
10. 只要文件中有采用**jsx 语法**的必须采用**jsx/tsx 文件类型**
11. 非 jsx 语法的采用**js/ts 文件类型**

#### 4.2.3 typescript 命名规范

1. 准寻 4.2.2 javascript 命名规范
2. 定义接口，采用**大驼峰命名**

#### 4.2.4 CSS 的命名规范

1. 为了配合 js 中引入 css module，所有的 css 选择器的命名都采用**小驼峰命名**
2. 样式文件的命名，采用**小驼峰命名**

#### 4.2.5 子系统的命名规则

子系统的命名格式：sys + 大驼峰式的系统名称如：订单中心，命名为：`sysOrderCenter`

#### 4.2.6 页面命名规则

页面的命名根据实际的页面功能命名，采用**小驼峰命名**

比如：订单中心的列表页，命名及目录为：`sysOrderCenter/list/index.tsx`

#### 4.2.7 其他文件命名

其他文件，包含：图片、html 文件，json 文件、字体文件、md 文件(除 README.md 外)等，它们的命名都采用**小驼峰命名**方式。

#### 4.2.5 语义化

类、组件、函数、变量、常量，采用**语义化**的命名，可以根据实际功能和场景，同时附上相关**备注信息**，比如

#### 4.2.6. 备注>

**单行**，采用 `//` 进行备注，如：

    // 这是单行备注

**多行**，采用 `/** */` 进行备注，如：

    /**
     * 这个是多行备注
     */

**函数**的备注，如：

    /**
     * 函数相关描述
     *
     * @param { 权限判定 | Permission judgment } authority
     * @param { 你的权限 | Your permission description } currentAuthority
     * @param { 通过的组件 | Passing components } target
     * @param { 未通过的组件 | no pass components } Exception
     *
     * @return { 返回值 }
     */
    function fnName(authority, currentAuthority, target, Exception) {
        // ...
    }

> **强调**：在代码中**多添加备注**，辅助记录逻辑和语义，**便于**其他成员**理解**，备注可以写中文，**代码必须是全英文**，虽然可能代码已经语义化了，但是由于不同人对于英文单词的理解可能会有歧义，推荐在代码中**多加备注**

### 4.3 gitFlow 规范

1. **创建 develop 分支** git branch develop git push -u origin develop
2. **开始新 Feature 开发** git checkout -b some-feature develop

    // 分支不一定需要被推送至远端 git push -u origin some-feature

    // 做一些改动 git status git add some-file git commit

3. **完成 Feature** git pull origin develop git checkout develop git merge --no-ff some-feature git push origin develop

    git branch -d some-feature

    // # 如果需要推送至远端 git push origin --delete some-feature

4. **开始 Release** git checkout -b release-0.1.0 develop
5. **完成 Release** git checkout master git merge --no-ff release-0.1.0 git push

    git checkout develop git merge --no-ff release-0.1.0 git push

    git branch -d release-0.1.0

    // # If you pushed branch to origin: git push origin --delete release-0.1.0

    git tag -a v0.1.0 master git push --tags

6. **始 Hotfix** git checkout -b hotfix-0.1.1 master
7. **完成 Hotfix** git checkout master git merge --no-ff hotfix-0.1.1 git push

    git checkout develop git merge --no-ff hotfix-0.1.1 git push

    git branch -d hotfix-0.1.1

    git tag -a v0.1.1 master git push --tags

[更多详情见-gitFlow.md](./gitFlow.md)

### 4.4 feature 分支命名规范

格式：feature/{version}/{username}/{issue*id}*{description}

{version}：代表版本号，格式为 vx_x_x（x 为数字），比如 v6_5_0

{issue_id}：代表 JIRA 的 Issue ID，如 PT-7

{username}：代表开发者。username 统一使用各个 developer 的公司邮箱账号，比如 John、Tom 等。

{description}：代表分支功能描述。应该尽量用简短的词组描述，不能使用中文，多个单词用下划线分割，比如 remove_thread。

### 4.5 gitCommit 规范

采用 Angular 团队的规范

![Git提交信息规范](./gitCommitMessage.png 'Git提交信息规范')

统一采用`yarn commit`替代`git commit`，根据提示完善提交信息

具体的 message 类型：

-   **feat**: A new feature
-   **fix**: A bug fix
-   **improvement**: An improvement to a current feature
-   **docs**: Documentation only changes
-   **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
-   **refactor**: A code change that neither fixes a bug nor adds a feature
-   **perf**: A code change that improves performance
-   **test**: Adding missing tests or correcting existing tests
-   **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
-   **ci**: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
-   **chore**: Other changes that don't modify src or test files
-   **revert**: Reverts a previous commit

### 4.6 统一插件工具和配置

1. EditorConfig
2. Prettier
3. Eslint
4. StyleLint
5. GitFlow
6. Git History
7. Markdown Preview Enhanced
8. Code Spell Checker

## 4.7 通用组件/方法的提升过程

根据**0. 概要**中的系统的**内容级别**，遵循一条原则：由底至顶的提升通用组件。

系统的**内容级别**，通用组件可以分为：

-------- 顶 --------

-   **项目级**：应用于多个系统的通用组件/方法，可以理解为 antd
-   **应用级**：应用于多个页面的通用组件/方法
-   **页面级**：应用于多个组件的通用组件/方法
-   **组件和代码级**：基础代码

-------- 底 --------

<!-- 假如我们在开发**订单中心**这个子系统，**订单中心**就是一个子系统，它属于**应用级**内容，然后，它又包含了一些页面，这些页面就属于**页面级**内容，每个页面中又有自己的组件，这些组件就属于**组件级**内容，这些组件和实际代码(**代码级**内容)一起组成了一个页面，多个页面组成了一个子系统。 -->

然后具体的提升通用组件/方法的步骤如下：

1. pages/sysName/pageA/index.tsx，在这个页面中可能有需要拆解的组件，那么将会被拆解到 sysName/pageA/components/中
2. pages/sysName/pageA/components/，在这个组件目录中如果有需要其他页面需要公用
3. pages/sysName/components/
4. /components/

---

[返回 README](../README.md)
