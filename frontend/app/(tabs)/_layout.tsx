import { router, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { clearSession, getSession, isSessionExpired } from '@/features/auth/session';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isSessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getSession()
      .then(async (session) => {
        if (!session || isSessionExpired(session)) {
          await clearSession();
          router.replace('/login');
          return;
        }

        if (isMounted) {
          setSessionReady(true);
        }
      })
      .catch(() => {
        router.replace('/login');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isSessionReady) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { display: 'none' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="memo"
        options={{
          title: '메모',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="note.text" color={color} />,
        }}
      />
      <Tabs.Screen
        name="checklist"
        options={{
          title: '체크',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="checklist" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '일정',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ledger"
        options={{
          title: '가계부',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="creditcard.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          title: '설정',
        }}
      />
    </Tabs>
  );
}
