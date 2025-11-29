<template>
  <div>
    <!-- 顶部导航栏 -->
    <van-nav-bar title="QNG节点监控" />

    <!-- 内容区域 -->
    <div class="container">
      <!-- 节点列表 -->
      <van-cell
        v-for="node in nodesArray"
        :key="node.id"
        class="node-cell"
      >
        <!-- 左侧标题 -->
        <template #title>
          <div class="node-title">
            <span>{{ node.id }}</span>
          </div>
        </template>

        <!-- 右侧值 -->
        <template #value>
          <div class="node-value">
            <div class="node-field">
              <span class="label">Order:</span> {{ node.stateroot?.Order ?? 'N/A' }}
            </div>
            <div class="node-field">
              <span class="label">EVMHeight:</span> {{ node.stateroot?.EVMHeight ?? 'N/A' }}
            </div>
            <div class="node-field">
              <!-- <span class="label">Timestamp:</span> {{ node.timestamp ?? 'N/A' }} -->
              <span class="label">Timestamp:</span> {{ formatTime(node.timestamp) }}
            </div>
            <div class="node-field">
              <span class="label">Hash:</span> {{ node.stateroot?.Hash ?? 'N/A' }}
            </div>
            <div class="node-field">
              <span class="label">EVMStateRoot:</span> {{ node.stateroot?.EVMStateRoot ?? 'N/A' }}
            </div>
            <div class="node-field">
              <span class="label">StateRoot:</span> {{ node.stateroot?.StateRoot ?? 'N/A' }}
            </div>
          </div>
        </template>
      </van-cell>

      <!-- 刷新按钮 -->
      <van-button type="primary" block class="refresh-btn" @click="refresh">
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
    nodesArray() {
      if (!this.nodes || typeof this.nodes !== 'object') return [];
      return Object.entries(this.nodes)
        .filter(([id, value]) => value && value.stateroot)
        .map(([id, value]) => {
          console.log(id, value); // 打印每个节点对象
          return {
            id,
            ...value,
            timestamp: value.timestamp || value.stateroot?.timestamp || 'N/A'
          }
        })
    }
  },
  async created() {
    this.refresh()
  },
  methods: {
    async refresh() {
      try {
        const res = await getStatus()
        if (res.data.success && res.data.nodes) {
          this.nodes = res.data.nodes
        } else {
          this.nodes = {}
        }
      } catch (err) {
        console.error('Axios request failed:', err)
        this.nodes = {}
      }
    },
    formatTime(isoTime) {
      if (!isoTime) return 'N/A';
      const date = new Date(isoTime);
      const Y = date.getFullYear();
      const M = String(date.getMonth() + 1).padStart(2, '0');
      const D = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      const s = String(date.getSeconds()).padStart(2, '0');
      return `${Y}-${M}-${D} ${h}:${m}:${s}`;
    }
  }
}
</script>

<style scoped>
.container {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.node-cell {
  display: flex;
  flex-direction: column;
}

.node-title {
  font-size: 0.9rem;
  font-weight: bold;
  color: #ff4d4f;
  word-break: break-word;
}

.node-value {
  display: flex;
  flex-wrap: wrap; /* 手机端换行 */
  gap: 0.5rem 1rem;
  margin-top: 0.3rem;
  justify-content: flex-start; /* 左对齐整个区域 */
  align-items: flex-start;      /* 保证纵向左顶对齐 */
  text-align: left;             /* 对内部文字生效 */
}

.node-field {
  flex: 1 1 45%; /* 最大占比 45%，自适应 */
  font-size: 0.85rem;
  word-break: break-word;
  text-align: left; /* 内部文字左对齐 */
}

.label {
  color: #1890ff;
  font-weight: 500;
  margin-right: 0.25rem;
}

.refresh-btn {
  margin-top: 1rem;
}
</style>
