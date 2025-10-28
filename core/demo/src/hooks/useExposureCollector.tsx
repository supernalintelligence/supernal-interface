/**
 * React Hook for ExposureCollector (REQ-004)
 * 
 * Provides easy access to tool exposure state in React components.
 */

import { useEffect, useState, useCallback } from 'react';
import { 
  ExposureCollector, 
  ExposureState, 
  ExposureStateChange,
  ToolState 
} from '@supernal-interface/core';

/**
 * Hook to access the ExposureCollector singleton
 */
export function useExposureCollector() {
  return ExposureCollector.getInstance();
}

/**
 * Hook to register a tool and track its exposure state
 * 
 * @param toolId - Unique tool identifier
 * @param elementRef - React ref to the DOM element
 * @param metadata - Optional metadata for the tool
 * 
 * @example
 * const buttonRef = useRef<HTMLButtonElement>(null);
 * const toolState = useToolExposure('save-button', buttonRef, { context: 'settings' });
 * 
 * console.log(toolState.state); // ExposureState.INTERACTABLE
 */
export function useToolExposure(
  toolId: string,
  elementRef: React.RefObject<Element>,
  metadata?: Record<string, any>
) {
  const collector = useExposureCollector();
  const [toolState, setToolState] = useState<ToolState | undefined>(
    collector.getToolState(toolId)
  );

  useEffect(() => {
    // Register tool when element is available
    if (elementRef.current) {
      collector.registerTool(toolId, elementRef.current, metadata);
      setToolState(collector.getToolState(toolId));
    }

    // Subscribe to state changes for this tool
    const unsubscribe = collector.subscribe((change: ExposureStateChange) => {
      setToolState(collector.getToolState(toolId));
    }, toolId);

    // Cleanup on unmount
    return () => {
      unsubscribe();
      collector.unregisterTool(toolId);
    };
  }, [toolId, elementRef, metadata, collector]);

  return toolState;
}

/**
 * Hook to wait for a tool to reach a specific state
 * 
 * @param toolId - Unique tool identifier
 * @param targetState - State to wait for (default: INTERACTABLE)
 * @param timeoutMs - Timeout in milliseconds (default: 5000)
 * 
 * @example
 * const { ready, waiting } = useWaitForTool('save-button', ExposureState.INTERACTABLE);
 * 
 * if (waiting) return <Spinner />;
 * if (!ready) return <Error message="Tool not available" />;
 * 
 * return <button onClick={handleClick}>Save</button>;
 */
export function useWaitForTool(
  toolId: string,
  targetState: ExposureState = ExposureState.INTERACTABLE,
  timeoutMs: number = 5000
) {
  const collector = useExposureCollector();
  const [ready, setReady] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let mounted = true;

    const checkState = async () => {
      try {
        const isReady = await collector.waitForState(toolId, targetState, timeoutMs);
        
        if (mounted) {
          setReady(isReady);
          setWaiting(false);
          
          if (!isReady) {
            const state = collector.getToolState(toolId);
            setError(
              `Tool "${toolId}" did not reach state ${ExposureState[targetState]}. ` +
              `Current state: ${state ? ExposureState[state.state] : 'NOT_REGISTERED'}`
            );
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : String(err));
          setWaiting(false);
        }
      }
    };

    checkState();

    return () => {
      mounted = false;
    };
  }, [toolId, targetState, timeoutMs, collector]);

  return { ready, waiting, error };
}

/**
 * Hook to observe tool state changes (for debugging/logging)
 * 
 * @param callback - Called when any tool state changes
 * @param toolId - Optional: only observe specific tool
 * 
 * @example
 * useToolStateObserver((change) => {
 *   console.log(`Tool ${change.toolId}: ${change.oldState} → ${change.newState}`);
 * });
 */
export function useToolStateObserver(
  callback: (change: ExposureStateChange) => void,
  toolId?: string
) {
  const collector = useExposureCollector();

  useEffect(() => {
    const unsubscribe = collector.subscribe(callback, toolId);
    return unsubscribe;
  }, [callback, toolId, collector]);
}

/**
 * Hook to get all registered tools (for debugging/admin UI)
 * 
 * @example
 * const allTools = useAllTools();
 * 
 * return (
 *   <ul>
 *     {allTools.map(tool => (
 *       <li key={tool.toolId}>
 *         {tool.toolId}: {ExposureState[tool.state]}
 *       </li>
 *     ))}
 *   </ul>
 * );
 */
export function useAllTools() {
  const collector = useExposureCollector();
  const [tools, setTools] = useState<ToolState[]>(collector.getAllTools());

  useEffect(() => {
    // Update on any state change
    const unsubscribe = collector.subscribe(() => {
      setTools(collector.getAllTools());
    });

    return unsubscribe;
  }, [collector]);

  return tools;
}

