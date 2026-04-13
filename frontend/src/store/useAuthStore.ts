import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { io, Socket } from "socket.io-client";

interface UserType {
  _id: string;
  fullName: string;
  email: string;
  profilePic: string;
  createdAt?: string;
  updatedAt?: string;
}

interface useAuth {
  authUser: null | UserType;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: [];
  socket: Socket | null;
  checkAuth: () => void;
  signup: (data: unknown) => void;
  login: (data: unknown) => void;
  logout: () => void;
  updateProfile: (data: unknown) => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
}
const BASE_URL = "http://localhost:5001";

export const useAuthStore = create<useAuth>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/api/auth/check");
      set({ authUser: res.data.user });
      get().connectSocket();
    } catch (error) {
      console.log(error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("api/auth/signup", data);
      toast.success("Account created successfully");
      set({ authUser: res.data.user });
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("api/auth/login", data);
      toast.success("LoggedIn successfully");
      set({ authUser: res.data.user });
      get().connectSocket();
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/api/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/api/auth/update-profile", data);
      set({ authUser: res.data.updatedUser });
      toast.success("Profile updated successfully");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;
    const socket = io(BASE_URL, { query: { userId: authUser._id } });
    socket.connect();
    set({ socket });
    socket.on("getOnlineUsers", (usersIds) => {
      set({ onlineUsers: usersIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket?.disconnect();
    }
  },
}));
