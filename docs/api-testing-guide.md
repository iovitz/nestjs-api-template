# 接口测试流程和规范

## 概述

本项目使用 [httpyac](https://httpyac.github.io/) 进行接口测试，通过 `.http` 文件声明和调用接口。接口文件位于项目根目录的 [`api-test.http`](api-test.http) 中。

## 测试命令

使用 `pnpm yac` 运行调试接口时必须指定接口名称

```bash
# 指定接口名称运行接口
pnpm yac -n <api-name>

# 示例
pnpm yac -n book.create
pnpm yac -n user.login.success
```

## 接口声明规范

### 1. 基本结构

每个接口测试用例以 `###` 开头，后跟接口名称：

```http
### api-name
# 接口描述（可选）
POST {{prefix}}/endpoint
Content-Type: application/json

{
  "field": "value"
}
```

### 2. 全局配置

文件开头定义全局变量和默认头信息：

```http
@prefix = http://localhost:9872/api
{{
  exports.defaultHeaders = {
    'Content-Type': 'application/json'
  };
}}
```

### 3. 变量使用

支持多种变量类型：

- **环境变量**：`{{prefix}}`
- **随机变量**：`{{$random.alphabetic(10)}}`
- **自定义变量**：`@name = value`

示例：

```http
@name = {{$random.alphabetic(10)}}
POST {{prefix}}/user/register
Content-Type: application/json

{
  "name": "{{name}}",
  "email": "{{name}}@gmail.com"
}
```

## 接口调用规范

### 1. 命名规范

接口名称采用 `模块.操作.状态` 的格式：

- `book.create` - 创建书籍
- `book.get.paging` - 分页获取书籍
- `user.register.success` - 用户注册成功场景
- `user.login.success` - 用户登录成功场景

### 2. HTTP方法

- **GET**：查询操作，参数放在 URL 查询字符串中
- **POST**：创建/修改操作，参数放在请求体中
- **PUT**：更新操作
- **DELETE**：删除操作

### 3. 参数传递

#### GET 请求

```http
### book.get.paging
GET {{prefix}}/book?limit=3&offset=3
```

#### POST 请求

```http
### book.create
POST {{prefix}}/book/create
Content-Type: application/json

{
  "name": "书籍名称"
}
```

## 测试流程

### 1. 启动服务

确保开发服务器已启动：

```bash
pnpm dev
```

服务默认运行在 `http://localhost:9872`

### 2. 编写测试用例

在 [`api-test.http`](api-test.http) 中添加新的测试用例，遵循上述规范。

### 3. 运行测试

使用命名方式运行特定测试：

```bash
pnpm yac -n api-name
```

### 4. 查看结果

httpyac 会显示：

- 请求详情（URL、方法、头信息、参数）
- 响应状态码
- 响应头信息
- 响应体内容（JSON 格式化）

## 最佳实践

### 1. 测试场景分离

为不同的测试场景创建独立的测试用例：

- 成功场景：`user.login.success`
- 失败场景：`user.login.failure`
- 边界条件：`user.register.invalid-email`

### 2. 数据准备

使用随机变量避免数据冲突：

```http
@randomEmail = {{$random.alphabetic(10)}}@test.com
@randomName = {{$random.alphabetic(8)}}
```

### 3. 依赖关系

按依赖顺序执行测试：

1. 用户注册 → 用户登录 → 获取用户信息
2. 创建资源 → 查询资源 → 更新资源 → 删除资源

### 4. 错误处理

测试异常场景：

- 参数验证失败
- 认证失败
- 资源不存在
- 权限不足
