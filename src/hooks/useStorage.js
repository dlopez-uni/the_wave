import { useCallback, useEffect, useMemo, useState } from 'react';
import { getDefaultLevels } from '../data/defaultLevels';

export const STORAGE_KEY = 'the_wave_data';
export const MAX_PROFILES = 8;

const getDefaultData = () => ({
  version: 1,
  teacherPin: '0000',
  profiles: [],
});

const buildProfileId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `profile-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

const normalizeLevels = (incomingLevels) => {
  const defaultLevels = getDefaultLevels();
  if (!Array.isArray(incomingLevels)) {
    return defaultLevels;
  }

  const normalized = defaultLevels.map((baseLevel, index) => {
    const source = incomingLevels.find((level) => level?.id === baseLevel.id);
    const completed = Boolean(source?.completed);
    const locked = typeof source?.locked === 'boolean' ? source.locked : baseLevel.locked;
    return {
      ...baseLevel,
      completed,
      locked,
    };
  });

  // Keep progression consistent even if imported data was edited manually.
  return normalized.map((level, index, allLevels) => {
    if (index === 0) {
      return { ...level, locked: false };
    }
    const prevCompleted = allLevels[index - 1]?.completed;
    if (prevCompleted || level.completed) {
      return { ...level, locked: false };
    }
    return level;
  });
};

const normalizeProfile = (profile) => {
  if (!profile || typeof profile !== 'object') {
    return null;
  }

  const name = String(profile.name || '').trim().slice(0, 15);
  if (!name) {
    return null;
  }

  const now = Date.now();
  return {
    id: typeof profile.id === 'string' && profile.id ? profile.id : buildProfileId(),
    name,
    avatar: typeof profile.avatar === 'string' && profile.avatar ? profile.avatar : 'robot',
    levels: normalizeLevels(profile.levels),
    createdAt: Number.isFinite(profile.createdAt) ? profile.createdAt : now,
    lastPlayedAt: Number.isFinite(profile.lastPlayedAt) ? profile.lastPlayedAt : now,
  };
};

const normalizeData = (rawData) => {
  if (!rawData || typeof rawData !== 'object') {
    return getDefaultData();
  }

  const profiles = Array.isArray(rawData.profiles)
    ? rawData.profiles
        .map((profile) => normalizeProfile(profile))
        .filter(Boolean)
        .slice(0, MAX_PROFILES)
    : [];

  const teacherPin = /^\d{4}$/.test(String(rawData.teacherPin || ''))
    ? String(rawData.teacherPin)
    : '0000';

  return {
    version: 1,
    teacherPin,
    profiles,
  };
};

const readStorage = () => {
  if (typeof window === 'undefined') {
    return getDefaultData();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultData();
    }
    return normalizeData(JSON.parse(raw));
  } catch (error) {
    console.error('No se pudo leer localStorage:', error);
    return getDefaultData();
  }
};

const downloadJSON = (fileContent) => {
  const blob = new Blob([fileContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `the_wave_backup_${date}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const useAppData = () => {
  const [appData, setAppData] = useState(getDefaultData());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAppData(readStorage());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  }, [appData, ready]);

  const createProfile = useCallback((name, avatar) => {
    const trimmedName = String(name || '').trim().slice(0, 15);
    if (!trimmedName) {
      throw new Error('El nombre es obligatorio.');
    }

    if (appData.profiles.length >= MAX_PROFILES) {
      throw new Error('Ya se alcanzó el máximo de perfiles.');
    }

    const now = Date.now();
    const nextProfile = {
      id: buildProfileId(),
      name: trimmedName,
      avatar: avatar || 'robot',
      levels: getDefaultLevels(),
      createdAt: now,
      lastPlayedAt: now,
    };

    setAppData((prev) => ({
      ...prev,
      profiles: [...prev.profiles, nextProfile],
    }));

    return nextProfile;
  }, [appData.profiles.length]);

  const deleteProfile = useCallback((profileId) => {
    setAppData((prev) => ({
      ...prev,
      profiles: prev.profiles.filter((profile) => profile.id !== profileId),
    }));
  }, []);

  const resetProfileProgress = useCallback((profileId) => {
    const now = Date.now();
    setAppData((prev) => ({
      ...prev,
      profiles: prev.profiles.map((profile) =>
        profile.id === profileId
          ? { ...profile, levels: getDefaultLevels(), lastPlayedAt: now }
          : profile
      ),
    }));
  }, []);

  const touchProfile = useCallback((profileId) => {
    const now = Date.now();
    setAppData((prev) => ({
      ...prev,
      profiles: prev.profiles.map((profile) =>
        profile.id === profileId
          ? { ...profile, lastPlayedAt: now }
          : profile
      ),
    }));
  }, []);

  const setProfileLevels = useCallback((profileId, levels) => {
    const now = Date.now();
    const normalizedLevels = normalizeLevels(levels);
    setAppData((prev) => ({
      ...prev,
      profiles: prev.profiles.map((profile) =>
        profile.id === profileId
          ? { ...profile, levels: normalizedLevels, lastPlayedAt: now }
          : profile
      ),
    }));
  }, []);

  const updateTeacherPin = useCallback((nextPin) => {
    if (!/^\d{4}$/.test(String(nextPin || ''))) {
      throw new Error('El PIN debe tener 4 digitos numericos.');
    }
    setAppData((prev) => ({
      ...prev,
      teacherPin: String(nextPin),
    }));
  }, []);

  const exportJSON = useCallback(() => {
    downloadJSON(JSON.stringify(appData, null, 2));
  }, [appData]);

  const importJSON = useCallback(async (file) => {
    if (!file) {
      throw new Error('No se selecciono ningun archivo.');
    }
    const text = await file.text();
    const parsed = JSON.parse(text);
    const normalized = normalizeData(parsed);
    setAppData(normalized);
    return normalized;
  }, []);

  const sortedProfiles = useMemo(() => {
    return [...appData.profiles].sort((a, b) => b.lastPlayedAt - a.lastPlayedAt);
  }, [appData.profiles]);

  return {
    appData,
    ready,
    profiles: sortedProfiles,
    createProfile,
    deleteProfile,
    resetProfileProgress,
    touchProfile,
    setProfileLevels,
    updateTeacherPin,
    exportJSON,
    importJSON,
  };
};
