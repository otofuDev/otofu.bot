# otofu's Slack Bot

Slack Team Bot.

## Description

Slack専用BOTフレームワーク [shrike](https://github.com/hoto17296/shrike) を利用したSlack BOTです。

## Requirement

- node v7

## Usage

1. 必要なライブラリ群をインストール.

```console
$ npm install
```

2. .env ファイルに必要な情報を定義. (slack用トークンを発行しておく)

```console
$ vim .env
SLACK_TOKEN='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
```

3. redisを起動. (dockerを利用した例)

```console
$ docker run --rm -it --name redis -p 6379:6379 redis:alpine
```

4. BOTを起動.

```console
$  npm start
```
