import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export type Status = 'Idea' | 'In Development' | 'Process' | 'Ready to Publish' | 'Approved' | 'Rejected' | 'Published';
export type Platform = 'IG' | 'FB' | 'TT';
export type Pillar = 'Entertaint' | 'Promosi' | 'Edukasi' | 'Inspirasi';

export interface Content { id: string; title: string; status: Status; publishDate: string; platforms: Platform[]; pillar: Pillar; referenceUrl?: string; caption?: string; copywriting?: string; linkVideo?: string; revisionNote?: string; liveUrl?: string; views?: number; likes?: number; comments?: number; shares?: number; }
export interface Account { id: string; platform: string; username: string; password: string; lastUpdatedBy: string; lastUpdatedAt: string; }
export interface BankItem { id: string; url: string; note: string; dateAdded: string; source: 'Manual' | 'Telegram'; }
export interface TeamMember { id: string; name: string; email: string; password?: string; role: string; status: string; }

interface ContentStore {
  role: 'ADMIN' | 'MANAGER' | 'KARYAWAN' | null;
  currentUser: TeamMember | null; // MEMORI BARU: Simpan data lengkap user
  setCurrentUser: (user: TeamMember | null) => void; // FUNGSI BARU
  logout: () => void;
  
  contents: Content[]; accounts: Account[]; bankItems: BankItem[]; pendingMembers: TeamMember[]; activeMembers: TeamMember[];

  fetchAllData: () => Promise<void>;
  
  addContent: (content: Omit<Content, 'id'> & { id?: string }) => Promise<void>;
  updateContent: (id: string, updatedData: Partial<Content>) => Promise<void>;
  updateDate: (id: string, newDate: string) => Promise<void>; 
  deleteContent: (id: string) => Promise<void>;

