#!/bin/bash
# --------------------------
# status.sh (优化版 v2)
# --------------------------

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../" && pwd)"
nodes_file="$ROOT_DIR/nodes.json"
CLI="$SCRIPT_DIR/cli.sh"

# 检查 nodes.json
[ ! -f "$nodes_file" ] && echo '{"error":"nodes.json not found"}' && exit 1

hosts=$(jq -c '.[]' "$nodes_file")

# 函数：处理单节点
fetch_node() {
  local node_json=$1
  local id host port user pass stateroot order prev_order block_info timestamp

  id=$(jq -r '.id' <<<"$node_json")
  host=$(jq -r '.host' <<<"$node_json")
  port=$(jq -r '.port' <<<"$node_json")
  user=$(jq -r '.user' <<<"$node_json")
  pass=$(jq -r '.pass' <<<"$node_json")

  stateroot=$($CLI -h "$host" -p "$port" --user "$user" --password "$pass" stateroot 2>/dev/null)
  [ -z "$stateroot" ] && stateroot="{}"

  order=$(jq -r '.Order' <<<"$stateroot")
  [ -z "$order" ] && order=0
  prev_order=$((order - 1))
  [ $prev_order -lt 0 ] && prev_order=0

  block_info=$($CLI -h "$host" -p "$port" --user "$user" --password "$pass" block "$prev_order" 2>/dev/null)
  timestamp=$(jq -r '.timestamp' <<<"$block_info")
  [ -z "$timestamp" ] && timestamp=0

  jq -n \
    --arg id "$id" \
    --arg host "$host" \
    --argjson stateroot "$stateroot" \
    --arg timestamp "$timestamp" \
    '{($id): {host: $host, stateroot: $stateroot, timestamp: $timestamp}}'
}

# --------------------------
# 并行处理所有节点
# --------------------------
# 用数组收集所有后台任务输出
outputs=()

for node in $hosts; do
  outputs+=("$(fetch_node "$node" &)")
done

# 等待所有后台任务完成
wait

# 合并输出
jq -s 'reduce .[] as $item ({}; . * $item)' <<<"${outputs[*]}"
