# Security Policy

## 漏洞报告

请勿公开提交安全漏洞。

建议通过以下方式联系维护者：

- Security Email
- Private Security Report

## 安全设计

### 身份认证

- 微信登录
- 云函数权限校验
- 用户身份验证

### 数据安全

- CloudBase 数据库
- 云存储权限控制

### AI 服务

- 服务端调用 AI 接口
- 避免客户端暴露密钥

## 建议

定期更新依赖：

```bash
npm audit
npm update
```