  addAccount: (account: Omit<Account, 'id'> & { id?: string }) => Promise<void>;
  updateAccount: (id: string, updatedData: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  addBankItem: (item: Omit<BankItem, 'id'> & { id?: string }) => Promise<void>;
  deleteBankItem: (id: string) => Promise<void>;

  approveMember: (id: string) => Promise<void>;
  rejectMember: (id: string) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  
  updateProfile: (id: string, email: string, password: string) => Promise<boolean>; // FUNGSI BARU: Ganti Password
}

export const useContentStore = create<ContentStore>()(
  persist(
    (set, get) => ({
      role: null,
      currentUser: null,
      
      setCurrentUser: (user) => set({ 
        currentUser: user, 
        role: user ? (user.role as any) : null 
      }),
      
      logout: () => {
        set({ role: null, currentUser: null });
        localStorage.removeItem('workspace-auth');
        sessionStorage.removeItem('workspace-auth');
      },
      
      contents: [], accounts: [], bankItems: [], pendingMembers: [], activeMembers: [],

      fetchAllData: async () => {
        const { data: contents } = await supabase.from('contents').select('*').order('created_at', { ascending: false });
        const { data: accounts } = await supabase.from('accounts').select('*').order('last_updated_at', { ascending: false });
        const { data: bankItems } = await supabase.from('bank_items').select('*').order('date_added', { ascending: false });
        const { data: pendingMembers } = await supabase.from('team_members').select('*').eq('status', 'pending');
        const { data: activeMembers } = await supabase.from('team_members').select('*').eq('status', 'approved');

        set({ 
          contents: contents?.map(c => ({...c, publishDate: c.publish_date, referenceUrl: c.reference_url, linkVideo: c.link_video, revisionNote: c.revision_note, liveUrl: c.live_url})) || [], 
          accounts: accounts?.map(a => ({...a, lastUpdatedBy: a.last_updated_by, lastUpdatedAt: a.last_updated_at})) || [], 
          bankItems: bankItems?.map(b => ({...b, dateAdded: b.date_added})) || [],
          pendingMembers: pendingMembers || [],
          activeMembers: activeMembers || []
        });
      },

      addContent: async (content) => {
        const { error } = await supabase.from('contents').insert([{ title: content.title, status: content.status, publish_date: content.publishDate, platforms: content.platforms, pillar: content.pillar, reference_url: content.referenceUrl, caption: content.caption, copywriting: content.copywriting, link_video: content.linkVideo }]);
        if (error) { console.error(error); alert("Gagal menyimpan jadwal."); } else get().fetchAllData();
      },

      updateContent: async (id, updatedData) => {
        const dbPayload: any = { title: updatedData.title, status: updatedData.status, publish_date: updatedData.publishDate, platforms: updatedData.platforms, pillar: updatedData.pillar, reference_url: updatedData.referenceUrl, caption: updatedData.caption, copywriting: updatedData.copywriting, link_video: updatedData.linkVideo, revision_note: updatedData.revisionNote, live_url: updatedData.liveUrl, views: updatedData.views, likes: updatedData.likes, comments: updatedData.comments, shares: updatedData.shares };
        Object.keys(dbPayload).forEach(key => dbPayload[key] === undefined && delete dbPayload[key]);
        const { error } = await supabase.from('contents').update(dbPayload).eq('id', id);
        if (!error) get().fetchAllData();
      },

      updateDate: async (id, newDate) => {
        const { error } = await supabase.from('contents').update({ publish_date: newDate }).eq('id', id);
        if (!error) get().fetchAllData();
      },

      deleteContent: async (id) => {
        const { error } = await supabase.from('contents').delete().eq('id', id);
        if (!error) get().fetchAllData();
      },

      addAccount: async (account) => {
        const { error } = await supabase.from('accounts').insert([{ platform: account.platform, username: account.username, password: account.password, last_updated_by: account.lastUpdatedBy, last_updated_at: account.lastUpdatedAt }]);
        if (!error) get().fetchAllData();
      },

      updateAccount: async (id, updatedData) => {
        const dbPayload: any = { platform: updatedData.platform, username: updatedData.username, password: updatedData.password, last_updated_by: updatedData.lastUpdatedBy, last_updated_at: updatedData.lastUpdatedAt };
        Object.keys(dbPayload).forEach(key => dbPayload[key] === undefined && delete dbPayload[key]);
        const { error } = await supabase.from('accounts').update(dbPayload).eq('id', id);
        if (!error) get().fetchAllData();
      },

      deleteAccount: async (id) => {
        const { error } = await supabase.from('accounts').delete().eq('id', id);
        if (!error) get().fetchAllData();
      },

      addBankItem: async (item) => {
        const { error } = await supabase.from('bank_items').insert([{ url: item.url, note: item.note, source: item.source, date_added: item.dateAdded }]);
        if (!error) get().fetchAllData();
      },

      deleteBankItem: async (id) => {
        const { error } = await supabase.from('bank_items').delete().eq('id', id);
        if (!error) get().fetchAllData();
      },

      approveMember: async (id) => {
        const { error } = await supabase.from('team_members').update({ status: 'approved' }).eq('id', id);
        if (!error) { alert("Akun di-Approve!"); get().fetchAllData(); }
      },
      
      rejectMember: async (id) => {
        const { error } = await supabase.from('team_members').update({ status: 'rejected' }).eq('id', id);
        if (!error) { alert("Akun ditolak."); get().fetchAllData(); }
      },
      
      deleteMember: async (id) => {
        const { error } = await supabase.from('team_members').delete().eq('id', id);
        if (!error) { alert("Akun dihapus permanen."); get().fetchAllData(); } else alert("Gagal menghapus.");
      },

      // FUNGSI UPDATE PROFIL (EMAIL & PASSWORD)
      updateProfile: async (id, email, password) => {
        const { error } = await supabase.from('team_members').update({ email, password }).eq('id', id);
        if (!error) {
          alert("Profil berhasil diperbarui!");
          // Update juga data di memori browser
          set((state) => ({ currentUser: state.currentUser ? { ...state.currentUser, email, password } : null }));
          return true;
        } else {
          alert("Gagal memperbarui. Mungkin email sudah dipakai orang lain.");
          return false;
        }
      }
    }),
    {
      name: 'workspace-auth',
      // Simpan role DAN currentUser ke local storage agar ingat siapa yang login
      partialize: (state) => ({ role: state.role, currentUser: state.currentUser }),
    }
  )
);