<template>
  <div>
    <!-- 顶部导航栏 -->
    <van-nav-bar title="QNG节点监控" />

    <!-- 内容区域 -->
    <div style="padding: 15px;">
      <!-- 节点列表 -->
      <van-cell
        v-for="node in nodesArray"
        :key="node.id"
        :title-style="{ flex: '0 0 10%',  }"
        :value-style="{ flex: '0 0 90%',  textAlign: 'right' }"
      >
        左侧标题
        <template #title>
          <div style="padding: 0; display: flex; flex-direction: column; word-break: break-all;">
            <span style="font-size: 12px; color: #ff4d4f; font-weight: bold;">{{ node.id }}</span>
            <!-- <span style="font-size: 12px; color: #888;">IP: {{ node.host }}</span> -->
          </div>
        </template>

        <!-- 右侧值 -->
        <template #value>
          <div 
            style="
              padding: 0;
              display: flex; 
              flex-direction: column; 
              text-align: left; 
              word-break: break-all; /* 超长文字换行 */
              padding-left: 80px; /* 避免紧贴左侧 */
            "
          >
            <span style="font-size: 12px;">
              <span style="color: #1890ff;">Hash:</span> {{ node.stateroot?.Hash ?? 'N/A' }}
            </span>
            <span style="font-size: 12px;">
              <span style="color: #1890ff;">Order:</span> {{ node.stateroot?.Order ?? 'N/A' }}
            </span>
            <span style="font-size: 12px;">
              <span style="color: #1890ff;">Height:</span> {{ node.stateroot?.Height ?? 'N/A' }}
            </span>
            <span style="font-size: 12px;">
              <span style="color: #1890ff;">EVMHeight:</span> {{ node.stateroot?.EVMHeight ?? 'N/A' }}
            </span>
            <span style="font-size: 12px;">
              <span style="color: #1890ff;">EVMStateRoot:</span> {{ node.stateroot?.EVMStateRoot ?? 'N/A' }}
            </span>
            <span style="font-size: 12px;">
              <span style="color: #1890ff;">StateRoot:</span> {{ node.stateroot?.StateRoot ?? 'N/A' }}
            </span>
          </div>
        </template>
      </van-cell>

      <!-- 刷新按钮 -->
      <van-button
        type="primary"
        block
        style="margin-top: 20px;"
        @click="refresh"
      >
        刷新
      </van-button>
    </div>
  </div>
</template>

<script>
import { getStatus } from '../api'

export default {
  data() {
    return {
      nodes: {} // 存储解析后的节点对象
    }
  },
  computed: {
    // 将对象转换为数组方便 v-for 遍历
    nodesArray() {
      if (!this.nodes || typeof this.nodes !== 'object') return [];
      return Object.entries(this.nodes)
        .filter(([id, value]) => value && value.stateroot) // 过滤掉无效节点
        .map(([id, value]) => ({
          id,
          ...value
        }))
    }
  },
  async created() {
    this.refresh()
  },
  methods: {
    async refresh() {
      try {
        const res = await getStatus()
        console.log('API response:', res.data)
        if (res.data.success && res.data.nodes) {
          // 解析 output 字符串为对象
          try {
            this.nodes = res.data.nodes
          } catch (e) {
            console.error('Failed to parse output JSON:', e, res.data.nodes)
            this.nodes = {}
          }
          console.log('Parsed nodes:', this.nodes)
        } else {
          console.warn('API returned error or empty nodes:', res.data.error)
          this.nodes = {}
        }
      } catch (err) {
        console.error('Axios request failed:', err)
        this.nodes = {}
      }
    }
  }
}
</script>
