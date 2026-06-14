import supabase from "./supabase";

// 🔐 تسجيل حساب جديد
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return { data, error };
};

// 🔐 تسجيل دخول
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

// 🔐 تسجيل خروج
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// 👤 جلب المستخدم الحالي
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user;
};