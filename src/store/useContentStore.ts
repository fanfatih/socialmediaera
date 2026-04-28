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
export interface ActivityLog { id: string; created_at: string; user_name: string; action: string; target_name: string; }
export interface Notification { id: string; created_at: string; recipient_role: string; message: string; is_read: boolean; }

interface ContentStore {
  role: 'ADMIN' | 'MANAGER' | 'KARYAWAN' | null;
  currentUser: TeamMember | null;
  setCurrentUser: (user: TeamMember | null) => void;
  logout: () => void;
  monthlyTarget: number;
  contentPillars: string[];
  telegramToken: string;
  isTelegramActive: boolean;
  setTelegramActive: (active: boolean) => void;
  setTelegramToken: (token: string) => void;
  contents: Content[]; accounts: Account[]; bankItems: BankItem[]; pendingMembers: TeamMember[]; activeMembers: TeamMember[];
  logs: ActivityLog[]; notifications: Notification[]; unreadCount: number;
  fetchAllData: () => Promise<void>;
  addContent: (content: Omit<Content, 'id'>) => Promise<void>;
  updateContent: (id: string, updatedData: Partial<Content>) => Promise<void>;
  updateDate: (id: string, newDate: string) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  addLog: (action: string, target: string) => Promise<void>;
  addNotif: (role: string, msg: string) => Promise<void>;
  markNotifAsRead: () => Promise<void>;
  addAccount: (account: any) => Promise<void>;
  updateAccount: (id: string, data: any) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addBankItem: (item: any) => Promise<void>;
  deleteBankItem: (id: string) => Promise<void>;
  approveMember: (id: string) => Promise<void>;
  rejectMember: (id: string) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  updateProfile: (id: string, email: string, password: string) => Promise<boolean>;
}

