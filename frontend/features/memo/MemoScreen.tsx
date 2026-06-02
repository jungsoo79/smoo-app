import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Swipeable } from 'react-native-gesture-handler';

import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';

import { AppBottomNav, AppFloatingActionButton, AppTopBar } from '@/components/app-chrome';
import { AppColors, AppTypography } from '@/constants/appStyles';

import { useState } from 'react';
import { MemoItem, memos } from '@/features/memo/mock';


export default function MemoScreen() {
  const [searchText, setSearchText] = useState('');

  const [memoList, setMemoList] = useState<MemoItem[]>(memos);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  const [newCategory, setNewCategory] = useState('개인');
  const [customCategory, setCustomCategory] = useState('');

  const [editingMemoId, setEditingMemoId] = useState<number | null>(null);

  const [selectedMemo, setSelectedMemo] = useState<MemoItem | null>(null);

  const defaultCategories = ['개인', '회의', '기획', '할 일', '쇼핑', '취미', '기타'];

  const handleAddMemo = () => {
  if (!newTitle.trim() || !newBody.trim()) {
    return;
  }

  const finalCategory =
    newCategory === '기타' && customCategory.trim()
      ? customCategory.trim()
      : newCategory;

  if (editingMemoId !== null) {
    setMemoList(
      memoList.map((memo) =>
        memo.id === editingMemoId
          ? {
            ...memo,
            category: finalCategory,
            title: newTitle,
            body: [newBody],
            date: new Date().toISOString().slice(0, 10),
          }
          : memo
      )
    );
  } else {
    const newMemo: MemoItem = {
      id: Date.now(),
      category: finalCategory,
      title: newTitle,
      body: [newBody],
      date: new Date().toISOString().slice(0, 10),
    };

    setMemoList([newMemo, ...memoList]);
  }

  setNewTitle('');
  setNewBody('');
  setCustomCategory('');
  setEditingMemoId(null);
  setModalVisible(false);
};

const handleDeleteMemo = (memo: MemoItem) => {
  Alert.alert(
    '메모 삭제',
    `"${memo.title}" 메모를 삭제하시겠습니까?`,
    [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setMemoList(
            memoList.filter((item) => item.id !== memo.id)
          );
        },
      },
    ]
  );
};

const handleStartEditMemo = (memo: MemoItem) => {
  setEditingMemoId(memo.id);
  setNewTitle(memo.title);
  setNewBody(memo.body.join('\n'));
  if (defaultCategories.includes(memo.category)) {
  setNewCategory(memo.category);
  setCustomCategory('');
} else {
  setNewCategory('기타');
  setCustomCategory(memo.category);
}
  setModalVisible(true);
};

const handleOpenDetailMemo = (memo: MemoItem) => {
  setSelectedMemo(memo);
};

const handleCloseModal = () => {
  setModalVisible(false);
  setEditingMemoId(null);
  setNewTitle('');
  setNewBody('');
  setNewCategory('개인');
   setCustomCategory('');
};

const today = new Date().toISOString().slice(0, 10);

const filteredMemos = memoList.filter(
  (memo) =>
    memo.title.toLowerCase().includes(searchText.toLowerCase()) ||
    memo.body.join(' ').toLowerCase().includes(searchText.toLowerCase()) ||
    memo.category.toLowerCase().includes(searchText.toLowerCase())
);

const isSearching = searchText.trim().length > 0;

const todayMemos = filteredMemos.filter((memo) => memo.date === today);
const previousMemos = filteredMemos.filter((memo) => memo.date !== today);

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

            {filteredMemos.length === 0 && !isSearching && (
              
  <View
    style={{
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 80,
      paddingHorizontal: 32,
    }}
  >
    <MaterialIcons
      name="sticky-note-2"
      size={56}
      color="#D1D5DB"
    />

    <Text
      style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 16,
      }}
    >
      메모가 없습니다
    </Text>

    <Text
      style={{
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
      }}
    >
      오른쪽 아래 + 버튼을 눌러
      {'\n'}
      첫 번째 메모를 작성해보세요
    </Text>
  </View>
)}

