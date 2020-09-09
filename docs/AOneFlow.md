# A One Flow

![A One Flow](./aOneFlow.png 'A One Flow')

分支的名规范： sys[子系统的名称]/版本号/[develop, release] 范例：

        sysRider/v_1_4/develop 开发分支，用于开发环境
        sysRider/v_1_4/release 提测后的测试分支，用于测试环境

        sysOrder/v_1_5/develop 开发分支，用于开发环境
        sysOrder/v_1_5/release 提测后的测试分支，用于测试环境

tag 的命名规范：

格式：[工程名]_v_[主版本号].[特征版本号]\_[修订版本号]

范例：v_1.2.0_0

说明：

工程名：vos

主版本号：1.2。

特征版本号: 它是一个增量数值，从 0 开始，发布一个子系统模块就递增一次。

修订版本号: 它是一个增量数值，每一个特征版本号更新就从 0 开始，然后当每一个 hotFix 的发布就累加一次。

**注意：每打一次 tag，其他的子系统模块分支都必须同步一次 master 的最新代码**
