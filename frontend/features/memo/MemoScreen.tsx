import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AppBottomNav, AppFloatingActionButton, AppTopBar } from '@/components/app-chrome';

import { useState } from 'react';
import { memos } from '@/features/memo/mock';


export default function MemoScreen() {
  const [searchText, setSearchText] = useState('');

  return (
    <View style={styles.screen}>
      <View style={styles.safeArea}>
        <AppTopBar title="메모" />

        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <View style={styles.searchSection}>
            <MaterialIcons name="search" size={19} color="rgba(161, 161, 170, 0.6)" style={styles.searchIcon} />
            <TextInput
            placeholder="검색"
            placeholderTextColor="rgba(161, 161, 170, 0.6)"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            />

          </View>

          <View style={styles.memoList}>
           {memos
           .filter(
            (memo) =>
              memo.title.toLowerCase().includes(searchText.toLowerCase()) ||
            memo.body.join(' ').toLowerCase().includes(searchText.toLowerCase())
          )
          .map((memo) => (
          <MemoCard key={`${memo.title}-${memo.date}`} memo={memo} />
          ))}
          </View>
        </ScrollView>
      </View>

      <AppFloatingActionButton
      label="메모 추가"onPress={() => alert('메모 작성 화면 연결 예정')}
      />

      <AppBottomNav active="memo" />
    </View>
  );
}

function MemoCard({
  memo,
}: {
  memo: {
    category: string;
    date: string;
    title: string;
    body: string[];
    progress?: boolean;
    collaborators?: boolean;
    attachment?: string;
    muted?: boolean;
  };
}) {
  return (
    <TouchableOpacity activeOpacity={0.78} style={[styles.memoCard, memo.muted && styles.memoCardMuted]}>
      <View style={styles.memoMetaRow}>
        <Text style={styles.memoCategory}>{memo.category}</Text>
        <Text style={styles.memoDate}>{memo.date}</Text>
      </View>

      <Text style={styles.memoTitle}>{memo.title}</Text>

      <View>
        {memo.body.map((line) => (
          <Text key={line} style={styles.memoBody}>
            {line}
          </Text>
        ))}
      </View>

      {memo.progress ? (
        <View style={styles.progressRow}>
          <View style={styles.progressActive} />
          <View style={styles.progressInactive} />
        </View>
      ) : null}

      {memo.collaborators ? (
        <View style={styles.collaborators}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>팀</Text>
          </View>
          <View style={styles.moreAvatar}>
            <Text style={styles.moreAvatarText}>+2</Text>
          </View>
        </View>
      ) : null}

      {memo.attachment ? (
        <View style={styles.attachmentRow}>
          <MaterialIcons name="attach-file" size={14} color="#777777" />
          <Text style={styles.attachmentText}>{memo.attachment}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 128,
    gap: 40,
  },
  searchSection: {
    height: 56,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.02,
    shadowRadius: 16,
    elevation: 2,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  searchInput: {
    height: '100%',
    paddingLeft: 48,
    paddingRight: 24,
    color: '#191C1D',
    fontSize: 16,
    lineHeight: 22,
  },
  memoList: {
    gap: 24,
  },
  memoCard: {
    width: '100%',
    padding: 32,
    borderRadius: 48,
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.03,
    shadowRadius: 48,
    elevation: 5,
  },
  memoCardMuted: {
    backgroundColor: '#F3F4F5',
    borderWidth: 1,
    borderColor: 'rgba(198, 198, 198, 0.1)',
  },
  memoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memoCategory: {
    color: '#777777',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  memoDate: {
    color: '#777777',
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '500',
  },
  memoTitle: {
    color: '#000000',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  memoBody: {
    color: '#474747',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  progressActive: {
    width: 48,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#000000',
  },
  progressInactive: {
    width: 16,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#E1E3E4',
  },
  collaborators: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F766E',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '700',
  },
  moreAvatar: {
    width: 32,
    height: 32,
    marginLeft: -8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D9DADB',
  },
  moreAvatarText: {
    color: '#191C1D',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '600',
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  attachmentText: {
    color: '#777777',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
});