{filteredMemos.length === 0 && isSearching && (
  <Text
    style={{
      color: '#777777',
      fontSize: 14,
      textAlign: 'center',
      marginTop: 40,
    }}
  >
    검색 결과가 없습니다.
  </Text>
)}
            
  {todayMemos.length > 0 && (
    <>
      <Text
  style={{
    fontSize: 12,
fontWeight: '500',
color: '#A1A1AA',
letterSpacing: 0.5,
  }}
>
  오늘
</Text>

      {todayMemos.map((memo) => (
        <Swipeable
  key={memo.id}
  renderRightActions={() => (
    <TouchableOpacity
      onPress={() => handleDeleteMemo(memo)}
      style={{
  width: 72,
  borderRadius: 24,
  backgroundColor: '#E5E7EB',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 8,
}}
    >
      <MaterialIcons name="delete-outline" size={22} color="#A1A1AA" />
    </TouchableOpacity>
  )}
>
  <MemoCard
    memo={memo}
    onPress={() => handleOpenDetailMemo(memo)}
    onLongPress={() => handleDeleteMemo(memo)}
  />
</Swipeable>
      ))}
    </>
  )}

  {previousMemos.length > 0 && (
    <>
      <Text
  style={{
    fontSize: 12,
fontWeight: '500',
color: '#A1A1AA',
letterSpacing: 0.5,
  }}
>
  이전 메모
</Text>

      {previousMemos.map((memo) => (
        <Swipeable
  key={memo.id}
  renderRightActions={() => (
    <TouchableOpacity
      onPress={() => handleDeleteMemo(memo)}
      style={{
  width: 72,
  borderRadius: 24,
  backgroundColor: '#E5E7EB',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 8,
}}
    >
      <MaterialIcons name="delete-outline" size={22} color="#A1A1AA" />
    </TouchableOpacity>
  )}
>
  <MemoCard
    memo={memo}
    onPress={() => handleOpenDetailMemo(memo)}
    onLongPress={() => handleDeleteMemo(memo)}
  />
</Swipeable>
      ))}
    </>
  )}
</View>
        </ScrollView>
      </View>

      <AppFloatingActionButton
      label="메모 추가"
      onPress={() => {
        setEditingMemoId(null);
        setNewTitle('');
        setNewBody('');
        setNewCategory('개인');
        setModalVisible(true);
      }}
      />

      <Modal
  visible={modalVisible}
  transparent
  animationType="slide"
  onRequestClose={handleCloseModal}
>
  <View
  style={{
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  }}
>
    <View
  style={{
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    minHeight: '85%',
  }}
>

<TouchableOpacity
  onPress={handleCloseModal}
  activeOpacity={0.7}
  style={{
    width: 80,
    height: 28,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  }}
>
  <View
    style={{
      width: 60,
      height: 6,
      borderRadius: 999,
      backgroundColor: '#D1D5DB',
    }}
  />
</TouchableOpacity>

      <Text
      style={{
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 24,
        }}
        >

        {editingMemoId !== null ? '메모 수정' : '새 메모 작성'}
        </Text>

<View
  style={{
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  }}
>
  {defaultCategories.map((category) => (
    <TouchableOpacity
      key={category}
      onPress={() => {
  setNewCategory(category);

  if (category !== '기타') {
    setCustomCategory('');
  }
}}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 999,
        backgroundColor:
          newCategory === category ? '#000' : '#E5E7EB',
      }}
    >
      <Text
        style={{
          color:
            newCategory === category ? '#fff' : '#191C1D',
        }}
      >
        {category}
      </Text>
    </TouchableOpacity>
  ))}
</View>

{newCategory === '기타' && (
  <TextInput
    placeholder="카테고리 직접 입력"
    value={customCategory}
    onChangeText={setCustomCategory}
    style={{
      borderWidth: 1,
      borderColor: '#E5E7EB',
      backgroundColor: '#F8F9FA',
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      marginBottom: 12,
    }}
  />
)}

      <TextInput
        placeholder="제목"
        value={newTitle}
        onChangeText={setNewTitle}
        style={{
          borderWidth: 1,
          borderColor: '#E5E7EB',
          backgroundColor: '#F8F9FA',
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 16,
          marginBottom: 12,
        }}
      />

      <TextInput
        placeholder="내용"
        value={newBody}
        onChangeText={setNewBody}
        multiline
        style={{
          borderWidth: 1,
          borderColor: '#E5E7EB',
          backgroundColor: '#F8F9FA',
          borderRadius: 20,
          padding: 16,
          height: 200,
          fontSize: 16,
          lineHeight: 24,
          textAlignVertical: 'top',
        }}
      />

