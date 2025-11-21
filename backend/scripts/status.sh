#!/bin/bash

# 当前脚本目录（backend/scripts）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 项目根目录
ROOT_DIR="$(cd "$SCRIPT_DIR/../../" && pwd)"

# nodes.json 的绝对路径
nodes_file="$ROOT_DIR/nodes.json"

# Debug（stderr）
echo "[DEBUG] SCRIPT_DIR: $SCRIPT_DIR" >&2
echo "[DEBUG] ROOT_DIR: $ROOT_DIR" >&2
echo "[DEBUG] nodes_file: $nodes_file" >&2

# 检查 nodes.json 是否存在
if [ ! -f "$nodes_file" ]; then
  echo "{\"error\": \"nodes.json not found\"}"
  exit 1
fi

CLI="$SCRIPT_DIR/cli.sh"

# 读取节点列表
hosts=$(jq -c '.[]' "$nodes_file")

# JSON 结果
result="{"

first=true

for node in $hosts; do
  id=$(echo "$node" | jq -r '.id')
  host=$(echo "$node" | jq -r '.host')
  port=$(echo "$node" | jq -r '.port')
  user=$(echo "$node" | jq -r '.user')
  pass=$(echo "$node" | jq -r '.pass')

  # 获取 stateroot
  stateroot=$($CLI -h "$host" -p "$port" --user "$user" --password "$pass" stateroot 2>/dev/null)
  [ -z "$stateroot" ] && stateroot="{}"

  # 拼接 JSON
  if [ "$first" = true ]; then
    first=false
  else
    result="$result,"
  fi

  result="$result \"${id}\": {\"host\": \"${host}\", \"stateroot\": ${stateroot}}"
done

result="$result }"

# 最终只输出纯 JSON（stdout）
echo "$result"