export const useContentStore = create<ContentStore>()(
  persist(
    (set, get) => ({
      role: null, currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user, role: user ? (user.role as any) : null }),
      logout: () => { set({ role: null, currentUser: null, isTelegramActive: false }); localStorage.clear(); },
      monthlyTarget: 30, contentPillars: [], telegramToken: "", isTelegramActive: false,
      setTelegramActive: (active) => set({ isTelegramActive: active }),
      setTelegramToken: (token) => set({ telegramToken: token }),
      contents: [], accounts: [], bankItems: [], pendingMembers: [], activeMembers: [],
      logs: [], notifications: [], unreadCount: 0,

      addLog: async (action, target) => {
        try {
          const user = get().currentUser?.name || "System";
          await supabase.from('activity_logs').insert([{ user_name: user, action, target_name: target }]);
        } catch (e) { console.error("Gagal catat log:", e); }
      },

      addNotif: async (role, message) => {
        try {
          await supabase.from('notifications').insert([{ recipient_role: role, message }]);
        } catch (e) { console.error("Gagal kirim notif:", e); }
      },

      markNotifAsRead: async () => {
        const role = get().role;
        if (!role) return;
        await supabase.from('notifications').update({ is_read: true }).eq('recipient_role', role);
        get().fetchAllData();
      },

      fetchAllData: async () => {
        const { data: contents } = await supabase.from('contents').select('*').order('created_at', { ascending: false });
        const { data: accounts } = await supabase.from('accounts').select('*').order('last_updated_at', { ascending: false });
        const { data: bankItems } = await supabase.from('bank_items').select('*').order('date_added', { ascending: false });
        const { data: pendingMembers } = await supabase.from('team_members').select('*').eq('status', 'pending');
        const { data: activeMembers } = await supabase.from('team_members').select('*').eq('status', 'approved');
        const { data: logs } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(20);
        const { data: notifs } = await supabase.from('notifications').select('*').eq('recipient_role', get().role).order('created_at', { ascending: false }).limit(10);
        const { data: settings } = await supabase.from('app_settings').select('*').eq('id', 1).single();

        set({ 
          contents: contents?.map(c => ({
            ...c, 
            publishDate: c.publish_date, 
            referenceUrl: c.reference_url, 
            linkVideo: c.link_video, 
            revisionNote: c.revision_note, 
            liveUrl: c.live_url
          })) || [],
          accounts: accounts?.map(a => ({...a, lastUpdatedBy: a.last_updated_by, lastUpdatedAt: a.last_updated_at})) || [], 
          bankItems: bankItems?.map(b => ({...b, dateAdded: b.date_added})) || [],
          pendingMembers: pendingMembers || [],
          activeMembers: activeMembers || [],
          logs: logs || [],
          notifications: notifs || [],
          unreadCount: notifs?.filter(n => !n.is_read).length || 0,
          monthlyTarget: settings?.monthly_target || 30,
          telegramToken: settings?.telegram_token || ""
        });
      },

      addContent: async (content) => {
        const { error } = await supabase.from('contents').insert([{ 
          title: content.title,
          status: content.status,
          publish_date: content.publishDate,
          platforms: content.platforms,
          pillar: content.pillar,
          reference_url: content.referenceUrl,
          caption: content.caption,
          copywriting: content.copywriting,
          link_video: content.linkVideo
        }]);
        if (!error) {
          get().addLog("Membuat Jadwal", content.title);
          get().fetchAllData();
        } else {
          console.error("Gagal simpan konten:", error);
          alert("Gagal menyimpan: " + error.message);
        }
      },

      updateContent: async (id, updatedData) => {
        const dbPayload: any = {
          title: updatedData.title,
          status: updatedData.status,
          publish_date: updatedData.publishDate,
          platforms: updatedData.platforms,
          pillar: updatedData.pillar,
          reference_url: updatedData.referenceUrl,
          caption: updatedData.caption,
          copywriting: updatedData.copywriting,
          link_video: updatedData.linkVideo,
          revision_note: updatedData.revisionNote,
          live_url: updatedData.liveUrl,
          views: updatedData.views,
          likes: updatedData.likes,
          comments: updatedData.comments,
          shares: updatedData.shares
        };
        // Hapus data yang kosong/undefined agar tidak merusak DB
        Object.keys(dbPayload).forEach(key => dbPayload[key] === undefined && delete dbPayload[key]);

        const { error } = await supabase.from('contents').update(dbPayload).eq('id', id);
        if (!error) {
          get().addLog("Memperbarui Konten", updatedData.title || "ID: " + id);
          if (updatedData.status === "Ready to Publish") get().addNotif("MANAGER", `Konten "${updatedData.title}" butuh persetujuan!`);
          if (updatedData.status === "Rejected") get().addNotif("KARYAWAN", `Konten "${updatedData.title}" butuh revisi.`);
          get().fetchAllData();
        }
      },

      updateDate: async (id, newDate) => {
        const { error } = await supabase.from('contents').update({ publish_date: newDate }).eq('id', id);
        if (!error) {
          get().addLog("Geser Jadwal", "ID: " + id);
          get().fetchAllData();
        }
      },

      deleteContent: async (id) => {
        const { error } = await supabase.from('contents').delete().eq('id', id);
        if (!error) {
          get().addLog("Menghapus Konten", "ID: " + id);
          get().fetchAllData();
        }
      },

      addAccount: async (account) => {
        const { error } = await supabase.from('accounts').insert([{ platform: account.platform, username: account.username, password: account.password, last_updated_by: account.lastUpdatedBy, last_updated_at: account.lastUpdatedAt }]);
        if (!error) get().fetchAllData();
      },

      updateAccount: async (id, updatedData) => {
        const { error } = await supabase.from('accounts').update({ 
          platform: updatedData.platform,
          username: updatedData.username,
          password: updatedData.password,
          last_updated_by: updatedData.lastUpdatedBy,
          last_updated_at: updatedData.lastUpdatedAt
        }).eq('id', id);
        if (!error) get().fetchAllData();
      },

      deleteAccount: async (id) => { await supabase.from('accounts').delete().eq('id', id); get().fetchAllData(); },
      addBankItem: async (item) => { await supabase.from('bank_items').insert([{ url: item.url, note: item.note, source: item.source, date_added: item.dateAdded }]); get().fetchAllData(); },
      deleteBankItem: async (id) => { await supabase.from('bank_items').delete().eq('id', id); get().fetchAllData(); },
      approveMember: async (id) => { await supabase.from('team_members').update({ status: 'approved' }).eq('id', id); get().fetchAllData(); },
      rejectMember: async (id) => { await supabase.from('team_members').update({ status: 'rejected' }).eq('id', id); get().fetchAllData(); },
      deleteMember: async (id) => { await supabase.from('team_members').delete().eq('id', id); get().fetchAllData(); },
      updateProfile: async (id, email, password) => {
        const { error } = await supabase.from('team_members').update({ email, password }).eq('id', id);
        if (!error) {
          set((state) => ({ currentUser: state.currentUser ? { ...state.currentUser, email, password } : null }));
          return true;
        }
        return false;
      }
    }),
    { name: 'workspace-auth', partialize: (state) => ({ role: state.role, currentUser: state.currentUser, isTelegramActive: state.isTelegramActive }) }
  )
);