<View
  style={{
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  }}
>

  <TouchableOpacity
        onPress={handleAddMemo}
        style={{
          flex: 1,
          backgroundColor: '#000',
          padding: 16,
          borderRadius: 16,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          {editingMemoId !== null ? '수정 완료' : '저장'}
          </Text>
      </TouchableOpacity>

      <TouchableOpacity
  onPress={handleCloseModal}
  style={{
  flex: 1,
  backgroundColor: '#E5E7EB',
  padding: 16,
  borderRadius: 16,
}}
>
  <Text style={{ color: '#191C1D', textAlign: 'center' }}>
    취소
  </Text>
</TouchableOpacity>

      
      </View>
    </View>
  </View>
</Modal>

<Modal
  visible={selectedMemo !== null}
  transparent 
  animationType="fade"
  onRequestClose={() => setSelectedMemo(null)}
>
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      padding: 24,
      backgroundColor: 'rgba(0,0,0,0.4)',
    }}
  >
    <View
  style={{
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    maxHeight: '70%',
  }}
>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          marginBottom: 8,
        }}
      >
        {selectedMemo?.title}
      </Text>

      <Text
        style={{
          color: '#777',
          marginBottom: 12,
        }}
      >
        {selectedMemo?.category} · {selectedMemo?.date.replace(/-/g, '.')}
      </Text>

      <ScrollView
  style={{
    maxHeight: 260,
    marginBottom: 16,
  }}
  showsVerticalScrollIndicator={false}
>
  <Text
    style={{
      fontSize: 16,
      lineHeight: 24,
      color: '#333',
    }}
  >
    {selectedMemo?.body.join('\n')}
  </Text>
</ScrollView>

      <View
  style={{
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
  }}
>
  <TouchableOpacity
    onPress={() => {
      if (!selectedMemo) return;

      setSelectedMemo(null);
      handleStartEditMemo(selectedMemo);
    }}
    style={{ padding: 4 }}
  >
    <MaterialIcons name="edit" size={18} color="#AAAAAA" />
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => {
      if (!selectedMemo) return;

      const memoToDelete = selectedMemo;
      setSelectedMemo(null);
      handleDeleteMemo(memoToDelete);
    }}
    style={{ padding: 4 }}
  >
    <MaterialIcons name="delete-outline" size={18} color="#AAAAAA" />
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => setSelectedMemo(null)}
    style={{ padding: 4 }}
  >
    <MaterialIcons name="close" size={18} color="#AAAAAA" />
  </TouchableOpacity>
</View>
    </View>
  </View>
</Modal>

      <AppBottomNav active="memo" />
    </View>
  );
}

function MemoCard({
  memo,
  onPress,
  onLongPress,
}: {
  memo: {
    id: number;
    category: string;
    date: string;
    title: string;
    body: string[];
    progress?: boolean;
    collaborators?: boolean;
    attachment?: string;
    muted?: boolean;
  };
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <TouchableOpacity
    activeOpacity={0.78}
    onPress={onPress}
    onLongPress={onLongPress}
    style={[styles.memoCard, memo.muted && styles.memoCardMuted]}
    >
      <View style={styles.memoMetaRow}>
        <Text style={styles.memoCategory}>{memo.category}</Text>
        <Text style={styles.memoDate}>
  {memo.date.replace(/-/g, '.')}
</Text>
      </View>

      <Text
      numberOfLines={1}
      ellipsizeMode="tail"
      style={styles.memoTitle}
      >
        {memo.title}
        </Text>

      <Text
  numberOfLines={1}
  ellipsizeMode="tail"
  style={styles.memoBody}
>
  {memo.body.join(' ')}
</Text>

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
    gap: 20,
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
    gap: 16,
  },
  memoCard: {
    width: '100%',
    height: 160,
    padding: 16,
    borderRadius: 36,
    gap: 10,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
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
    ...AppTypography.micro,
    fontSize: 13,
    fontWeight: '600',
  },
  memoDate: {
    ...AppTypography.caption,
    color: AppColors.textMuted,
    fontWeight: '500',
  },
  memoTitle: {
    ...AppTypography.sectionTitle,
    fontSize: 20,
  lineHeight: 26,
  fontWeight: '700',
  },
  memoBody: {
    ...AppTypography.body,
    color: AppColors.textSecondary,
    fontSize: 15,
  lineHeight: 21,
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
