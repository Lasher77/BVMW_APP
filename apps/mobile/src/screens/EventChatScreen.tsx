import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useChatMessages, useSendMessage } from '../hooks/useChat';
import type { EventsStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import { currentMemberId } from '../config/member';

export const EventChatScreen: FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<EventsStackParamList>>();
  const route = useRoute<RouteProp<EventsStackParamList, 'EventChat'>>();
  const { eventId, partnerId, partnerName } = route.params;
  const [message, setMessage] = useState('');
  const { data, isLoading, refetch, isRefetching } = useChatMessages(
    eventId,
    currentMemberId,
    partnerId,
  );
  const sendMessage = useSendMessage();

  useEffect(() => {
    if (partnerName) {
      navigation.setOptions({ title: partnerName });
    }
  }, [navigation, partnerName]);

  const handleSend = () => {
    const content = message.trim();
    if (!content || sendMessage.isPending) return;
    sendMessage.mutate(
      { eventId, senderId: currentMemberId, recipientId: partnerId, content },
      {
        onSuccess: () => {
          setMessage('');
          void refetch();
        },
      },
    );
  };

  const messages = useMemo(() => data?.messages ?? [], [data?.messages]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const isOwn = item.senderId === currentMemberId;
              return (
                <View style={[styles.bubbleWrapper, isOwn && styles.bubbleWrapperOwn]}>
                  <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
                    <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
                      {item.content}
                    </Text>
                    <Text style={[styles.timestamp, isOwn && styles.timestampOwn]}>
                      {new Date(item.createdAt).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>Starte das Gespräch mit einer Nachricht.</Text>
            }
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        )}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Nachricht schreiben"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!message.trim() || sendMessage.isPending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!message.trim() || sendMessage.isPending}
            accessibilityRole="button"
          >
            <Text style={styles.sendLabel}>Senden</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  bubbleWrapper: {
    alignItems: 'flex-start',
  },
  bubbleWrapperOwn: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: 16,
    gap: spacing.xs,
  },
  bubbleOwn: {
    backgroundColor: colors.primary,
  },
  bubbleOther: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: typography.body,
    color: colors.text,
  },
  messageTextOwn: {
    color: colors.background,
  },
  timestamp: {
    fontSize: typography.caption,
    color: colors.muted,
    textAlign: 'right',
  },
  timestampOwn: {
    color: colors.background,
    opacity: 0.85,
  },
  composer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
    fontSize: typography.body,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendLabel: {
    color: colors.background,
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: spacing.lg,
  },
});
