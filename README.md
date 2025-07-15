# Better One Tab 2024

forked from [cnwangjie/better-onetab](https://github.com/cnwangjie/better-onetab) 

## Prerequisites

* nodejs 20.11.0

## Motivation

* add api to simple self-hosted sync server to store tabs and share them between devices
* learn rust by implementing the server
* learn vue and vuetify

## Todo

[x] upgrade to vuetify 2 latest sub version
[ ] upgrade to vuetify 3 latest

## Statement

**for all unmentioned wonder-how-and-why, please refer to the original repo**

## Migration

due to the chrome new versions deprecated some apis that the extension used, will try upgrade to `manifest v3`

- [x] upgrade `manifest.json` to v3
- [ ] replace `windows` with self
- [ ] replace communication via `getBackgroundPage` property to `chrome.runtime.sendMessage` and `chrome.runtime.onMessage.addListener`
- [x] update background js to worker
