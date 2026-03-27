import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { useApplicationStore } from '@/store/applicationStore';
import { Constants, Application, ApplicationInsert, AppStatus } from '@/types';
import { FileText, Trash2, Upload, ExternalLink } from 'lucide-react-native';
import { pickAndUploadJD, getJDSignedUrl } from '@/lib/storage';

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
  const [jdStoragePath, setJdStoragePath] = useState<string | null>(null);
  const [jdUploading, setJdUploading] = useState(false);

  useEffect(() => {
    if (isOpen && application) {
      setCompanyName(application.company_name);
      setRoleTitle(application.role_title ?? '');
      setJdUrl(application.jd_url ?? '');
      setStatus(application.status ?? 'Wishlist');
      setShowStatusPicker(false);
      setJdStoragePath(application.jd_storage_path ?? null);
    } else if (!isOpen) {
      setCompanyName('');
      setRoleTitle('');
      setJdUrl('');
      setStatus('Wishlist');
      setShowStatusPicker(false);
      setJdStoragePath(null);
    }
  }, [isOpen, application]);

  const handleSubmit = useCallback(async () => {
    if (!companyName.trim()) return;

    const payload = {
      company_name: companyName.trim(),
      role_title: roleTitle.trim() || null,
      jd_url: jdUrl.trim() || null,
      jd_storage_path: jdStoragePath,
      status,
    };

    if (isEditMode && application) {
      const result = await update(application.id, payload);
      if (result.success) onClose();
    } else {
      const result = await create(payload as ApplicationInsert);
      if (result.success) onClose();
    }
  }, [
    companyName,
    roleTitle,
    jdUrl,
    jdStoragePath,
    status,
    isEditMode,
    application,
    create,
    update,
    onClose,
  ]);

  const handleJDUpload = useCallback(async () => {
    if (!application?.id && !isEditMode) {
      Alert.alert('Save first', 'Please save the application before uploading a JD.');
      return;
    }
    const appId = application?.id ?? 'temp';
    try {
      setJdUploading(true);
      const path = await pickAndUploadJD(appId);
      if (path) {
        setJdStoragePath(path);
        // If in edit mode, save immediately
        if (isEditMode && application) {
          await update(application.id, { jd_storage_path: path });
        }
      }
    } catch (e: unknown) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setJdUploading(false);
    }
  }, [application, isEditMode, update]);

  const handleViewJD = useCallback(async () => {
    if (jdStoragePath) {
      const url = await getJDSignedUrl(jdStoragePath);
      if (url) Linking.openURL(url);
    } else if (jdUrl) {
      Linking.openURL(jdUrl);
    }
  }, [jdStoragePath, jdUrl]);

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
            {jdStoragePath ? (
              <View className="flex-row gap-2">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleViewJD}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-[1rem] border border-stone-200 bg-[#FDFBF7] px-3 py-3.5">
                  <ExternalLink size={14} color="#78716C" />
                  <Text className="text-xs font-medium text-[#57534E]">View JD</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleJDUpload}
                  disabled={jdUploading}
                  className="flex-row items-center justify-center gap-1 rounded-[1rem] border border-stone-200 bg-[#FDFBF7] px-3 py-3.5">
                  {jdUploading ? (
                    <ActivityIndicator size="small" color="#78716C" />
                  ) : (
                    <Upload size={14} color="#78716C" />
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleJDUpload}
                disabled={jdUploading}
                className="flex-row items-center justify-center gap-2 rounded-[1rem] border border-stone-200 bg-[#FDFBF7] px-4 py-3.5">
                {jdUploading ? (
                  <ActivityIndicator size="small" color="#78716C" />
                ) : (
                  <FileText size={16} color="#78716C" />
                )}
                <Text className="text-sm font-medium text-[#57534E]">
                  {jdUploading ? 'Uploading…' : 'Upload PDF'}
                </Text>
              </TouchableOpacity>
            )}
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
                    style={{
                      borderRadius: 999,
                      borderWidth: 1,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderColor: status === st ? '#3A312B' : '#E7E5E4',
                      backgroundColor: status === st ? '#3A312B' : '#FFFFFF',
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: status === st ? '#FFFFFF' : '#57534E',
                        textAlign: 'center',
                      }}>
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
          style={{
            marginBottom: 16,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 24,
            paddingVertical: 16,
            backgroundColor: isSubmitDisabled ? 'rgba(58,49,43,0.5)' : '#3A312B',
          }}>
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
