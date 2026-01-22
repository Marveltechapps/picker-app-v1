import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";

export type PermissionStatus = "pending" | "allowed" | "denied";

export interface PermissionsState {
  pushNotifications: PermissionStatus;
  camera: PermissionStatus;
  battery: PermissionStatus;
  location: PermissionStatus;
  backgroundLocation: PermissionStatus;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: "male" | "female";
  photoUri: string;
}

export interface DocumentUploads {
  aadhar: {
    front: string | null;
    back: string | null;
  };
  pan: {
    front: string | null;
    back: string | null;
  };
}

export interface TrainingProgress {
  video1: number;
  video2: number;
  video3: number;
  video4: number;
}

export type LocationType = "warehouse" | "darkstore" | null;

export interface ShiftSelection {
  id: string;
  name: string;
  time: string;
}

interface AuthState {
  hasCompletedPermissionOnboarding: boolean;
  hasCompletedLogin: boolean;
  hasCompletedProfile: boolean;
  hasCompletedVerification: boolean;
  hasCompletedDocuments: boolean;
  hasCompletedTraining: boolean;
  hasCompletedSetup: boolean;
  hasCompletedManagerOTP: boolean;
  permissions: PermissionsState;
  phoneNumber: string | null;
  userProfile: UserProfile | null;
  documentUploads: DocumentUploads;
  trainingProgress: TrainingProgress;
  locationType: LocationType;
  selectedShifts: ShiftSelection[];
  shiftActive: boolean;
  shiftStartTime: number | null;
  isLoading: boolean;
}

