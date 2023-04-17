# Cockpit IPTV

#### package ppa to ubuntu
```
npm run build
debuild -S  | tee /tmp/debuild.log 2>&
dput ppa:snowlyg/cockpit-iptv-ppa \"$(perl -ne 'print $1 if /dpkg-genchanges --build=source >(.*)/' /tmp/debuild.log)\"
```

# NOTICE 发布之后收不到邮件问题

此时会显示剩余的上传过程：
```
$ dput -f -u  ppa:hedzr/test-ppa ../testpackage_0.0.0.1_source.changes
Uploading to ppa (via ftp to ppa.launchpad.net):
  Uploading testpackage_0.0.0.1.dsc: done.
  Uploading testpackage_0.0.0.1.tar.xz: done.
  Uploading testpackage_0.0.0.1_source.buildinfo: done.
  Uploading testpackage_0.0.0.1_source.changes: done.
Successfully uploaded packages.
```
不过，这并不是真的。因为此时 dput 工作在 dry-run 模式。

解决问题
解决的办法是编辑你的 GPG Key，删除所有 subkeys 仅保留主 key：

```
$ gpg --edit-key 569616226@qq.com
key 2
delkey
key 1
delkey
save
```