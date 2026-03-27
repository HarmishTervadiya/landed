import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Constants } from '@/types/supabase.types';
import { AppStatus, ApplicationFormProps } from '@/types';

export const ApplicationForm = ({ initialValues, onSubmit, loading }: ApplicationFormProps) => {
  const [companyName, setCompanyName] = useState(initialValues?.company_name || '');
  const [roleTitle, setRoleTitle] = useState(initialValues?.role_title || '');
  const [jdUrl, setJdUrl] = useState(initialValues?.jd_url || '');
  const [status, setStatus] = useState<AppStatus>(initialValues?.status || 'Wishlist');

  const handleSubmit = () => {
    if (!companyName.trim()) return;

    onSubmit({
      company_name: companyName,
      role_title: roleTitle || null,
      jd_url: jdUrl || null,
      status,
    });
  };

  return (
    <View className="rounded-xl bg-panel p-4">
      <View className="mb-4">
        <Text className="text-text mb-1 text-sm font-medium">Company Name *</Text>
        <TextInput
          className="border-primary/20 text-text rounded-lg border bg-background p-3"
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="e.g. Acme Corp"
          autoCapitalize="words"
        />
      </View>

      <View className="mb-4">
        <Text className="text-text mb-1 text-sm font-medium">Role Title</Text>
        <TextInput
          className="border-primary/20 text-text rounded-lg border bg-background p-3"
          value={roleTitle}
          onChangeText={setRoleTitle}
          placeholder="e.g. Software Engineer"
        />
      </View>

      <View className="mb-4">
        <Text className="text-text mb-1 text-sm font-medium">Job Description URL</Text>
        <TextInput
          className="border-primary/20 text-text rounded-lg border bg-background p-3"
          value={jdUrl}
          onChangeText={setJdUrl}
          placeholder="https://..."
          keyboardType="url"
          autoCapitalize="none"
        />
      </View>

      <View className="mb-6">
        <Text className="text-text mb-1 text-sm font-medium">Status</Text>
        <View className="mt-1 flex-row flex-wrap gap-2">
          {Constants.public.Enums.app_status.map((st) => (
            <TouchableOpacity
              key={st}
              onPress={() => setStatus(st)}
              className={`rounded-lg border px-3 py-2 ${
                status === st ? 'border-primary bg-primary' : 'border-primary/20 bg-background'
              }`}>
              <Text className={status === st ? 'text-background' : 'text-text'}>
                {st.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading || !companyName.trim()}
        className={`items-center rounded-lg p-4 ${
          loading || !companyName.trim() ? 'bg-primary/50' : 'bg-primary'
        }`}>
        {loading ? (
          <ActivityIndicator color="#fdfbf7" />
        ) : (
          <Text className="text-lg font-bold text-background">
            {initialValues?.id ? 'Save Changes' : 'Create Application'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
