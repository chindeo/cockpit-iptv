#### 开发使用框架
- [Material-UI](https://mui.com/zh/getting-started/usage)
- [cockpit](https://github.com/cockpit-project/cockpit)

##### 在 fedroa 上添加 pppoe 连接
```sh
nmcli  connection  show #指令觀察連線
nmcli  connection  edit  type  pppoe  con-name  "hinet" #使用 nmcli 指令建立一個 pppoe 連線, 名稱爲 hinet, 並進入設定
set  pppoe.username  25677291@ip.hinet.net
set  pppoe.password  12345678
save
quit

# 安装  NetworkManager-ppp
dnf install NetworkManager-ppp

# 启动
nmcli connection up chindeo
```