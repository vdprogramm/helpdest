import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  connectChatSocket,
} from '../socket/chat.socket';

export type AgentPresence =
  'ONLINE' | 'OFFLINE';

export default function useAgentPresence() {
  const [statuses, setStatuses] =
    useState<Record<string, AgentPresence>>({});

  const setAgentStatus = useCallback(
    (
      agentId: string,
      status: AgentPresence,
    ) => {
      setStatuses((current) => ({
        ...current,
        [agentId]: status,
      }));
    },
    [],
  );

  useEffect(() => {
    const socket = connectChatSocket();

    const handleStatus = (data: {
      agentId: string;
      status: AgentPresence;
    }) => {
      setAgentStatus(
        data.agentId,
        data.status,
      );
    };

    socket.on(
      'agent:status',
      handleStatus,
    );

    return () => {
      socket.off(
        'agent:status',
        handleStatus,
      );
    };
  }, [setAgentStatus]);

  return {
    statuses,
    setAgentStatus,
  };
}