const STORAGE_KEYS = {
  PERMISSION_ONBOARDING: "@auth/permission_onboarding",
  LOGIN: "@auth/login",
  PROFILE: "@auth/profile",
  VERIFICATION: "@auth/verification",
  DOCUMENTS: "@auth/documents",
  TRAINING: "@auth/training",
  SETUP: "@auth/setup",
  MANAGER_OTP: "@auth/manager_otp",
  PERMISSIONS: "@auth/permissions",
  PHONE_NUMBER: "@auth/phone_number",
  USER_PROFILE: "@auth/user_profile",
  DOCUMENT_UPLOADS: "@auth/document_uploads",
  TRAINING_PROGRESS: "@auth/training_progress",
  LOCATION_TYPE: "@auth/location_type",
  SELECTED_SHIFTS: "@auth/selected_shifts",
  SHIFT_ACTIVE: "@auth/shift_active",
  SHIFT_START_TIME: "@auth/shift_start_time",
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [state, setState] = useState<AuthState>({
    hasCompletedPermissionOnboarding: false,
    hasCompletedLogin: false,
    hasCompletedProfile: false,
    hasCompletedVerification: false,
    hasCompletedDocuments: false,
    hasCompletedTraining: false,
    hasCompletedSetup: false,
    hasCompletedManagerOTP: false,
    permissions: {
      pushNotifications: "pending",
      camera: "pending",
      battery: "pending",
      location: "pending",
      backgroundLocation: "pending",
    },
    phoneNumber: null,
    userProfile: null,
    documentUploads: {
      aadhar: { front: null, back: null },
      pan: { front: null, back: null },
    },
    trainingProgress: {
      video1: 0,
      video2: 0,
      video3: 0,
      video4: 0,
    },
    locationType: null,
    selectedShifts: [],
    shiftActive: false,
    shiftStartTime: null,
    isLoading: true,
  });

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      console.log("Loading auth state from storage...");
      const [onboarding, login, profile, verification, documents, training, setup, managerOTP, permissions, phoneNumber, userProfile, documentUploads, trainingProgress, locationType, selectedShifts, shiftActive, shiftStartTime] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PERMISSION_ONBOARDING),
        AsyncStorage.getItem(STORAGE_KEYS.LOGIN),
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.VERIFICATION),
        AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS),
        AsyncStorage.getItem(STORAGE_KEYS.TRAINING),
        AsyncStorage.getItem(STORAGE_KEYS.SETUP),
        AsyncStorage.getItem(STORAGE_KEYS.MANAGER_OTP),
        AsyncStorage.getItem(STORAGE_KEYS.PERMISSIONS),
        AsyncStorage.getItem(STORAGE_KEYS.PHONE_NUMBER),
        AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.DOCUMENT_UPLOADS),
        AsyncStorage.getItem(STORAGE_KEYS.TRAINING_PROGRESS),
        AsyncStorage.getItem(STORAGE_KEYS.LOCATION_TYPE),
        AsyncStorage.getItem(STORAGE_KEYS.SELECTED_SHIFTS),
        AsyncStorage.getItem(STORAGE_KEYS.SHIFT_ACTIVE),
        AsyncStorage.getItem(STORAGE_KEYS.SHIFT_START_TIME),
      ]);

      console.log("Loaded values:", { onboarding, login, profile, phoneNumber });

      setState({
        hasCompletedPermissionOnboarding: onboarding === "true",
        hasCompletedLogin: login === "true",
        hasCompletedProfile: profile === "true",
        hasCompletedVerification: verification === "true",
        hasCompletedDocuments: documents === "true",
        hasCompletedTraining: training === "true",
        hasCompletedSetup: setup === "true",
        hasCompletedManagerOTP: managerOTP === "true",
        permissions: permissions
          ? JSON.parse(permissions)
          : {
              pushNotifications: "pending",
              camera: "pending",
              battery: "pending",
              location: "pending",
              backgroundLocation: "pending",
            },
        phoneNumber: phoneNumber,
        userProfile: userProfile ? JSON.parse(userProfile) : null,
        documentUploads: documentUploads ? JSON.parse(documentUploads) : {
          aadhar: { front: null, back: null },
          pan: { front: null, back: null },
        },
        trainingProgress: trainingProgress ? JSON.parse(trainingProgress) : {
          video1: 0,
          video2: 0,
          video3: 0,
          video4: 0,
        },
        locationType: locationType as LocationType,
        selectedShifts: selectedShifts ? JSON.parse(selectedShifts) : [],
        shiftActive: shiftActive === "true",
        shiftStartTime: shiftStartTime ? parseInt(shiftStartTime, 10) : null,
        isLoading: false,
      });
      console.log("Auth state loaded successfully");
    } catch (error) {
      console.error("Error loading auth state:", error);
      setState({
        hasCompletedPermissionOnboarding: false,
        hasCompletedLogin: false,
        hasCompletedProfile: false,
        hasCompletedVerification: false,
        hasCompletedDocuments: false,
        hasCompletedTraining: false,
        hasCompletedSetup: false,
        hasCompletedManagerOTP: false,
        permissions: {
          pushNotifications: "pending",
          camera: "pending",
          battery: "pending",
          location: "pending",
          backgroundLocation: "pending",
        },
        phoneNumber: null,
        userProfile: null,
        documentUploads: {
          aadhar: { front: null, back: null },
          pan: { front: null, back: null },
        },
        trainingProgress: {
          video1: 0,
          video2: 0,
          video3: 0,
          video4: 0,
        },
        locationType: null,
        selectedShifts: [],
        shiftActive: false,
        shiftStartTime: null,
        isLoading: false,
      });
    }
  };

  const setPermission = async (key: keyof PermissionsState, status: PermissionStatus) => {
    const newPermissions = { ...state.permissions, [key]: status };
    setState((prev) => ({ ...prev, permissions: newPermissions }));
    await AsyncStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(newPermissions));
  };

  const completePermissionOnboarding = async () => {
    setState((prev) => ({ ...prev, hasCompletedPermissionOnboarding: true }));
    await AsyncStorage.setItem(STORAGE_KEYS.PERMISSION_ONBOARDING, "true");
  };

  const completeLogin = async (phone: string) => {
    setState((prev) => ({ 
      ...prev, 
      hasCompletedLogin: true,
      phoneNumber: phone,
    }));
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.LOGIN, "true"),
      AsyncStorage.setItem(STORAGE_KEYS.PHONE_NUMBER, phone),
    ]);
  };

  const completeProfile = async (profile: UserProfile) => {
    setState((prev) => ({ 
      ...prev, 
      hasCompletedProfile: true,
      userProfile: profile,
    }));
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.PROFILE, "true"),
      AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile)),
    ]);
  };

  const completeVerification = async () => {
    setState((prev) => ({ 
      ...prev, 
      hasCompletedVerification: true,
    }));
    await AsyncStorage.setItem(STORAGE_KEYS.VERIFICATION, "true");
  };

  const completeDocuments = async () => {
    setState((prev) => ({ 
      ...prev, 
      hasCompletedDocuments: true,
    }));
    await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, "true");
  };

  const updateDocumentUpload = async (docType: "aadhar" | "pan", side: "front" | "back", uri: string) => {
    const newDocuments = {
      ...state.documentUploads,
      [docType]: {
        ...state.documentUploads[docType],
        [side]: uri,
      },
    };
    setState((prev) => ({ ...prev, documentUploads: newDocuments }));
    await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENT_UPLOADS, JSON.stringify(newDocuments));
  };

  const updateTrainingProgress = async (videoId: keyof TrainingProgress, progress: number) => {
    const newProgress = {
      ...state.trainingProgress,
      [videoId]: progress,
    };
    setState((prev) => ({ ...prev, trainingProgress: newProgress }));
    await AsyncStorage.setItem(STORAGE_KEYS.TRAINING_PROGRESS, JSON.stringify(newProgress));
  };

  const completeTraining = async () => {
    setState((prev) => ({ 
      ...prev, 
      hasCompletedTraining: true,
    }));
    await AsyncStorage.setItem(STORAGE_KEYS.TRAINING, "true");
  };

  const setLocationType = async (type: LocationType) => {
    setState((prev) => ({ ...prev, locationType: type }));
    if (type) {
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_TYPE, type);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.LOCATION_TYPE);
    }
  };

  const setSelectedShifts = async (shifts: ShiftSelection[]) => {
    setState((prev) => ({ ...prev, selectedShifts: shifts }));
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_SHIFTS, JSON.stringify(shifts));
  };

  const completeSetup = async () => {
    setState((prev) => ({ 
      ...prev, 
      hasCompletedSetup: true,
    }));
    await AsyncStorage.setItem(STORAGE_KEYS.SETUP, "true");
  };

  const completeManagerOTP = async () => {
    setState((prev) => ({ 
      ...prev, 
      hasCompletedManagerOTP: true,
    }));
    await AsyncStorage.setItem(STORAGE_KEYS.MANAGER_OTP, "true");
  };

  const startShift = async () => {
    const startTime = Date.now();
    setState((prev) => ({ 
      ...prev, 
      shiftActive: true,
      shiftStartTime: startTime,
    }));
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.SHIFT_ACTIVE, "true"),
      AsyncStorage.setItem(STORAGE_KEYS.SHIFT_START_TIME, startTime.toString()),
    ]);
  };

  const endShift = async () => {
    setState((prev) => ({ 
      ...prev, 
      shiftActive: false,
      shiftStartTime: null,
    }));
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.SHIFT_ACTIVE),
      AsyncStorage.removeItem(STORAGE_KEYS.SHIFT_START_TIME),
    ]);
  };

  const skipToLocationSetup = async () => {
    setState((prev) => ({ 
      ...prev,
      hasCompletedPermissionOnboarding: true,
      hasCompletedLogin: true,
      hasCompletedProfile: true,
      hasCompletedVerification: true,
      hasCompletedDocuments: true,
      hasCompletedTraining: true,
    }));
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.PERMISSION_ONBOARDING, "true"),
      AsyncStorage.setItem(STORAGE_KEYS.LOGIN, "true"),
      AsyncStorage.setItem(STORAGE_KEYS.PROFILE, "true"),
      AsyncStorage.setItem(STORAGE_KEYS.VERIFICATION, "true"),
      AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, "true"),
      AsyncStorage.setItem(STORAGE_KEYS.TRAINING, "true"),
    ]);
  };

  const logout = async () => {
    setState((prev) => ({ 
      ...prev, 
      hasCompletedLogin: false,
      hasCompletedProfile: false,
      hasCompletedVerification: false,
      hasCompletedDocuments: false,
      hasCompletedTraining: false,
      hasCompletedSetup: false,
      hasCompletedManagerOTP: false,
      phoneNumber: null,
      userProfile: null,
      documentUploads: {
        aadhar: { front: null, back: null },
        pan: { front: null, back: null },
      },
      trainingProgress: {
        video1: 0,
        video2: 0,
        video3: 0,
        video4: 0,
      },
      locationType: null,
      selectedShifts: [],
      shiftActive: false,
      shiftStartTime: null,
    }));
    await AsyncStorage.removeItem(STORAGE_KEYS.LOGIN);
    await AsyncStorage.removeItem(STORAGE_KEYS.PHONE_NUMBER);
    await AsyncStorage.removeItem(STORAGE_KEYS.PROFILE);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    await AsyncStorage.removeItem(STORAGE_KEYS.VERIFICATION);
    await AsyncStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    await AsyncStorage.removeItem(STORAGE_KEYS.DOCUMENT_UPLOADS);
    await AsyncStorage.removeItem(STORAGE_KEYS.TRAINING);
    await AsyncStorage.removeItem(STORAGE_KEYS.TRAINING_PROGRESS);
    await AsyncStorage.removeItem(STORAGE_KEYS.SETUP);
    await AsyncStorage.removeItem(STORAGE_KEYS.MANAGER_OTP);
    await AsyncStorage.removeItem(STORAGE_KEYS.LOCATION_TYPE);
    await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_SHIFTS);
    await AsyncStorage.removeItem(STORAGE_KEYS.SHIFT_ACTIVE);
    await AsyncStorage.removeItem(STORAGE_KEYS.SHIFT_START_TIME);
  };

  const resetAll = async () => {
    setState({
      hasCompletedPermissionOnboarding: false,
      hasCompletedLogin: false,
      hasCompletedProfile: false,
      hasCompletedVerification: false,
      hasCompletedDocuments: false,
      hasCompletedTraining: false,
      hasCompletedSetup: false,
      hasCompletedManagerOTP: false,
      permissions: {
        pushNotifications: "pending",
        camera: "pending",
        battery: "pending",
        location: "pending",
        backgroundLocation: "pending",
      },
      phoneNumber: null,
      userProfile: null,
      documentUploads: {
        aadhar: { front: null, back: null },
        pan: { front: null, back: null },
      },
      trainingProgress: {
        video1: 0,
        video2: 0,
        video3: 0,
        video4: 0,
      },
      locationType: null,
      selectedShifts: [],
      shiftActive: false,
      shiftStartTime: null,
      isLoading: false,
    });
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PERMISSION_ONBOARDING,
      STORAGE_KEYS.LOGIN,
      STORAGE_KEYS.PROFILE,
      STORAGE_KEYS.VERIFICATION,
      STORAGE_KEYS.DOCUMENTS,
      STORAGE_KEYS.TRAINING,
      STORAGE_KEYS.SETUP,
      STORAGE_KEYS.MANAGER_OTP,
      STORAGE_KEYS.PERMISSIONS,
      STORAGE_KEYS.PHONE_NUMBER,
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.DOCUMENT_UPLOADS,
      STORAGE_KEYS.TRAINING_PROGRESS,
      STORAGE_KEYS.LOCATION_TYPE,
      STORAGE_KEYS.SELECTED_SHIFTS,
      STORAGE_KEYS.SHIFT_ACTIVE,
      STORAGE_KEYS.SHIFT_START_TIME,
    ]);
  };

  const allPermissionsGranted = () => {
    return Object.values(state.permissions).every((status) => status === "allowed");
  };

  return {
    ...state,
    setPermission,
    completePermissionOnboarding,
    completeLogin,
    completeProfile,
    completeVerification,
    completeDocuments,
    updateDocumentUpload,
    updateTrainingProgress,
    completeTraining,
    setLocationType,
    setSelectedShifts,
    completeSetup,
    completeManagerOTP,
    skipToLocationSetup,
    startShift,
    endShift,
    logout,
    resetAll,
    allPermissionsGranted,
  };
});
