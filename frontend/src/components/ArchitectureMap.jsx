import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Handle, 
  Position 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Users, Network, Server, Zap, ListOrdered, Database } from 'lucide-react';

// Custom User Node
const UserNode = ({ data }) => (
  <div className="custom-node node-users">
    <Users size={16} className="custom-node-icon" />
    <span className="custom-node-label">{data.label}</span>
    <Handle type="source" position={Position.Right} id="a" style={{ background: '#3b82f6' }} />
  </div>
);

// Custom Load Balancer Node
const LBNode = ({ data }) => (
  <div className="custom-node node-loadBalancer">
    <Network size={16} className="custom-node-icon" style={{ color: '#06b6d4' }} />
    <span className="custom-node-label">{data.label}</span>
    <Handle type="target" position={Position.Left} id="a" style={{ background: '#06b6d4' }} />
    <Handle type="source" position={Position.Right} id="b" style={{ background: '#06b6d4' }} />
  </div>
);

// Custom API Node
const APINode = ({ data }) => (
  <div className="custom-node node-api">
    <Server size={16} className="custom-node-icon" style={{ color: '#6366f1' }} />
    <span className="custom-node-label">{data.label}</span>
    <Handle type="target" position={Position.Left} id="a" style={{ background: '#6366f1' }} />
    <Handle type="source" position={Position.Right} id="b" style={{ background: '#6366f1' }} />
  </div>
);

// Custom Cache Node
const CacheNode = ({ data }) => (
  <div className="custom-node node-cache">
    <Zap size={16} className="custom-node-icon" style={{ color: '#ec4899' }} />
    <span className="custom-node-label">{data.label}</span>
    <Handle type="target" position={Position.Left} id="a" style={{ background: '#ec4899' }} />
    <Handle type="source" position={Position.Right} id="b" style={{ background: '#ec4899' }} />
  </div>
);

// Custom Queue Node
const QueueNode = ({ data }) => (
  <div className="custom-node node-queue">
    <ListOrdered size={16} className="custom-node-icon" style={{ color: '#a855f7' }} />
    <span className="custom-node-label">{data.label}</span>
    <Handle type="target" position={Position.Left} id="a" style={{ background: '#a855f7' }} />
    <Handle type="source" position={Position.Right} id="b" style={{ background: '#a855f7' }} />
  </div>
);

// Custom Database Node
const DBNode = ({ data }) => (
  <div className="custom-node node-database">
    <Database size={16} className="custom-node-icon" style={{ color: '#10b981' }} />
    <span className="custom-node-label">{data.label}</span>
    <Handle type="target" position={Position.Left} id="a" style={{ background: '#10b981' }} />
  </div>
);

const nodeTypes = {
  users: UserNode,
  loadBalancer: LBNode,
  api: APINode,
  cache: CacheNode,
  queue: QueueNode,
  database: DBNode
};

export default function ArchitectureMap({ topology }) {
  const { nodes: rawNodes = [], edges: rawEdges = [] } = topology || {};

  // Deterministically layout nodes into columns (layers) to look super neat
  const flowData = useMemo(() => {
    // Determine level columns
    const columns = {
      users: 50,
      loadBalancer: 200,
      api: 400,
      cache: 600,
      queue: 600,
      database: 820
    };

    // Keep track of vertical positions to space out duplicates
    const counts = {};

    const formattedNodes = rawNodes.map((n) => {
      const type = n.type || 'api';
      const colX = columns[type] || 400;
      
      // Calculate Y spacing
      if (!counts[type]) counts[type] = 0;
      counts[type]++;

      // Set standard vertical offsets depending on how many nodes are in that level
      let y = 160; // Default center
      
      const idx = counts[type] - 1;
      if (type === 'api') {
        // Space API instances vertically
        y = 80 + idx * 120;
      } else if (type === 'database') {
        // Space DB Primary and Replicas vertically
        y = 50 + idx * 100;
      } else if (type === 'cache') {
        y = 50;
      } else if (type === 'queue') {
        y = 260;
      } else if (type === 'users') {
        y = 150;
      } else if (type === 'loadBalancer') {
        y = 150;
      }

      return {
        id: n.id,
        type: type,
        data: { label: n.label },
        position: { x: colX, y: y },
        style: { width: 'auto' }
      };
    });

    const formattedEdges = rawEdges.map((e, index) => {
      return {
        id: `e-${e.from}-${e.to}-${index}`,
        source: e.from,
        target: e.to,
        label: e.label || '',
        animated: true,
        style: { stroke: '#4f46e5', strokeWidth: 2 },
        labelStyle: { fill: '#94a3b8', fontSize: 10, fontFamily: 'Space Grotesk', fontWeight: 500 },
        labelBgPadding: [4, 2],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: '#0d0c18', fillOpacity: 0.85, stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }
      };
    });

    return { nodes: formattedNodes, edges: formattedEdges };
  }, [rawNodes, rawEdges]);

  // If topology data is completely empty
  if (rawNodes.length === 0) {
    return (
      <div className="flow-wrapper" style={{ display: 'flex', alignItems: 'center', justify: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No topology data available.</p>
      </div>
    );
  }

  return (
    <div className="flow-wrapper">
      <ReactFlow
        nodes={flowData.nodes}
        edges={flowData.edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="#1f1c3a" gap={16} size={1} />
        <Controls showInteractive={false} style={{ background: '#141226', border: '1px solid var(--surface-border)', color: '#fff' }} />
      </ReactFlow>
    </div>
  );
}
