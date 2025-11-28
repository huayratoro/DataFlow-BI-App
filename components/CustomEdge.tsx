import React from 'react';
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  EdgeProps, 
  getSmoothStepPath
} from '@xyflow/react';

export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
  data
}: EdgeProps) => {
  
  // Use color from data if available, otherwise fallback to existing style or default
  const edgeColor = (data?.color as string) || style.stroke || '#94a3b8';

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // If label is empty string or undefined, do not render the label box
  const hasLabel = label && typeof label === 'string' && label.trim().length > 0;

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth: 2
        }} 
      />
      {hasLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div
              className={`px-2 py-1 rounded shadow-sm text-xs bg-white border transition-colors ${
                selected ? 'ring-2 ring-offset-1' : ''
              }`}
              style={{ 
                borderColor: selected ? edgeColor : '#e2e8f0',
                color: edgeColor,
                boxShadow: selected ? `0 0 0 2px ${edgeColor}40` : '0 1px 2px 0 rgb(0 0 0 / 0.05)' 
              }}
            >
              {label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};