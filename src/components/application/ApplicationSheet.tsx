import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { useApplicationStore } from '@/store/applicationStore';
import { Constants, Application, ApplicationInsert, AppStatus } from '@/types';
import { FileText, Trash2 } from 'lucide-react-native';

interface ApplicationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  application?: Application; // undefined = create mode
}

export const ApplicationSheet = ({ isOpen, onClose, application }: ApplicationSheetProps) => {
  const isEditMode = application !== undefined;

  const { create, update, remove, loading, error } = useApplicationStore();

  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [jdUrl, setJdUrl] = useState('');
  const [status, setStatus] = useState<AppStatus>('Wishlist');
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  useEffect(() => {
    if (isOpen && application) {
      setCompanyName(application.company_name);
      setRoleTitle(application.role_title ?? '');
      setJdUrl(application.jd_url ?? '');
      setStatus(application.status ?? 'Wishlist');
      setShowStatusPicker(false);
    } else if (!isOpen) {
      setCompanyName('');
      setRoleTitle('');
      setJdUrl('');
      setStatus('Wishlist');
      setShowStatusPicker(false);
    }
  }, [isOpen, application]);

  const handleSubmit = useCallback(async () => {
    if (!companyName.trim()) return;

    const payload = {
      company_name: companyName.trim(),
      role_title: roleTitle.trim() || null,
      jd_url: jdUrl.trim() || null,
      status,
    };

    if (isEditMode && application) {
      const result = await update(application.id, payload);
      if (result.success) onClose();
    } else {
      const result = await create(payload as ApplicationInsert);
      if (result.success) onClose();
    }
  }, [companyName, roleTitle, jdUrl, status, isEditMode, application, create, update, onClose]);

  const handleDelete = useCallback(() => {
    if (!application) return;

    Alert.alert(
      'Delete Application',
      `Are you sure you want to delete "${application.company_name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await remove(application.id);
            if (result.success) onClose();
          },
        },
      ]
    );
  }, [application, remove, onClose]);

  const isSubmitDisabled = !companyName.trim() || loading;

  const cycleStatus = () => {
    const statuses = Constants.public.Enums.app_status;
    const currentIndex = statuses.indexOf(status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    setStatus(statuses[nextIndex]);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Application' : 'New Application'}
      snapHeight={isEditMode ? 620 : 560}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}>
        {error ? (
          <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
            <Text className="text-sm text-red-600">{error}</Text>
          </View>
        ) : null}

        {/* Company Name */}
        <View className="mb-5">
          <Text className="mb-2 text-[10px] font-medium uppercase tracking-wider text-stone-500">
            Company Name
          </Text>
          <TextInput
            className="rounded-[1rem] border border-stone-200 bg-white px-4 py-3.5 text-[#3A312B]"
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="e.g. Stripe"
            placeholderTextColor="#A8A29E"
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        {/* Role Title */}
        <View className="mb-5">
          <Text className="mb-2 text-[10px] font-medium uppercase tracking-wider text-stone-500">
            Role / Title
          </Text>
          <TextInput
            className="rounded-[1rem] border border-stone-200 bg-white px-4 py-3.5 text-[#3A312B]"
            value={roleTitle}
            onChangeText={setRoleTitle}
            placeholder="e.g. Frontend Engineer"
            placeholderTextColor="#A8A29E"
            returnKeyType="done"
          />
        </View>

        {/* Two Column Layout: Status & JD Document */}
        <View className="mb-8 flex-row gap-4">
          <View className="flex-1">
            <Text className="mb-2 text-[10px] font-medium uppercase tracking-wider text-stone-500">
              Status
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowStatusPicker(!showStatusPicker)}
              className="items-start justify-center rounded-[1rem] border border-stone-200 bg-white px-4 py-3.5">
              <Text className="font-medium text-[#3A312B]">{status.replace('_', ' ')}</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            <Text className="mb-2 text-[10px] font-medium uppercase tracking-wider text-stone-500">
              JD Document
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center justify-center gap-2 rounded-[1rem] border border-stone-200 bg-[#FDFBF7] px-4 py-3.5">
              <FileText size={16} color="#78716C" />
              <Text className="text-sm font-medium text-[#57534E]">
                {isEditMode ? 'View PDF' : 'Upload PDF'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pseudo Status Picker Overlay (if active) */}
        {showStatusPicker && (
          <View className="-mt-6 mb-6 rounded-[1rem] border border-stone-200 bg-stone-50 p-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {Constants.public.Enums.app_status.map((st) => (
                  <TouchableOpacity
                    key={st}
                    onPress={() => {
                      setStatus(st);
                      setShowStatusPicker(false);
                    }}
                    className={`rounded-full border px-4 py-2 ${status === st ? 'border-[#3A312B] bg-[#3A312B]' : 'border-stone-200 bg-white'}`}>
                    <Text className={`text-center text-sm ${status === st ? 'text-white' : 'text-stone-600'}`}>
                      {st.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Action Buttons */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          activeOpacity={0.8}
          className={`mb-4 w-full items-center justify-center rounded-[1.5rem] py-4 shadow-md ${isSubmitDisabled ? 'bg-[#3A312B]/50' : 'bg-[#3A312B]'}`}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-base font-semibold text-white">
              {isEditMode ? 'Save Changes' : 'Save Application'}
            </Text>
          )}
        </TouchableOpacity>

        {isEditMode ? (
          <TouchableOpacity
            onPress={handleDelete}
            disabled={loading}
            activeOpacity={0.7}
            className="w-full flex-row items-center justify-center gap-2 rounded-[1.5rem] border border-rose-100 bg-white py-4">
            <Trash2 size={16} color="#F43F5E" />
            <Text className="text-base font-medium text-rose-500">Delete Application</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
};
