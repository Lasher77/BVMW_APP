import { useMutation, useQuery } from '@tanstack/react-query';
import { getEventAttendees, getEventMessages, sendEventMessage } from '../api/client';

export function useEventAttendees(eventId: string) {
  return useQuery({
    queryKey: ['attendees', eventId],
    queryFn: () => getEventAttendees(eventId),
    enabled: Boolean(eventId),
  });
}

export function useChatMessages(eventId: string, memberA: string, memberB: string) {
  return useQuery({
    queryKey: ['chat', eventId, memberA, memberB],
    queryFn: () => getEventMessages(eventId, memberA, memberB),
    enabled: Boolean(eventId && memberA && memberB),
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  return useMutation({
    mutationFn: (params: { eventId: string; senderId: string; recipientId: string; content: string }) =>
      sendEventMessage(params.eventId, {
        senderId: params.senderId,
        recipientId: params.recipientId,
        content: params.content,
      }),
  });
}
