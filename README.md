# Cockpit IPTV

#### package ppa to ubuntu
```
npm run build
debuild -S  | tee /tmp/debuild.log 2>&
dput ppa:snowlyg/cockpit-iptv-ppa \"$(perl -ne 'print $1 if /dpkg-genchanges --build=source >(.*)/' /tmp/debuild.log)\"
```

